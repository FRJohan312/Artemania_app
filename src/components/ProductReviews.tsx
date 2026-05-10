import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Image, ScrollView, Modal, FlatList, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { Review } from '../types';
import { useTheme } from '../context/ConfigContext';

interface ProductReviewsProps {
  reviews: Review[];
  isLoading: boolean;
  myReview?: Review;
  userId?: string;
  isOwner: boolean;
  isSubmitting: boolean;
  onSubmitReview: (rating: number, comment: string, photoUris?: string[]) => Promise<void>;
  onUpdateReview?: (reviewId: string, rating: number, comment: string, photoUris?: string[]) => Promise<void>;
  onDeleteReview?: (reviewId: string) => Promise<void>;
  onLoginPrompt: () => void;
  onOwnerPrompt: () => void;
  isAdmin?: boolean;
}

export default function ProductReviews({
  reviews,
  isLoading,
  myReview,
  userId,
  isOwner,
  isSubmitting,
  onSubmitReview,
  onUpdateReview,
  onDeleteReview,
  onLoginPrompt,
  onOwnerPrompt,
  isAdmin
}: ProductReviewsProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [fullscreenPhotos, setFullscreenPhotos] = useState<string[] | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { colors } = useTheme();
  
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const renderStars = (ratingVal: number, size = 16) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon key={i} name={i <= ratingVal ? "star" : "star-outline"} size={size} color={colors.star || '#fcc419'} />
      );
    }
    return <View style={styles.starsRow}>{stars}</View>;
  };

  const handleSubmit = async () => {
    if (!userId) {
      onLoginPrompt();
      return;
    }
    if (isOwner) {
      onOwnerPrompt();
      return;
    }
    if (rating === 0) return;
    
    if (isEditing && myReview?.id) {
      await onUpdateReview?.(myReview.id, rating, comment, photoUris);
      setIsEditing(false);
    } else {
      await onSubmitReview(rating, comment, photoUris);
    }
    setRating(0);
    setComment('');
    setPhotoUris([]);
  };

  const handleAddPhotos = async () => {
    if (photoUris.length >= 3) return; // Límite de 3 fotos
    
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 3 - photoUris.length,
      quality: 0.8,
    });

    if (result.assets && result.assets.length > 0) {
      const newUris = result.assets.map(a => a.uri!).filter(Boolean);
      setPhotoUris(prev => [...prev, ...newUris].slice(0, 3));
    }
  };

  const removePhoto = (index: number) => {
    setPhotoUris(prev => prev.filter((_, i) => i !== index));
  };

  const startEditing = () => {
    if (myReview) {
      setRating(myReview.rating);
      setComment(myReview.comment || '');
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setRating(0);
    setComment('');
    setPhotoUris([]);
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Calificaciones y Reseñas ({avgRating})</Text>
      
      {!userId ? (
        <Text style={[styles.loginPromptText, { color: colors.textMuted }]}>Inicia sesión para dejar una reseña.</Text>
      ) : (myReview && !isAdmin && !isEditing) ? (
        <View style={[styles.myReviewCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.myReviewHeader}>
            <Text style={[styles.myReviewTitle, { color: colors.textSecondary }]}>Tu calificación</Text>
            {renderStars(myReview.rating, 18)}
          </View>
          {myReview.comment ? (
            <Text style={[styles.myReviewComment, { color: colors.textSecondary }]}>"{myReview.comment}" {myReview.isEdited && <Text style={[styles.editedLabel, { color: colors.textMuted }]}>(editado)</Text>}</Text>
          ) : null}
          <View style={[styles.myReviewActions, { borderTopColor: colors.divider }]}>
            <TouchableOpacity style={styles.myActionBtn} onPress={startEditing}>
              <Icon name="pencil-outline" size={16} color={colors.primary} />
              <Text style={[styles.myActionText, { color: colors.primary }]}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.myActionBtn} onPress={() => onDeleteReview?.(myReview.id!)}>
              <Icon name="trash-outline" size={16} color="#fa5252" />
              <Text style={[styles.myActionText, { color: '#fa5252' }]}>Borrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[styles.addReviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.addReviewTitle, { color: colors.textPrimary }]}>
            {isEditing ? 'Editar tu reseña' : isAdmin ? 'Añadir Reseña de Admin' : 'Deja tu calificación'}
          </Text>
          <View style={styles.ratingInputRow}>
            {[1, 2, 3, 4, 5].map(num => (
               <TouchableOpacity key={num} onPress={() => setRating(num)} style={styles.starTouch}>
                 <Icon name={num <= rating ? "star" : "star-outline"} size={36} color={colors.star || '#fcc419'} />
               </TouchableOpacity>
            ))}
          </View>
          <TextInput
             style={[styles.commentInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.textPrimary }]}
             placeholder="Escribe tu comentario (opcional)..."
             placeholderTextColor={colors.textMuted}
             value={comment}
             onChangeText={setComment}
             maxLength={200}
             multiline
          />
          <View style={styles.formActionsRow}>
            <TouchableOpacity style={styles.addPhotoBtn} onPress={handleAddPhotos}>
              <Icon name="camera-outline" size={24} color={colors.primary} />
              <Text style={[styles.addPhotoText, { color: colors.primary }]}>
                {photoUris.length}/3 Fotos
              </Text>
            </TouchableOpacity>
            <Text style={[styles.charCount, { color: colors.textMuted }]}>{comment.length}/200</Text>
          </View>
          
          {photoUris.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoPreviewScroll}>
              {photoUris.map((uri, index) => (
                <View key={index} style={styles.photoPreviewWrapper}>
                  <Image source={{ uri }} style={styles.photoPreview} />
                  <TouchableOpacity style={styles.removePhotoBtn} onPress={() => removePhoto(index)}>
                    <Icon name="close" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={{flexDirection: 'row', gap: 10, marginTop: 10}}>
            {isEditing && (
              <TouchableOpacity style={[styles.submitReviewBtn, {backgroundColor: colors.border, flex: 1}]} onPress={cancelEditing}>
                <Text style={[styles.submitReviewText, {color: colors.textPrimary}]}>Cancelar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.submitReviewBtn, {flex: 2, backgroundColor: colors.primary, shadowColor: colors.primary}, rating === 0 && { opacity: 0.5 }]} 
              onPress={handleSubmit} 
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitReviewText}>{isEditing ? 'Guardar Cambios' : 'Enviar Calificación'}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{marginTop: 20}} />
      ) : reviews.length > 0 ? (
        reviews.map((rev) => (
          <View key={rev.id || Math.random().toString()} style={[styles.reviewCard, { borderBottomColor: colors.divider }]}>
            <View style={styles.reviewHeader}>
              <View style={[styles.reviewAvatar, { backgroundColor: colors.primaryLight }]}>
                {rev.userFoto ? (
                  <Image source={{ uri: rev.userFoto }} style={styles.avatarImg} />
                ) : (
                  <Text style={[styles.reviewAvatarText, { color: colors.primary }]}>{rev.userName ? rev.userName.charAt(0).toUpperCase() : 'U'}</Text>
                )}
              </View>
              <View style={styles.reviewUserMeta}>
                <Text style={[styles.reviewUserName, { color: colors.textPrimary }]}>{rev.userName || 'Usuario'}</Text>
                {renderStars(rev.rating, 14)}
              </View>
              {rev.createdAt && (
                <Text style={[styles.reviewDate, { color: colors.textMuted }]}>
                  {new Date(rev.createdAt).toLocaleDateString()}
                </Text>
              )}
              {isAdmin && rev.id && (
                <TouchableOpacity 
                  onPress={() => onDeleteReview && onDeleteReview(rev.id!)} 
                  style={styles.deleteReviewBtn}
                >
                  <Icon name="trash-outline" size={20} color="#fa5252" />
                </TouchableOpacity>
              )}
            </View>
            {rev.comment ? (
              <Text style={[styles.reviewText, { color: colors.textSecondary }]}>
                {rev.comment} {rev.isEdited && <Text style={[styles.editedLabelSmall, { color: colors.textMuted }]}>(editado)</Text>}
              </Text>
            ) : null}
            {rev.fotos && rev.fotos.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.reviewPhotosScroll}>
                {rev.fotos.map((foto, index) => (
                  <TouchableOpacity 
                    key={index} 
                    activeOpacity={0.9} 
                    onPress={() => {
                      setFullscreenPhotos(rev.fotos!);
                      setActiveImageIndex(index);
                    }}
                  >
                    <Image source={{ uri: foto }} style={styles.reviewPhoto} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        ))
      ) : (
        <Text style={[styles.noReviewsText, { color: colors.textMuted }]}>Aún no hay reseñas. ¡Sé el primero en calificar!</Text>
      )}

      {/* FULLSCREEN MODAL */}
      <Modal visible={!!fullscreenPhotos} transparent animationType="fade">
        <View style={styles.fullscreenContainer}>
          <TouchableOpacity style={styles.closeFullscreen} onPress={() => setFullscreenPhotos(null)}>
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          
          {fullscreenPhotos && (
            <FlatList
              data={fullscreenPhotos}
              horizontal
              pagingEnabled
              initialScrollIndex={activeImageIndex}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / Dimensions.get('window').width);
                setActiveImageIndex(index);
              }}
              getItemLayout={(_, index) => ({
                length: Dimensions.get('window').width,
                offset: Dimensions.get('window').width * index,
                index,
              })}
              renderItem={({ item }) => (
                <View style={styles.fullscreenImageWrapper}>
                  <Image source={{ uri: item }} style={styles.fullscreenImage} />
                </View>
              )}
              keyExtractor={(item, index) => index.toString()}
            />
          )}
          
          {fullscreenPhotos && fullscreenPhotos.length > 1 && (
            <View style={styles.fullscreenFooter}>
              <Text style={styles.fullscreenCount}>
                {activeImageIndex + 1} / {fullscreenPhotos.length}
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10, marginBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '800', marginBottom: 12, marginTop: 15 },
  starsRow: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  loginPromptText: { fontStyle: 'italic', marginBottom: 20 },
  
  myReviewCard: { padding: 20, borderRadius: 16, marginBottom: 25, borderWidth: 1 },
  myReviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  myReviewTitle: { fontWeight: 'bold', fontSize: 16 },
  myReviewComment: { fontStyle: 'italic', fontSize: 15, lineHeight: 22 },
  myReviewActions: { flexDirection: 'row', marginTop: 15, gap: 15, borderTopWidth: 1, paddingTop: 10 },
  myActionBtn: { flexDirection: 'row', alignItems: 'center' },
  myActionText: { marginLeft: 5, fontSize: 14, fontWeight: '600' },
  editedLabel: { fontSize: 12, fontStyle: 'normal' },
  editedLabelSmall: { fontSize: 11 },
  
  addReviewCard: { padding: 20, borderRadius: 16, borderWidth: 1, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5, elevation: 2, marginBottom: 25 },
  addReviewTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  ratingInputRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20 },
  starTouch: { paddingHorizontal: 6 },
  commentInput: { borderRadius: 12, padding: 15, minHeight: 100, textAlignVertical: 'top', borderWidth: 1, fontSize: 15 },
  charCount: { textAlign: 'right', fontSize: 12, marginTop: 8, marginBottom: 15 },
  submitReviewBtn: { borderRadius: 12, height: 50, justifyContent: 'center', alignItems: 'center', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  submitReviewText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  reviewCard: { paddingVertical: 18, borderBottomWidth: 1 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  reviewAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  reviewAvatarText: { fontWeight: 'bold', fontSize: 18 },
  avatarImg: { width: '100%', height: '100%', borderRadius: 22, resizeMode: 'cover' },
  reviewUserMeta: { flex: 1 },
  reviewUserName: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  reviewDate: { fontSize: 13, flex: 1, textAlign: 'right', marginRight: 10 },
  deleteReviewBtn: { padding: 5 },
  reviewText: { fontSize: 15, lineHeight: 22, paddingLeft: 56 },
  reviewPhotosScroll: { marginLeft: 56, marginTop: 10, flexDirection: 'row' },
  reviewPhoto: { width: 80, height: 80, borderRadius: 8, marginRight: 10, backgroundColor: '#f0f0f0' },
  noReviewsText: { textAlign: 'center', marginTop: 15, fontStyle: 'italic', fontSize: 15 },
  formActionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  addPhotoBtn: { flexDirection: 'row', alignItems: 'center', padding: 5 },
  addPhotoText: { marginLeft: 5, fontSize: 13, fontWeight: '600' },
  photoPreviewScroll: { flexDirection: 'row', marginTop: 10, paddingBottom: 5 },
  photoPreviewWrapper: { position: 'relative', marginRight: 15, marginTop: 5 },
  photoPreview: { width: 70, height: 70, borderRadius: 8 },
  removePhotoBtn: { position: 'absolute', top: -8, right: -8, backgroundColor: 'rgba(0,0,0,0.6)', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },

  fullscreenContainer: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  closeFullscreen: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 },
  fullscreenImageWrapper: { width: Dimensions.get('window').width, height: '100%', justifyContent: 'center', alignItems: 'center' },
  fullscreenImage: { width: '100%', height: '80%', resizeMode: 'contain' },
  fullscreenFooter: { position: 'absolute', bottom: 50, width: '100%', alignItems: 'center' },
  fullscreenCount: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
