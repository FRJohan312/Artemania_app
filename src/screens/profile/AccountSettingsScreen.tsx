import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useToast } from '../../context/ToastContext';
import { SafeAreaView } from { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { updateUserProfile, uploadImageAsync, deleteImageAsync } from '../../services/db';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ConfigContext';
import { hashSecretWord } from '../../utils/crypto';

export default function AccountSettingsScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { profile } = route.params || {};
  const { refreshProfile } = useAuth();
  const { colors } = useTheme();
  const toast = useToast();
  
  const [nombre, setNombre] = useState(profile?.nombre || '');
  const [pronombres, setPronombres] = useState(profile?.pronombres || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [palabraClave, setPalabraClave] = useState(''); // No cargamos el hash en la UI
  const [foto, setFoto] = useState(profile?.foto || '');
  
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
    });

    if (!result.didCancel && result.assets && result.assets.length > 0) {
      const selectedUri = result.assets[0].uri;
      if (!selectedUri) return;
      
      setUploadingPhoto(true);
      const fileName = `profile_${profile.id}_${Date.now()}.jpg`;
      const uploadRes = await uploadImageAsync(selectedUri, `profiles/${fileName}`);
      setUploadingPhoto(false);

      if (uploadRes.success && uploadRes.url) {
        setFoto(uploadRes.url);
        toast.success('📸 Foto Actualizada', 'Tu nueva foto de perfil se ve increíble. ✨');
      } else {
        toast.error('Foto no cargada', 'No pudimos actualizar tu foto en este momento. Inténtalo de nuevo.');
      }
    }
  };

  const handleSave = async () => {
    if (!nombre.trim()) {
      toast.warn('Nombre Requerido', 'Tu nombre es tu identidad artesanal. No puede estar vacío. 🎨');
      return;
    }

    setSaving(true);
    const dataToUpdate: any = { 
      nombre, 
      pronombres, 
      bio, 
      foto, 
    };

    if (palabraClave.trim()) {
      dataToUpdate.palabraClave = hashSecretWord(palabraClave);
    } else if (profile?.palabraClave) {
      dataToUpdate.palabraClave = profile.palabraClave;
    }

    const res = await updateUserProfile(profile.id, dataToUpdate);
    setSaving(false);

    if (res.success) {
      // Eliminar foto antigua de Supabase si fue reemplazada para liberar espacio
      if (profile?.foto && profile.foto !== foto) {
        deleteImageAsync(profile.foto).catch(e => console.log('Silently ignored delete error', e));
      }

      toast.success('✅ Perfil Guardado', 'Tus ajustes han sido actualizados con éxito.');
      // Refresh the global AuthContext profile so all screens reflect the changes
      await refreshProfile();
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('MainTabs');
      }
    } else {
      toast.error('No se pudo guardar', 'Ocurrió un inconveniente al guardar tus ajustes. Inténtalo de nuevo.');
    }
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { paddingTop: insets.top,  backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* FOTO SELECTION */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={handlePickImage} disabled={uploadingPhoto}>
               <View style={[styles.imageWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                 {uploadingPhoto ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                 ) : foto ? (
                    <Image source={{ uri: foto }} style={styles.avatarImg} />
                 ) : (
                    <Icon name="person" size={50} color={colors.textMuted} />
                 )}
               </View>
               <View style={[styles.editBadge, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
                 <Icon name="camera" size={14} color="#fff" />
               </View>
            </TouchableOpacity>
            <Text style={[styles.avatarHint, { color: colors.textMuted }]}>Toca para cambiar la foto</Text>
          </View>

          {/* FORM */}
          <View style={[styles.formCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.primary }]}>Información Pública</Text>
            
            <Text style={[styles.label, { color: colors.textSecondary }]}>Nombre Completo</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]} value={nombre} onChangeText={setNombre} placeholder="Tu nombre artístico o real" placeholderTextColor={colors.textMuted} />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Pronombres</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]} value={pronombres} onChangeText={setPronombres} placeholder="Opcional: Él, Ella, Elle, etc." placeholderTextColor={colors.textMuted} />

            <Text style={[styles.label, { color: colors.textSecondary }]}>Biografía</Text>
            <TextInput style={[styles.input, styles.textArea, { backgroundColor: colors.input, borderColor: colors.border, color: colors.textPrimary }]} value={bio} onChangeText={setBio} placeholder="Háblanos de tu pasión por el arte..." placeholderTextColor={colors.textMuted} multiline />

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            <Text style={[styles.sectionLabel, { color: colors.primary }]}>Seguridad y Recuperación</Text>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Palabra Secreta para Recuperación</Text>
            <TextInput 
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.primary, fontWeight: 'bold' }]} 
              value={palabraClave} 
              onChangeText={setPalabraClave} 
              placeholder="Ej. Mi primer gato"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
            />
            <Text style={[styles.inputHint, { color: colors.textMuted }]}>Esta palabra es necesaria si olvidas tu contraseña.</Text>
          </View>

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Guardar Ajustes</Text>}
          </TouchableOpacity>
          
          <View style={{height: 30}} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 30 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  
  scroll: { paddingHorizontal: 20, paddingBottom: 50, paddingTop: 20 },
  
  avatarSection: { alignItems: 'center', marginVertical: 30 },
  imageWrapper: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', borderWidth: 3, overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  editBadge: { position: 'absolute', bottom: 5, right: 0, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
  avatarHint: { marginTop: 10, fontSize: 13, fontWeight: '500' },
  
  formCard: { borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10, elevation: 2, borderWidth: 1 },
  sectionLabel: { fontSize: 16, fontWeight: '800', marginBottom: 20, textTransform: 'uppercase', letterSpacing: 0.5 },
  label: { fontSize: 13, fontWeight: 'bold', marginBottom: 6, marginLeft: 2 },
  input: { borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15, marginBottom: 18 },
  textArea: { height: 100, textAlignVertical: 'top' },
  divider: { height: 1, marginVertical: 15 },
  inputHint: { fontSize: 12, marginTop: -12, marginBottom: 15, fontStyle: 'italic' },
  
  saveBtn: { borderRadius: 15, padding: 18, alignItems: 'center', marginTop: 30, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
