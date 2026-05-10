import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl, Linking, Animated, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTutorials, deleteTutorial } from '../../services/db';
import { useTranslation } from '../../context/ConfigContext';
import { useToast } from '../../context/ToastContext';
import Icon from 'react-native-vector-icons/Ionicons';
import PostCard from '../../components/PostCard';
import PostCommentsModal from '../../components/PostCommentsModal';
import { useTheme } from '../../context/ConfigContext';
import { useAuth } from '../../context/AuthContext';
import MainHeader from '../../components/MainHeader';
import BannerCard from '../../components/BannerCard';
import { getBannersForUser, Banner } from '../../services/db';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCommunity } from '../../context/CommunityContext';

export default function TutorialsScreen({ navigation }: any) {
  const { tutorials, loading, refreshTutorials } = useCommunity();
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'recientes' | 'relevantes'>('recientes');
  const [sortContainerWidth, setSortContainerWidth] = useState(0);
  const sortTranslateX = useRef(new Animated.Value(0)).current;
  const sortScale = useRef(new Animated.Value(1)).current;
  const { t } = useTranslation();
  const toast = useToast();
  const { profile } = useAuth();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [banners, setBanners] = useState<Banner[]>([]);
  const [dismissedBanners, setDismissedBanners] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (sortContainerWidth > 0) {
      const targetX = sortBy === 'recientes' ? 0 : (sortContainerWidth - 16) / 2;
      
      // Movimiento lateral
      Animated.spring(sortTranslateX, {
        toValue: targetX,
        useNativeDriver: true,
        stiffness: 150,
        damping: 18,
        mass: 0.8,
      }).start();

      // Efecto elástico
      Animated.sequence([
        Animated.timing(sortScale, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(sortScale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [sortBy, sortContainerWidth]);

  // Animación del Hero
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const headerAnim = useRef(new Animated.Value(0)).current; // 0 = visible, -100 = oculto

  const startAnimation = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(-50);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  };

  useFocusEffect(
    useCallback(() => {
      refreshTutorials(false);
      // Pequeño retraso para que la animación se vea fluida al entrar
      const timer = setTimeout(startAnimation, 100);
      
      // Carga de banners
      if (profile?.id) {
        const loadBanners = async () => {
          const res = await getBannersForUser(profile.id);
          if (res.data) {
            const dismissedRaw = await AsyncStorage.getItem('dismissed_banners');
            const dismissed: string[] = dismissedRaw ? JSON.parse(dismissedRaw) : [];
            const visible = res.data.filter(b => !dismissed.includes(b.id));
            setBanners(visible);
            setDismissedBanners(new Set(dismissed));
          }
        };
        loadBanners();
      }
      
      return () => clearTimeout(timer);
    }, [refreshTutorials, profile?.id])
  );

  const handleDismissBanner = async (id: string) => {
    const updated = new Set(dismissedBanners);
    updated.add(id);
    setDismissedBanners(updated);
    setBanners(prev => prev.filter(b => b.id !== id));
    await AsyncStorage.setItem('dismissed_banners', JSON.stringify(Array.from(updated)));
  };

  const openVideo = (url: string) => {
    if (url) Linking.openURL(url).catch((err: any) => console.error("Couldn't load page", err));
  };

  const handlePublish = () => {
    navigation.navigate('PublishPost', { profile });
  };

  const handleDelete = async (id: string) => {
    const res = await deleteTutorial(id);
    if (res.success) {
      toast.success('Eliminado', 'La publicación fue eliminada.');
      await refreshTutorials(true);
    } else {
      toast.error('Error', 'No se pudo eliminar la publicación.');
    }
  };

  const handleEdit = (item: any) => {
    navigation.navigate('PublishPost', { profile, postToEdit: item });
  };

  // Manejo del scroll para ocultar/mostrar el header
  const lastOffset = useRef(0);
  const isHeaderVisible = useRef(true);
  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    const direction = currentOffset > lastOffset.current ? 'down' : 'up';

    if (Math.abs(currentOffset - lastOffset.current) > 5) {
      if (direction === 'down' && currentOffset > 150 && isHeaderVisible.current) {
        // Solo ocultamos si está visible
        isHeaderVisible.current = false;
        Animated.timing(headerAnim, {
          toValue: -120,
          duration: 250,
          useNativeDriver: true,
        }).start();
      } else if (direction === 'up' && !isHeaderVisible.current) {
        // Solo mostramos si está oculto
        isHeaderVisible.current = true;
        Animated.timing(headerAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }
      lastOffset.current = currentOffset;
    }
  };

  const renderItem = useCallback(({ item }: any) => (
    <PostCard
      item={item}
      profile={profile}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCommentPress={(postId: string) => setActiveCommentPostId(postId)}
    />
  ), [profile, handleEdit, handleDelete]);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="planet-outline" size={80} color={colors.border} />
      <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>¡Sé el primero en publicar!</Text>
      <Text style={[styles.emptyText, { color: colors.textMuted }]}>La comunidad está esperando ver tus técnicas y procesos creativos.</Text>
    </View>
  );

  // useMemo: el sort solo se recalcula cuando cambian los tutorials o el criterio de orden
  const sortedTutorials = useMemo(() => {
    return [...tutorials].sort((a, b) => {
      if (sortBy === 'relevantes') {
        const scoreA = (a.likesCount || 0) + (a.commentsCount || 0) + (a.sharesCount || 0);
        const scoreB = (b.likesCount || 0) + (b.commentsCount || 0) + (b.sharesCount || 0);
        if (scoreA !== scoreB) return scoreB - scoreA;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tutorials, sortBy]);

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Notificación de Banner Flotante */}
      <View style={{ position: 'absolute', top: Math.max(insets.top, 15), left: 0, right: 0, zIndex: 10001 }}>
        {banners.map((banner) => (
          <BannerCard 
            key={banner.id} 
            banner={banner} 
            onDismiss={handleDismissBanner} 
          />
        ))}
      </View>

      <Animated.View style={[styles.headerContainer, { transform: [{ translateY: headerAnim }] }]}>
        <MainHeader
          navigation={navigation}
          route={{ name: 'Tutorials', key: 'tutorials' } as any}
          options={{ title: 'Artemanía' } as any}
          back={undefined}
        />
      </Animated.View>
      {loading && tutorials.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={sortedTutorials}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={tutorials.length === 0 ? styles.emptyListContent : styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          windowSize={5}
          initialNumToRender={4}
          refreshControl={
            <RefreshControl 
              refreshing={loading} 
              onRefresh={() => refreshTutorials(true)} 
              tintColor={colors.primary} 
              progressViewOffset={Platform.OS === 'android' ? 120 : 0}
            />
          }
          ListHeaderComponent={
            <View style={[styles.communityHero, { backgroundColor: colors.background }]}>
              <Animated.View style={[
                styles.heroContent,
                { backgroundColor: colors.primary, shadowColor: colors.primary },
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}>
                <View style={styles.heroBadge}>
                  <Icon name="people" size={12} color="#fff" />
                  <Text style={styles.heroBadgeText}>Social</Text>
                </View>
                <Text style={styles.heroTitle}>Muro de la{'\n'}Comunidad</Text>
                <Text style={styles.heroSubtitle}>Descubre técnicas y comparte tu talento con otros artesanos.</Text>
              </Animated.View>

              <View style={styles.sortSection}>
                <View 
                  style={[styles.sortContainer, { backgroundColor: colors.surface, shadowColor: colors.border }]}
                  onLayout={(e) => setSortContainerWidth(e.nativeEvent.layout.width)}
                >
                  {/* Burbuja Animada */}
                  {sortContainerWidth > 0 && (
                    <Animated.View 
                      style={[
                        styles.sortBubble,
                        { backgroundColor: colors.primary },
                        {
                          width: (sortContainerWidth - 16) / 2,
                          transform: [
                            { translateX: sortTranslateX },
                            { scale: sortScale }
                          ]
                        }
                      ]}
                    />
                  )}

                  <TouchableOpacity
                    style={styles.sortBtn}
                    onPress={() => setSortBy('recientes')}
                  >
                    <Icon name="time-outline" size={16} color={sortBy === 'recientes' ? '#fff' : colors.textMuted} />
                    <Text style={[styles.sortText, { color: colors.textMuted }, sortBy === 'recientes' && styles.sortTextActive]}>Recientes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.sortBtn}
                    onPress={() => setSortBy('relevantes')}
                  >
                    <Icon name="flame-outline" size={16} color={sortBy === 'relevantes' ? '#fff' : colors.textMuted} />
                    <Text style={[styles.sortText, { color: colors.textMuted }, sortBy === 'relevantes' && styles.sortTextActive]}>Populares</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          }
        />
      )}

      {profile && (
        <TouchableOpacity style={[styles.fab, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handlePublish}>
          <Icon name="pencil" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      <PostCommentsModal
        visible={!!activeCommentPostId}
        postId={activeCommentPostId}
        postAuthorId={tutorials.find(p => p.id === activeCommentPostId)?.autorId}
        postTitle={tutorials.find(p => p.id === activeCommentPostId)?.titulo}
        onClose={() => setActiveCommentPostId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingVertical: 0, paddingBottom: 120, paddingTop: 95 }, // Añadido paddingTop para dejar espacio al header flotante
  emptyListContent: { flexGrow: 1, padding: 20, paddingTop: 120 },

  communityHero: { paddingBottom: 25 },
  heroContent: { paddingHorizontal: 25, paddingVertical: 40, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 8 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 15 },
  heroBadgeText: { color: '#fff', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginLeft: 6 },
  heroTitle: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: -1, lineHeight: 40 },
  heroSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 12, lineHeight: 22, maxWidth: '85%' },

  sortSection: { paddingHorizontal: 20, marginTop: -20, zIndex: 10 },
  sortContainer: { flexDirection: 'row', gap: 12, padding: 8, borderRadius: 30, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4, position: 'relative' },
  sortBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 25, zIndex: 2 },
  sortBubble: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    left: 8,
    borderRadius: 25,
    zIndex: 1
  },
  sortText: { fontSize: 13, fontWeight: '700', marginLeft: 8 },
  sortTextActive: { color: '#fff' },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  emptyText: { fontSize: 15, textAlign: 'center', marginTop: 8, paddingHorizontal: 20, lineHeight: 22 },

  fab: { position: 'absolute', bottom: 100, right: 20, width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8, zIndex: 100 },

  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  }
});
