import { SafeAreaView } from { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getTutorials } from '../../services/db';
import { useLikedPosts } from '../../context/LikedPostsContext';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import PostCard from '../../components/PostCard';
import PostCommentsModal from '../../components/PostCommentsModal';
import { useTheme } from '../../context/ConfigContext';

export default function LikedPostsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const { likedPosts, loading: contextLoading } = useLikedPosts();
  const { profile } = useAuth();
  const { colors } = useTheme();

  const loadSavedPosts = async () => {
    setLoading(true);
    // Para simplificar, obtenemos todos los tutoriales y filtramos localmente.
    // En una app a gran escala, se haría un query específico o se usaría 'documentId() in likedPosts'
    const { data } = await getTutorials();
    if (data) {
      const filtered = data.filter((post: any) => likedPosts.includes(post.id));
      setSavedPosts(filtered);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      if (!contextLoading) {
        loadSavedPosts();
      }
    }, [likedPosts, contextLoading])
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="heart-dislike-outline" size={80} color={colors.border} />
      <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>Aún no hay favoritos</Text>
      <Text style={[styles.emptyText, { color: colors.textMuted }]}>Explora el Muro de la Comunidad y dale corazón a las publicaciones que más te inspiren.</Text>
      <TouchableOpacity style={[styles.exploreBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Tutorials')}>
        <Text style={styles.exploreBtnText}>Explorar Comunidad</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { paddingTop: insets.top,  backgroundColor: colors.background }]}>
      {(loading || contextLoading) && savedPosts.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={savedPosts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard 
              item={item} 
              profile={profile} 
              onCommentPress={(postId: string) => setActiveCommentPostId(postId)}
            />
          )}
          contentContainerStyle={savedPosts.length === 0 ? styles.emptyListContent : styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      )}
      
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
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 15, paddingBottom: 40 },
  emptyListContent: { flexGrow: 1, padding: 20 },
  
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  emptyText: { fontSize: 15, textAlign: 'center', marginTop: 8, paddingHorizontal: 20, lineHeight: 22 },
  
  exploreBtn: { marginTop: 25, paddingVertical: 12, paddingHorizontal: 25, borderRadius: 12 },
  exploreBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
