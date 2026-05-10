import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ConfigContext';
import { getPostComments, addPostComment, createNotification, updatePostComment, deletePostComment } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface Props {
  visible: boolean;
  postId: string | null;
  postAuthorId?: string;
  postTitle?: string;
  onClose: () => void;
}

export default function PostCommentsModal({ visible, postId, postAuthorId, postTitle, onClose }: Props) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string, autorId: string, autorNombre: string, rootCommentId: string } | null>(null);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [editingComment, setEditingComment] = useState<{ id: string, texto: string } | null>(null);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedComment, setSelectedComment] = useState<any>(null);
  const navigation = useNavigation<any>();
  const { colors } = useTheme();

  const { profile } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (visible && postId) {
      loadComments();
    } else {
      setComments([]);
      setCommentText('');
      setReplyingTo(null);
      setExpandedComments({});
    }
  }, [visible, postId]);

  const loadComments = async () => {
    if (!postId) return;
    setLoading(true);
    const { data } = await getPostComments(postId);
    if (data) {
      setComments(data);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!profile) {
      toast.info('🎨 ¡Únete a la charla!', 'Inicia sesión para dejar tus comentarios y conectar con otros artesanos. ✨');
      return;
    }
    if (!commentText.trim() || !postId) return;

    setSubmitting(true);

    if (editingComment) {
      const res = await updatePostComment(editingComment.id, postId, commentText.trim());
      if (res.success) {
        setCommentText('');
        setEditingComment(null);
        await loadComments();
      } else {
        toast.error('Error', 'No se pudo actualizar el comentario.');
      }
      setSubmitting(false);
      return;
    }

    const data: any = {
      texto: commentText.trim(),
      autorId: profile.id,
      autorNombre: profile.nombre || 'Artesano Local',
      autorFoto: profile.foto || '',
    };

    if (replyingTo) {
      data.replyToId = replyingTo.id;
      data.replyToAuthorId = replyingTo.autorId;
      data.replyToAuthorName = replyingTo.autorNombre;
      data.rootCommentId = replyingTo.rootCommentId;
    }

    const res = await addPostComment(postId, data);
    if (res.success) {
      // Notificaciones (mantener lógica existente)
      if (postAuthorId && postAuthorId !== profile.id && (!replyingTo || replyingTo.autorId !== postAuthorId)) {
        createNotification(postAuthorId, {
          type: 'comentario',
          title: '¡Nuevo comentario! 💬',
          message: `${profile.nombre || 'Un artesano'} comentó en tu publicación "${postTitle || 'sin título'}": "${commentText.substring(0, 30)}${commentText.length > 30 ? '...' : ''}"`,
          targetId: postId,
          targetType: 'post'
        });
      }

      if (replyingTo && replyingTo.autorId !== profile.id) {
        createNotification(replyingTo.autorId, {
          type: 'respuesta_comentario',
          title: 'Te han respondido 💬',
          message: `${profile.nombre || 'Un artesano'} respondió a tu comentario: "${commentText.substring(0, 50)}${commentText.length > 50 ? '...' : ''}"`,
          targetId: postId,
          targetType: 'post'
        });
      }

      setCommentText('');
      setReplyingTo(null);
      await loadComments();
    } else {
      toast.error('Error', 'No se pudo publicar el comentario.');
    }
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!postId) return;
    const res = await deletePostComment(commentId, postId);
    if (res.success) {
      toast.success('Eliminado', 'Comentario borrado correctamente.');
      await loadComments();
    } else {
      toast.error('Error', 'No se pudo borrar el comentario.');
    }
  };

  const handleEditComment = (comment: any) => {
    setEditingComment({ id: comment.id, texto: comment.texto });
    setCommentText(comment.texto);
    setReplyingTo(null);
  };

  const handleLongPress = (comment: any) => {
    const isMyComment = profile?.id === comment.autorId;
    const isAdmin = profile?.isAdmin;
    if (isMyComment || isAdmin) {
      setSelectedComment(comment);
      setShowOptions(true);
    }
  };

  const onEditPress = () => {
    if (selectedComment) {
      handleEditComment(selectedComment);
      setShowOptions(false);
    }
  };

  const onDeletePress = () => {
    if (selectedComment) {
      handleDeleteComment(selectedComment.id);
      setShowOptions(false);
    }
  };

  const handleAuthorPress = (item: any) => {
    onClose();
    setTimeout(() => {
      navigation.navigate('ArtesanoProfile', {
        artesano: { id: item.autorId, nombre: item.autorNombre, foto: item.autorFoto },
        profile
      });
    }, 150);
  };

  const handleReply = (item: any, rootId: string) => {
    setReplyingTo({ id: item.id, autorId: item.autorId, autorNombre: item.autorNombre, rootCommentId: rootId });
  };

  const toggleReplies = (commentId: string) => {
    setExpandedComments(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const topLevelComments = comments.filter(c => !c.replyToId && !c.rootCommentId);
  const repliesByRoot: Record<string, any[]> = {};

  comments.forEach(c => {
    if (c.rootCommentId) {
      if (!repliesByRoot[c.rootCommentId]) repliesByRoot[c.rootCommentId] = [];
      repliesByRoot[c.rootCommentId].push(c);
    }
  });

  const renderReply = (item: any, rootId: string) => {
    const isMyComment = profile?.id === item.autorId;
    const isAdmin = profile?.isAdmin;

    return (
      <View style={styles.replyCommentItem} key={item.id}>
        <TouchableOpacity 
          onPress={() => handleAuthorPress(item)}
          onLongPress={() => handleLongPress(item)}
          delayLongPress={500}
        >
          <View style={[styles.replyCommentAvatar, { backgroundColor: colors.primaryLight }]}>
            {item.autorFoto ? (
              <Image source={{ uri: item.autorFoto }} style={{ width: 28, height: 28, borderRadius: 14 }} />
            ) : (
              <Icon name="person" size={14} color={colors.primary} />
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={{ flex: 1 }}
          onLongPress={() => handleLongPress(item)}
          delayLongPress={500}
          activeOpacity={0.7}
        >
          <View style={[styles.replyContentBox, { backgroundColor: colors.background }]}>
            <View style={styles.commentHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.commentAuthor, { color: colors.textPrimary }]}>{item.autorNombre}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {item.isEdited && <Text style={[styles.editedTag, { color: colors.textMuted }]}>(editado) </Text>}
                <Text style={[styles.commentDate, { color: colors.textMuted }]}>
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                </Text>
              </View>
            </View>
            {item.replyToAuthorName && item.replyToId !== rootId && (
              <Text style={[styles.replyToBadge, { color: colors.primary }]}>En respuesta a @{item.replyToAuthorName}</Text>
            )}
            <Text style={[styles.commentText, { color: colors.textSecondary }]}>{item.texto}</Text>
          </View>
          <View style={styles.commentActions}>
            <TouchableOpacity style={styles.replyButton} onPress={() => handleReply(item, rootId)}>
              <Text style={[styles.replyButtonText, { color: colors.primary }]}>Responder</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderComment = ({ item }: any) => {
    const rootId = item.id;
    const replies = repliesByRoot[rootId] || [];
    const isExpanded = expandedComments[rootId];
    const isMyComment = profile?.id === item.autorId;
    const isAdmin = profile?.isAdmin;

    return (
      <View style={styles.commentThread}>
        <View style={styles.commentItem}>
          <TouchableOpacity 
            onPress={() => handleAuthorPress(item)}
            onLongPress={() => handleLongPress(item)}
            delayLongPress={500}
          >
            <View style={[styles.commentAvatar, { backgroundColor: colors.primaryLight }]}>
              {item.autorFoto ? (
                <Image source={{ uri: item.autorFoto }} style={{ width: 36, height: 36, borderRadius: 18 }} />
              ) : (
                <Icon name="person" size={16} color={colors.primary} />
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ flex: 1 }}
            onLongPress={() => handleLongPress(item)}
            delayLongPress={500}
            activeOpacity={0.7}
          >
            <View style={[styles.commentContentBox, { backgroundColor: colors.background }]}>
              <View style={styles.commentHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.commentAuthor, { color: colors.textPrimary }]}>{item.autorNombre}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {item.isEdited && <Text style={[styles.editedTag, { color: colors.textMuted }]}>(editado) </Text>}
                  <Text style={[styles.commentDate, { color: colors.textMuted }]}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                  </Text>
                </View>
              </View>
              <Text style={[styles.commentText, { color: colors.textSecondary }]}>{item.texto}</Text>
            </View>
            <View style={styles.commentActions}>
              <TouchableOpacity style={styles.replyButton} onPress={() => handleReply(item, rootId)}>
                <Text style={[styles.replyButtonText, { color: colors.primary }]}>Responder</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {replies.length > 0 && (
          <View style={styles.repliesSection}>
            <TouchableOpacity
              style={styles.toggleRepliesBtn}
              onPress={() => toggleReplies(rootId)}
            >
              <View style={[styles.replyLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.toggleRepliesText, { color: colors.textSecondary }]}>
                {isExpanded ? 'Ocultar respuestas' : `Ver ${replies.length} respuesta${replies.length > 1 ? 's' : ''}`}
              </Text>
            </TouchableOpacity>

            {isExpanded && (
              <View style={styles.repliesList}>
                {replies.map(reply => renderReply(reply, rootId))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.backgroundTap} onPress={onClose} activeOpacity={1} />

        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={[styles.handleBar, { backgroundColor: colors.divider }]} />

          <View style={[styles.header, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Comentarios</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={topLevelComments}
              keyExtractor={(item, index) => item.id || index.toString()}
              renderItem={renderComment}
              contentContainerStyle={topLevelComments.length === 0 ? styles.emptyList : styles.listContent}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Icon name="chatbubbles-outline" size={50} color={colors.border} />
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sé el primero en comentar.</Text>
                </View>
              }
            />
          )}

          <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.divider }]}>
            {editingComment && (
              <View style={[styles.replyingToBanner, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
                <Text style={[styles.replyingToText, { color: colors.textSecondary }]}>Editando comentario...</Text>
                <TouchableOpacity onPress={() => { setEditingComment(null); setCommentText(''); }} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Icon name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            )}
            {replyingTo && !editingComment && (
              <View style={[styles.replyingToBanner, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
                <Text style={[styles.replyingToText, { color: colors.textSecondary }]}>Respondiendo a <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>@{replyingTo.autorNombre}</Text></Text>
                <TouchableOpacity onPress={() => setReplyingTo(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Icon name="close-circle" size={18} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.inputArea}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary }]}
                placeholder={editingComment ? "Edita tu comentario..." : (replyingTo ? `Escribe una respuesta...` : "Escribe un comentario...")}
                placeholderTextColor={colors.textMuted}
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={300}
              />
              <TouchableOpacity
                style={[styles.sendBtn, { backgroundColor: colors.primary }, !commentText.trim() && { opacity: 0.5 }, editingComment && { backgroundColor: '#fcc419' }]}
                onPress={handleSubmit}
                disabled={!commentText.trim() || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Icon name={editingComment ? "checkmark" : "send"} size={20} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Options Menu (Bottom Sheet) */}
      <Modal
        visible={showOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOptions(false)}
      >
        <TouchableOpacity 
          style={styles.optionsOverlay} 
          activeOpacity={1} 
          onPress={() => setShowOptions(false)}
        >
          <View style={[styles.optionsContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.optionsHandle, { backgroundColor: colors.divider }]} />
            <Text style={[styles.optionsTitle, { color: colors.textSecondary }]}>Opciones de comentario</Text>
            <TouchableOpacity style={styles.optionItem} onPress={onEditPress}>
              <View style={[styles.optionIcon, { backgroundColor: '#e7f5ff' }]}>
                <Icon name="pencil" size={20} color="#339af0" />
              </View>
              <Text style={[styles.optionText, { color: colors.textPrimary }]}>Editar comentario</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionItem} onPress={onDeletePress}>
              <View style={[styles.optionIcon, { backgroundColor: '#fff5f5' }]}>
                <Icon name="trash-outline" size={20} color="#fa5252" />
              </View>
              <Text style={[styles.optionText, { color: '#fa5252' }]}>Eliminar comentario</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  backgroundTap: { flex: 1 },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: '80%',
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  handleBar: { width: 40, height: 5, borderRadius: 5, alignSelf: 'center', marginBottom: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  closeBtn: { padding: 5 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20, paddingBottom: 20 },
  emptyList: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 15, marginTop: 10 },
  commentItem: { flexDirection: 'row' },
  commentThread: { marginBottom: 15 },
  replyCommentItem: { flexDirection: 'row', marginTop: 10 },
  replyCommentAvatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 10, marginTop: 2 },
  replyContentBox: { flex: 1, borderRadius: 16, padding: 10 },
  repliesSection: { paddingLeft: 46, marginTop: 2 },
  toggleRepliesBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  replyLine: { width: 24, height: 1, marginRight: 8 },
  toggleRepliesText: { fontSize: 12, fontWeight: '600' },
  repliesList: { marginTop: 4 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
  commentContentBox: { flex: 1, borderRadius: 16, padding: 12 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  commentAuthor: { fontSize: 14, fontWeight: '700' },
  commentDate: { fontSize: 11 },
  commentText: { fontSize: 14, lineHeight: 20 },
  replyButton: { marginTop: 4, marginLeft: 12 },
  replyButtonText: { fontSize: 12, fontWeight: '600' },
  replyToBadge: { fontSize: 12, fontStyle: 'italic', marginBottom: 4 },
  inputContainer: { borderTopWidth: 1, paddingBottom: Platform.OS === 'ios' ? 25 : 10 },
  replyingToBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 8, borderBottomWidth: 1 },
  replyingToText: { fontSize: 13 },
  inputArea: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10 },
  input: { flex: 1, borderRadius: 20, paddingHorizontal: 15, paddingTop: 10, paddingBottom: 10, minHeight: 40, maxHeight: 100, fontSize: 15 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  commentActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingRight: 10 },
  adminActions: { flexDirection: 'row', gap: 15 },
  actionBtn: { padding: 4 },
  editedTag: { fontSize: 10, fontStyle: 'italic' },
  
  // Estilos del menú de opciones
  optionsOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  optionsContent: { borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
  optionsHandle: { width: 40, height: 5, borderRadius: 5, alignSelf: 'center', marginBottom: 20 },
  optionsTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 25 },
  optionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15 },
  optionIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  optionText: { fontSize: 16, fontWeight: '600' }
});
