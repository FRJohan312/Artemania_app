import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { getTutorial, deleteTutorial } from '../../services/db';
import PostCard from '../../components/PostCard';
import PostCommentsModal from '../../components/PostCommentsModal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ConfigContext';

export default function PostDetailScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { postId, profile: initialProfile } = route.params;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const { profile: authProfile } = useAuth();
  const profile = initialProfile || authProfile;
  const toast = useToast();
  const { colors } = useTheme();

  useEffect(() => {
    loadPost();
  }, [postId]);

  const loadPost = async () => {
    setLoading(true);
    const { data, error } = await getTutorial(postId);
    if (data) {
      setPost(data);
    } else {
      toast.error('Error', 'No se pudo encontrar la publicación.');
      navigation.goBack();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const res = await deleteTutorial(id);
    if (res.success) {
      toast.success('Eliminado', 'La publicación fue eliminada.');
      navigation.goBack();
    } else {
      toast.error('Error', 'No se pudo eliminar la publicación.');
    }
  };

  const handleEdit = (item: any) => {
    navigation.navigate('PublishPost', { profile, postToEdit: item });
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!post) return null;

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
            <Text style={[styles.backText, { color: colors.textPrimary }]}>Volver</Text>
          </TouchableOpacity>
        </View>

        <PostCard 
          item={post} 
          profile={profile} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          onCommentPress={() => setCommentsVisible(true)}
        />
        
        <View style={[styles.infoBox, { backgroundColor: colors.surface }]}>
          <Icon name="chatbubbles-outline" size={20} color={colors.textMuted} />
          <Text style={[styles.infoText, { color: colors.textMuted }]}>Toca "Comentar" para ver la conversación completa.</Text>
        </View>
      </ScrollView>

      <PostCommentsModal 
        visible={commentsVisible} 
        postId={post.id} 
        postAuthorId={post.autorId}
        postTitle={post.titulo}
        onClose={() => setCommentsVisible(false)} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 14,
    textAlign: 'center',
  }
});
