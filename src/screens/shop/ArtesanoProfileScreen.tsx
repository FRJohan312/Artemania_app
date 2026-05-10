import { SafeAreaView } from { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getProducts, getAllReviews, getTutorialsByUser, getUserProfile, getOrCreateChat } from '../../services/db';
import Icon from 'react-native-vector-icons/Ionicons';
import { auth } from '../../services/firebaseConnection';
import ReportModal from '../../components/ReportModal';
import PostCard from '../../components/PostCard';
import PostCommentsModal from '../../components/PostCommentsModal';
import { useTranslation, useTheme } from '../../context/ConfigContext';
import { useToast } from '../../context/ToastContext';

const { width } = Dimensions.get('window');

export default function ArtesanoProfileScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors, themeMode, toggleThemeMode } = useTheme();
  const toast = useToast();
  // `artesano` can be a partial object (id, nombre, foto) si viene de PostCard
  const { artesano, profile: currentUserProfile } = route.params;
  const [profileData, setProfileData] = useState<any>(artesano);
  const [products, setProducts] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [avgRating, setAvgRating] = useState('0.0');

  // Tabs state
  const isCliente = profileData?.tipo === 'Cliente';
  const [activeTab, setActiveTab] = useState<'obras' | 'posts'>(isCliente ? 'posts' : 'obras');
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  const userId = auth.currentUser?.uid;
  const isOwner = userId === artesano.id;

  const fetchData = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else if (products.length === 0 && posts.length === 0) setLoading(true);

    // Cargar perfil real
    const profileRes = await getUserProfile(artesano.id, refresh);
    const realProfile = profileRes.data || artesano;
    setProfileData(realProfile);

    if (realProfile.tipo === 'Cliente') {
      setActiveTab('posts');
    }

    const [prodRes, revRes, postRes] = await Promise.all([
      getProducts(artesano.id, false, refresh),
      getAllReviews(),
      getTutorialsByUser(artesano.id, refresh)
    ]);

    if (prodRes.data) {
      setProducts(prodRes.data);
      if (revRes.data && prodRes.data.length > 0) {
        const productIds = prodRes.data.map((p: any) => p.id);
        const artisanReviews = revRes.data.filter((r: any) => productIds.includes(r.productId));
        if (artisanReviews.length > 0) {
          const avg = artisanReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / artisanReviews.length;
          setAvgRating(avg.toFixed(1));
        } else {
          setAvgRating('Nuevo');
        }
      } else {
        setAvgRating('Nuevo');
      }
    }

    if (postRes.data) {
      const sortedPosts = postRes.data.sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setPosts(sortedPosts);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      if (artesano) fetchData(false);
    }, [artesano])
  );

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={colors.primary} />}
      >
        <View style={[styles.headerCover, { backgroundColor: colors.primary }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.themeToggleBtn}
            onPress={toggleThemeMode}
          >
            <Icon name={themeMode === 'light' ? "moon" : "sunny"} size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={[styles.profileSection, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <View style={[styles.avatarWrapper, { backgroundColor: colors.surface, borderColor: colors.surface }]}>
            {profileData.foto ? (
              <Image source={{ uri: profileData.foto }} style={styles.avatarImg} />
            ) : (
              <Icon name="person" size={60} color={colors.textMuted} />
            )}
          </View>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{profileData.nombre}</Text>
          {profileData.pronombres ? <Text style={[styles.pronouns, { color: colors.textMuted }]}>{profileData.pronombres}</Text> : null}
          <Text style={[styles.bio, { color: colors.textSecondary }]}>
            {profileData.bio || (profileData.tipo === 'Cliente' ? 'A este usuario le encanta explorar Artemanía.' : 'Este artesano aún no ha agregado una biografía, pero sus obras hablan por sí solas.')}
          </Text>

          <TouchableOpacity 
            style={[
              styles.messageBtn,
              {
                backgroundColor: isOwner ? colors.divider : colors.primary,
                opacity: isOwner ? 0.4 : 1,
              }
            ]}
            disabled={isOwner}
            onPress={async () => {
              // Guard: invitado
              if (!currentUserProfile) {
                toast.confirm({
                  type: 'info',
                  title: '💬 Mensajes Artemanía',
                  message: 'Para enviar mensajes debes iniciar sesión primero.',
                  confirmText: 'Iniciar Sesión',
                  cancelText: 'Más tarde',
                  onConfirm: () => navigation.navigate('Login'),
                });
                return;
              }
              // Crear o recuperar el chat
              const { chatId, error } = await getOrCreateChat(
                { id: currentUserProfile.id, nombre: currentUserProfile.nombre, foto: currentUserProfile.foto },
                { id: profileData.id, nombre: profileData.nombre, foto: profileData.foto },
              );
              if (chatId) {
                const routes = navigation.getState()?.routes;
                const prevRoute = routes?.[routes?.length - 2];
                if (prevRoute?.name === 'Chat' && prevRoute.params?.chatId === chatId) {
                  navigation.goBack();
                } else {
                  navigation.navigate('Chat', {
                    chatId,
                    otherUser: {
                      id:     profileData.id,
                      nombre: profileData.nombre,
                      foto:   profileData.foto || '',
                    },
                  });
                }
              } else {
                toast.error('Error', error || 'No se pudo abrir el chat.');
              }
            }}
          >
            <Icon 
              name="chatbubble-ellipses-outline" 
              size={20} 
              color={isOwner ? colors.textMuted : '#fff'} 
              style={{ marginRight: 8 }} 
            />
            <Text style={[styles.messageBtnText, { color: isOwner ? colors.textMuted : '#fff' }]}>Enviar Mensaje</Text>
          </TouchableOpacity>

          <View style={[styles.statsRow, { borderTopColor: colors.divider }]}>
            {profileData.tipo !== 'Cliente' && (
              <>
                <View style={styles.statBox}>
                  <Text style={[styles.statNum, { color: colors.primary }]}>{products.length}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Obras</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statNum, { color: colors.primary }]}>{avgRating}</Text>
                  <Text style={[styles.statLabel, { color: colors.textMuted }]}>Calificación</Text>
                </View>
              </>
            )}
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{posts.length}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Posts</Text>
            </View>
          </View>

          {!isOwner && (
            <TouchableOpacity 
              style={styles.reportBtn} 
              onPress={() => {
                if (!currentUserProfile) {
                  toast.confirm({
                    type: 'info',
                    title: '🛡️ Seguridad Artemanía',
                    message: 'Para reportar un perfil y ayudarnos a proteger a nuestra comunidad, por favor inicia sesión primero. ✨',
                    confirmText: 'Ir a Iniciar Sesión',
                    cancelText: 'Más tarde',
                    onConfirm: () => navigation.navigate('Login')
                  });
                } else {
                  setShowReportModal(true);
                }
              }}
            >
              <Icon name="flag-outline" size={16} color="#adb5bd" />
              <Text style={styles.reportText}>Reportar Perfil</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.tabsContainer, { backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
          {profileData.tipo !== 'Cliente' && (
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'obras' && { borderBottomColor: colors.primary }]}
              onPress={() => setActiveTab('obras')}
            >
              <Icon name="color-palette-outline" size={20} color={activeTab === 'obras' ? colors.primary : colors.textMuted} />
              <Text style={[styles.tabText, { color: activeTab === 'obras' ? colors.primary : colors.textMuted }]}>Obras</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'posts' && { borderBottomColor: colors.primary }]}
            onPress={() => setActiveTab('posts')}
          >
            <Icon name="document-text-outline" size={20} color={activeTab === 'posts' ? colors.primary : colors.textMuted} />
            <Text style={[styles.tabText, { color: activeTab === 'posts' ? colors.primary : colors.textMuted }]}>Posts</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.contentContainer}>
            {activeTab === 'obras' && profileData.tipo !== 'Cliente' && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsScroll}>
                {products.map(prod => (
                  <TouchableOpacity
                    key={prod.id}
                    style={[styles.pCard, { backgroundColor: colors.surface }]}
                    onPress={() => navigation.navigate('ProductDetail', { product: prod, profile: currentUserProfile, isCliente: currentUserProfile?.tipo === 'Cliente' || !currentUserProfile?.tipo })}
                  >
                    <View style={[styles.pImgWrapper, { backgroundColor: colors.divider }]}>
                      {prod.imagen ? (
                        <Image source={{ uri: prod.imagen }} style={styles.pImg} />
                      ) : (
                        <Icon name="image-outline" size={40} color={colors.textMuted} />
                      )}
                    </View>
                    <View style={styles.pInfo}>
                      <Text style={[styles.pName, { color: colors.textPrimary }]} numberOfLines={1}>{prod.nombre}</Text>
                      <Text style={[styles.pPrice, { color: colors.primary }]}>${Math.round(prod.precio || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {products.length === 0 && (
                  <View style={styles.emptyState}>
                    <Icon name="cube-outline" size={50} color={colors.border} />
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>Este artesano aún no ha publicado obras.</Text>
                  </View>
                )}
              </ScrollView>
            )}

            {activeTab === 'posts' && (
              <View style={styles.postsList}>
                {posts.map(post => (
                  <PostCard
                    key={post.id}
                    item={post}
                    profile={currentUserProfile}
                    onCommentPress={(postId: string) => setActiveCommentPostId(postId)}
                  />
                ))}
                {posts.length === 0 && (
                  <View style={styles.emptyState}>
                    <Icon name="chatbubbles-outline" size={50} color={colors.border} />
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>No hay publicaciones aún.</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <ReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={artesano.id}
        targetType="usuario"
        targetName={profileData.nombre}
      />

      <PostCommentsModal
        visible={!!activeCommentPostId}
        postId={activeCommentPostId}
        onClose={() => setActiveCommentPostId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerCover: { height: 180, position: 'relative' },
  backBtn: { position: 'absolute', top: 45, left: 20, width: 44, height: 44, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 22, justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  themeToggleBtn: { position: 'absolute', top: 45, right: 20, width: 44, height: 44, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 22, justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  profileSection: { borderTopLeftRadius: 35, borderTopRightRadius: 35, marginTop: -35, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  avatarWrapper: { width: 130, height: 130, borderRadius: 65, marginTop: -90, justifyContent: 'center', alignItems: 'center', borderWidth: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  name: { fontSize: 26, fontWeight: '800', marginTop: 15 },
  pronouns: { fontSize: 14, marginBottom: 15, fontStyle: 'italic' },
  bio: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  messageBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 25, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
  messageBtnText: { fontWeight: 'bold', fontSize: 15 },
  statsRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-around', paddingTop: 20, borderTopWidth: 1 },
  statBox: { alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '900' },
  statLabel: { fontSize: 14, marginTop: 5 },

  tabsContainer: { flexDirection: 'row', marginTop: 15, borderBottomWidth: 1 },
  tabBtn: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  tabText: { fontSize: 15, fontWeight: '600', marginLeft: 8 },

  contentContainer: { paddingTop: 20, paddingBottom: 40 },
  productsScroll: { paddingHorizontal: 15 },
  pCard: { width: 160, borderRadius: 16, marginRight: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 3, overflow: 'hidden' },
  pImgWrapper: { height: 180, justifyContent: 'center', alignItems: 'center' },
  pImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  pInfo: { padding: 15 },
  pName: { fontSize: 15, fontWeight: 'bold', marginBottom: 5 },
  pPrice: { fontSize: 16, fontWeight: '900' },

  postsList: { paddingHorizontal: 0 },

  emptyState: { width: width - 30, paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 15, marginTop: 10, fontStyle: 'italic', textAlign: 'center' },

  reportBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  reportText: { fontSize: 13, color: '#adb5bd', marginLeft: 6, textDecorationLine: 'underline' }
});
