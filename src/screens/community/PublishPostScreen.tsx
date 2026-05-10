import {  SafeAreaView , useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useToast } from '../../context/ToastContext';
import { createTutorial, updateTutorial, uploadImageAsync } from '../../services/db';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ConfigContext';

export default function PublishPostScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { postToEdit } = route.params || {};
  const { profile } = useAuth();
  const toast = useToast();
  const { colors } = useTheme();

  const [titulo, setTitulo] = useState(postToEdit?.titulo || '');
  const [contenido, setContenido] = useState(postToEdit?.contenido || '');
  const [imagen, setImagen] = useState(postToEdit?.imagen || '');
  const [videoURL, setVideoURL] = useState(postToEdit?.videoURL || '');

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [progress, setProgress] = useState(0);

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
    });

    if (!result.didCancel && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      if (!selectedUri) return;

      setUploadingImage(true);
      setProgress(0.2);
      const interval = setInterval(() => {
        setProgress(prev => (prev < 0.9 ? prev + 0.1 : 0.9));
      }, 200);

      const fileName = `post_${profile?.id || 'user'}_${Date.now()}.jpg`;
      const uploadRes = await uploadImageAsync(selectedUri, `posts/${fileName}`);
      
      clearInterval(interval);
      setProgress(1);
      
      setTimeout(() => {
        setUploadingImage(false);
        setProgress(0);
        if (uploadRes.success && uploadRes.url) {
          setImagen(uploadRes.url);
          toast.success('📸 Foto lista', 'Tu fotografía ha sido cargada y optimizada con éxito.');
        } else {
          toast.error('Foto no cargada', 'No pudimos subir tu imagen en este momento. Inténtalo de nuevo.');
        }
      }, 400);
    }
  };

  const handlePublish = async () => {
    if (!titulo.trim() || !contenido.trim()) {
      toast.warn('Campos vacíos', 'Necesitas escribir al menos un título y contenido para tu publicación. ✍️');
      return;
    }

    setLoading(true);
    setProgress(0.1);
    
    const interval = setInterval(() => {
      setProgress(prev => (prev < 0.8 ? prev + 0.05 : 0.85));
    }, 150);

    const data: any = {
      titulo,
      contenido,
      imagen,
      videoURL,
      autorNombre: profile?.nombre || 'Artesano Local',
      autorId: profile?.id || 'unknown',
      autorFoto: profile?.foto || ''
    };

    let res;
    if (postToEdit) {
      res = await updateTutorial(postToEdit.id, data);
    } else {
      data.createdAt = new Date().toISOString();
      res = await createTutorial(data);
    }

    clearInterval(interval);
    
    if (res.success) {
      setProgress(1);
      setTimeout(() => {
        setLoading(false);
        toast.success('¡Listo! 🎉', postToEdit ? 'Publicación actualizada.' : 'Tu mensaje ya está disponible en el muro.');
        navigation.goBack();
      }, 600);
    } else {
      setLoading(false);
      setProgress(0);
      toast.error('No se pudo guardar', 'Ocurrió un inconveniente. Inténtalo de nuevo.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={[styles.header, { paddingTop: insets.top }, {  backgroundColor: colors.background, borderBottomColor: colors.border , paddingTop: Math.max(insets.top, 10) + 10 }]}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surface }]} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTextGroup}>
            <Text style={[styles.headerTitle, { color: colors.primary }]}>{postToEdit ? 'Editar Publicación' : 'Crear Publicación'}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>{postToEdit ? 'Modifica tu contenido' : 'Comparte tu arte con la comunidad'}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Barra de Progreso Global */}
        {(loading || uploadingImage) && (
          <View style={[styles.progressBarContainer, { backgroundColor: colors.border }]}>
            <View style={[styles.progressBar, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
          </View>
        )}

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          <TouchableOpacity style={[styles.imagePreviewContainer, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handlePickImage} disabled={uploadingImage || loading}>
            {uploadingImage ? (
              <View style={styles.imagePlaceholder}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.imagePlaceholderText, { color: colors.textMuted }]}>Subiendo foto... {Math.round(progress * 100)}%</Text>
              </View>
            ) : imagen ? (
              <Image source={{ uri: imagen }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <View style={[styles.uploadIconCircle, { backgroundColor: colors.primary + '20' }]}>
                  <Icon name="camera-outline" size={32} color={colors.primary} />
                </View>
                <Text style={[styles.imagePlaceholderText, { color: colors.textMuted }]}>Toca para añadir una foto (Opcional)</Text>
              </View>
            )}
            {!uploadingImage && !!imagen && (
              <View style={[styles.editImageBadge, { backgroundColor: colors.primary }]}>
                <Icon name="pencil" size={20} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Título *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]} placeholder="¿Qué vas a compartir hoy?" placeholderTextColor={colors.textMuted} value={titulo} onChangeText={setTitulo} editable={!loading} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Contenido *</Text>
            <TextInput style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]} placeholder="Describe el proceso, da consejos, o simplemente saluda..." placeholderTextColor={colors.textMuted} value={contenido} onChangeText={setContenido} multiline editable={!loading} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Enlace de Video Externo (Opcional)</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Icon name="logo-youtube" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput style={[styles.inputFlex, { color: colors.textPrimary }]} placeholder="https://youtube.com/watch?v=..." placeholderTextColor={colors.textMuted} value={videoURL} autoCapitalize="none" onChangeText={setVideoURL} editable={!loading} />
            </View>
          </View>

          <TouchableOpacity style={[styles.publishBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }, (loading || uploadingImage) && { opacity: 0.7 }]} onPress={handlePublish} disabled={loading || uploadingImage}>
            {loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ActivityIndicator color="#fff" style={{ marginRight: 10 }} />
                <Text style={[styles.publishBtnText, { color: colors.surface }]}>Publicando {Math.round(progress * 100)}%</Text>
              </View>
            ) : (
              <Text style={[styles.publishBtnText, { color: colors.surface }]}>{postToEdit ? 'Guardar Cambios' : 'Publicar ahora'}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  headerTextGroup: { alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  headerSubtitle: { fontSize: 12, marginTop: 2 },

  progressBarContainer: { width: '100%', height: 4, overflow: 'hidden' },
  progressBar: { height: '100%' },

  content: { padding: 20, paddingBottom: 60 },

  imagePreviewContainer: { width: '100%', height: 200, borderRadius: 16, overflow: 'hidden', marginBottom: 20, position: 'relative', borderWidth: 1 },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  uploadIconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  editImageBadge: { position: 'absolute', bottom: 15, right: 15, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  imagePlaceholderText: { marginTop: 10, fontSize: 14, fontWeight: 'bold' },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginLeft: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 15, height: 50 },
  inputIcon: { marginRight: 10 },
  inputFlex: { flex: 1, fontSize: 16 },
  input: { borderRadius: 12, paddingHorizontal: 15, height: 50, fontSize: 16, borderWidth: 1 },
  textArea: { height: 120, textAlignVertical: 'top', paddingTop: 15 },

  publishBtn: { borderRadius: 14, height: 55, justifyContent: 'center', alignItems: 'center', marginTop: 20, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  publishBtnText: { fontSize: 18, fontWeight: 'bold' }
});
