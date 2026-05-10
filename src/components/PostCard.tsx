import React, { memo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, Alert, Share, Modal, TouchableWithoutFeedback, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTranslation, useTheme } from '../context/ConfigContext';
import { useToast } from '../context/ToastContext';
import { useLikedPosts } from '../context/LikedPostsContext';
import PostLikersModal from './PostLikersModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function PostCardComponent({ item, profile, onEdit, onDelete, onCommentPress }: any) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const toast = useToast();
  const { likedPosts, registerShare, toggleLike } = useLikedPosts();
  const navigation = useNavigation<any>();

  const [localLikes, setLocalLikes] = React.useState<number>(item.likesCount || 0);
  const [localShares, setLocalShares] = React.useState<number>(item.sharesCount || 0);
  const [localComments, setLocalComments] = React.useState<number>(item.commentsCount || 0);

  const [menuVisible, setMenuVisible] = React.useState(false);
  const [likersVisible, setLikersVisible] = React.useState(false);
  const [menuPos, setMenuPos] = React.useState({ x: 0, y: 0 });
  const dotsRef = React.useRef<View>(null);

  React.useEffect(() => {
    setLocalLikes(item.likesCount || 0);
    setLocalShares(item.sharesCount || 0);
    setLocalComments(item.commentsCount || 0);
  }, [item.likesCount, item.sharesCount, item.commentsCount]);

  const isLiked = likedPosts.includes(item.id);
  const isOwner = item.autorId === profile?.id;
  const isAdmin = profile?.isAdmin || false;

  const openVideo = (url: string) => {
    if (url) Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `¡Mira esta publicación en Artemanía!\n\n*${item.titulo}*\n${item.contenido}\n\n${item.imagen || item.videoURL || ''}`,
      });
      if (result.action === Share.sharedAction) {
        const isNewShare = await registerShare(item.id);
        if (isNewShare) {
          setLocalShares(prev => prev + 1);
        } else {
          console.log("Post ya compartido por este usuario anteriormente.");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleToggleLike = useCallback(() => {
    if (!profile) {
      toast.confirm({
        type: 'info',
        title: '🎨 ¡Únete al taller!',
        message: 'Inicia sesión para dar "Me gusta" y apoyar a los artesanos de la comunidad. ✨',
        confirmText: 'Ir a Iniciar Sesión',
        cancelText: 'Más tarde',
        onConfirm: () => navigation.navigate('Login')
      });
      return;
    }
    toggleLike(item.id, item.autorId, item.titulo);
    if (isLiked) {
      setLocalLikes(prev => Math.max(0, prev - 1));
    } else {
      setLocalLikes(prev => prev + 1);
    }
  }, [profile, item.id, item.autorId, item.titulo, isLiked, toggleLike]);

  const handleDelete = useCallback(() => {
    setMenuVisible(false);
    setTimeout(() => {
      Alert.alert('Eliminar publicación', '¿Estás seguro de que quieres borrar este mensaje? Esta acción no se puede deshacer.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => onDelete && onDelete(item.id) }
      ]);
    }, 300);
  }, [item.id, onDelete]);

  const handleEdit = useCallback(() => {
    setMenuVisible(false);
    if (onEdit) onEdit(item);
  }, [item, onEdit]);

  const handleReport = () => {
    setMenuVisible(false);
    if (!profile) {
      toast.confirm({
        type: 'info',
        title: '🛡️ Moderación Artemanía',
        message: 'Si crees que esta publicación infringe nuestras normas, inicia sesión para reportarla y que nuestro equipo pueda revisarla. ✨',
        confirmText: 'Ir a Iniciar Sesión',
        cancelText: 'Más tarde',
        onConfirm: () => navigation.navigate('Login')
      });
      return;
    }
    toast.success('📬 Reporte Recibido', 'Gracias por avisarnos. Nuestro equipo revisará esta publicación a la brevedad.');
  };

  const toggleMenu = () => {
    if (menuVisible) {
      setMenuVisible(false);
    } else {
      dotsRef.current?.measureInWindow((pageX, pageY, width, height) => {
        setMenuPos({
          x: pageX - 140,
          y: pageY + (Platform.OS === 'android' ? 5 : height)
        });
        setMenuVisible(true);
      });
    }
  };

  const renderDropdownOption = (text: string, icon: string, onPress: () => void, isDestructive = false) => (
    <TouchableOpacity style={styles.dropdownOption} onPress={onPress}>
      <Icon name={icon} size={18} color={isDestructive ? '#ed4956' : colors.textPrimary} style={{ marginRight: 12 }} />
      <Text style={[styles.dropdownText, { color: isDestructive ? '#ed4956' : colors.textPrimary }]}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.postCard, { backgroundColor: colors.surface }]}>
      <View style={styles.postHeader}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
          onPress={() => navigation.navigate('ArtesanoProfile', {
            artesano: { id: item.autorId, nombre: item.autorNombre, foto: item.autorFoto },
            profile
          })}
        >
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primaryLight }]}>
            {item.autorFoto ? (
              <Image source={{ uri: item.autorFoto }} style={{ width: 44, height: 44, borderRadius: 22 }} />
            ) : (
              <Icon name="person" size={20} color={colors.primary} />
            )}
          </View>
          <View style={styles.postMeta}>
            <Text style={[styles.authorName, { color: colors.textPrimary }]}>{item.autorNombre || 'Artesano Local'}</Text>
            <Text style={[styles.postDate, { color: colors.textMuted }]}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Publicado recientemente'}</Text>
          </View>
        </TouchableOpacity>

        <View ref={dotsRef} collapsable={false}>
          <TouchableOpacity onPress={toggleMenu} style={{ padding: 5 }}>
            <Icon name="ellipsis-horizontal" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={[styles.postTitle, { color: colors.textPrimary }]}>{item.titulo}</Text>
      <Text style={[styles.postContent, { color: colors.textSecondary }]}>{item.contenido}</Text>

      {item.imagen ? (
        <View style={styles.postImageContainer}>
          <Image source={{ uri: item.imagen }} style={styles.postImage} />
        </View>
      ) : null}

      {item.videoURL ? (
        <View style={{ paddingHorizontal: 15, marginBottom: 15 }}>
          <TouchableOpacity style={styles.videoBtn} onPress={() => openVideo(item.videoURL)}>
            <View style={styles.videoThumbnail}>
              <Icon name="play" size={40} color="#fff" />
            </View>
            <Text style={[styles.videoLinkText, { color: colors.primary }]}>{t('tutorials.btn_video', 'Ver Video Completo')}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={[styles.postStats, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => setLikersVisible(true)}
          activeOpacity={0.6}
        >
          {localLikes > 0 ? (
            <>
              <View style={styles.statIconBg}>
                <Icon name="heart" size={12} color="#fff" />
              </View>
              <Text style={[styles.statText, { marginLeft: 6, color: colors.textMuted }]}>{localLikes}</Text>
            </>
          ) : (
            <View style={{ height: 20 }} />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center' }}
          onPress={() => {
            if (!profile) {
              toast.confirm({
                type: 'info',
                title: '🎨 ¡Conecta con el arte!',
                message: 'Inicia sesión para ver los comentarios y unirte a la conversación. ✨',
                confirmText: 'Ir a Iniciar Sesión',
                cancelText: 'Más tarde',
                onConfirm: () => navigation.navigate('Login')
              });
              return;
            }
            onCommentPress && onCommentPress(item.id);
          }}
          activeOpacity={0.6}
        >
          <Text style={[styles.statTextRight, { color: colors.textMuted }]}>
            {localComments > 0 ? `${localComments} ${localComments === 1 ? 'comentario' : 'comentarios'}` : '0 comentarios'}
          </Text>
          {localShares > 0 && (
            <>
              <Text style={[styles.statTextRight, { color: colors.textMuted }]}> • </Text>
              <Text style={[styles.statTextRight, { color: colors.textMuted }]}>{localShares} {localShares === 1 ? 'compartido' : 'compartidos'}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={handleToggleLike}>
          <View style={[styles.actionIconRound, { backgroundColor: isLiked ? colors.primaryLight : colors.divider }]}>
            <Icon name={isLiked ? "heart" : "heart-outline"} size={22} color={isLiked ? colors.danger : colors.textSecondary} />
          </View>
          <Text style={[styles.actionText, { color: isLiked ? colors.danger : colors.textSecondary }]}>Me gusta</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={() => {
            if (!profile) {
              toast.confirm({
                type: 'info',
                title: '🎨 ¡Participa en Artemanía!',
                message: 'Inicia sesión para comentar las obras y técnicas de otros artesanos. ✨',
                confirmText: 'Ir a Iniciar Sesión',
                cancelText: 'Más tarde',
                onConfirm: () => navigation.navigate('Login')
              });
              return;
            }
            onCommentPress && onCommentPress(item.id);
          }}
        >
          <View style={[styles.actionIconRound, { backgroundColor: colors.divider }]}>
            <Icon name="chatbubble-outline" size={20} color={colors.textSecondary} />
          </View>
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>Comentar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7} onPress={handleShare}>
          <View style={[styles.actionIconRound, { backgroundColor: colors.divider }]}>
            <Icon name="arrow-redo-outline" size={22} color={colors.textSecondary} />
          </View>
          <Text style={[styles.actionText, { color: colors.textSecondary }]}>Compartir</Text>
        </TouchableOpacity>
      </View>

      {/* DROPDOWN MODAL */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
          <View style={styles.modalBackdrop}>
            <View style={[styles.dropdownMenu, { top: menuPos.y, left: menuPos.x, backgroundColor: colors.surface, borderColor: colors.border }]}>
              {isOwner && renderDropdownOption('Editar', 'pencil-outline', handleEdit)}
              {isOwner && renderDropdownOption('Eliminar', 'trash-outline', handleDelete, true)}

              {!isOwner && isAdmin && renderDropdownOption('Borrar (Admin)', 'shield-outline', handleDelete, true)}
              {!isOwner && renderDropdownOption('Reportar', 'flag-outline', handleReport, true)}

              <View style={[styles.dropdownDivider, { backgroundColor: colors.divider }]} />
              {renderDropdownOption('Compartir', 'share-social-outline', () => { setMenuVisible(false); handleShare(); })}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <PostLikersModal
        visible={likersVisible}
        onClose={() => setLikersVisible(false)}
        postId={item.id}
        currentUserProfile={profile}
      />
    </View>
  );
}

// Solo re-renderizar si cambian los datos relevantes del post o el perfil del usuario
export default memo(PostCardComponent, (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.item.likesCount === next.item.likesCount &&
    prev.item.commentsCount === next.item.commentsCount &&
    prev.item.sharesCount === next.item.sharesCount &&
    prev.item.titulo === next.item.titulo &&
    prev.item.contenido === next.item.contenido &&
    prev.profile?.id === next.profile?.id
  );
});

const styles = StyleSheet.create({
  postCard: { paddingVertical: 15, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 15 },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  postMeta: { flex: 1 },
  authorName: { fontSize: 16, fontWeight: 'bold' },
  postDate: { fontSize: 12, marginTop: 2 },
  postTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8, paddingHorizontal: 15 },
  postContent: { fontSize: 15, lineHeight: 22, marginBottom: 15, paddingHorizontal: 15 },
  postImageContainer: { width: '100%', height: 300, marginBottom: 15 },
  postImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  videoBtn: { marginBottom: 15 },
  videoThumbnail: { width: '100%', height: 160, backgroundColor: '#343a40', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  videoLinkText: { fontSize: 14, fontWeight: 'bold' },
  postStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, paddingHorizontal: 20, borderBottomWidth: 1 },
  statIconBg: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#e03131', justifyContent: 'center', alignItems: 'center' },
  statText: { fontSize: 14 },
  statTextRight: { fontSize: 14 },
  postActions: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 10, paddingHorizontal: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  actionIconRound: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  actionText: { fontSize: 14, fontWeight: '600' },

  // Estilos del menú desplegable
  modalBackdrop: { flex: 1, backgroundColor: 'transparent' },
  dropdownMenu: {
    position: 'absolute',
    borderRadius: 14,
    width: 170,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 15,
    borderWidth: 1,
  },
  dropdownOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownDivider: {
    height: 1,
    marginVertical: 4,
  }
});
