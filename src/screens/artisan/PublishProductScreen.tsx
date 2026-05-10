import {  SafeAreaView , useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TextInput, ActivityIndicator, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useToast } from '../../context/ToastContext';
import { createProduct, updateProduct, getCategories, uploadImageAsync } from '../../services/db';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../context/ConfigContext';

export default function PublishProductScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { artesanoId, profile, productToEdit } = route.params || {};
  const toast = useToast();
  const { colors } = useTheme();
  const [nombre, setNombre] = useState(productToEdit?.nombre || '');
  const [precio, setPrecio] = useState(productToEdit?.precio?.toString() || '');
  const [descripcion, setDescripcion] = useState(productToEdit?.descripcion || '');
  const [imagenes, setImagenes] = useState<string[]>(productToEdit?.imagenes || (productToEdit?.imagen ? [productToEdit.imagen] : []));
  const [categoria, setCategoria] = useState(productToEdit?.categoria || '');
  
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handlePickProductImage = async () => {
    if (imagenes.length >= 5) {
      toast.warn('Límite alcanzado', 'Puedes subir hasta 5 fotografías por obra para mostrar cada detalle.');
      return;
    }

    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 5 - imagenes.length,
      quality: 0.8,
    });

    if (!result.didCancel && result.assets && result.assets.length > 0) {
      setUploadingImage(true);
      const newUrls: string[] = [];
      
      for (const asset of result.assets) {
        if (!asset.uri) continue;
        const fileName = `product_${artesanoId || profile?.id}_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const uploadRes = await uploadImageAsync(asset.uri, `products/${fileName}`);
        if (uploadRes.success && uploadRes.url) {
          newUrls.push(uploadRes.url);
        }
      }
      
      setUploadingImage(false);

      if (newUrls.length > 0) {
        setImagenes(prev => [...prev, ...newUrls]);
        toast.success('📸 Fotos listas', `${newUrls.length} ${newUrls.length === 1 ? 'fotografía ha' : 'fotografías han'} sido cargadas con éxito.`);
      } else {
        toast.error('Error al cargar', 'No pudimos subir tus imágenes. Revisa tu conexión.');
      }
    }
  };

  const removeImage = (index: number) => {
    setImagenes(prev => prev.filter((_, i) => i !== index));
  };

  useFocusEffect(
    useCallback(() => {
      const fetchCats = async () => {
        const res = await getCategories();
        if (res.data && res.data.length > 0) {
          const catNames = res.data.map((c: any) => c.nombre);
          setCategories(catNames);
          // Sólo inicializar si no hay categoría seleccionada aún
          setCategoria((prev: string) => prev || catNames[0]);
        }
        setInitLoading(false);
      };
      fetchCats();
    }, [])
  );

  const handlePublish = async () => {
    if (!nombre || !precio || !descripcion) {
      toast.warn('Faltan Detalles', 'Cada obra necesita un nombre, un precio y una descripción para brillar en el Mercado. ✨');
      return;
    }

    setLoading(true);
    const data: any = {
      nombre,
      precio: parseFloat(precio),
      descripcion,
      imagen: imagenes[0] || '', // Imagen principal para compatibilidad
      imagenes, // Array completo
      categoria,
      artesanoId: productToEdit?.artesanoId || artesanoId || profile?.id || 'unknown'
    };
    
    let success, error;
    if (productToEdit) {
      const res = await updateProduct(productToEdit.id, data);
      success = res.success;
      error = res.error;
    } else {
      data.createdAt = new Date().toISOString();
      const res = await createProduct(data);
      success = res.success;
      error = res.error;
    }
    
    setLoading(false);

    if (success) {
      toast.success('¡Listo! 🎉', productToEdit ? 'Tu obra ha sido actualizada con los nuevos detalles.' : '¡Tu obra ya brilla en el Mercado! Los compradores podrán descubrirla.');
      navigation.goBack();
    } else {
      toast.error('No se pudo publicar', 'Ocurrió un inconveniente al publicar tu obra. Inténtalo de nuevo.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <View style={[styles.header, { paddingTop: insets.top }, {  backgroundColor: colors.background, borderBottomColor: colors.border , paddingTop: Math.max(insets.top, 10) + 10 }]}>
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surface }]} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTextGroup}>
             <Text style={[styles.headerTitle, { color: colors.primary }]}>{productToEdit ? 'Editar Obra' : 'Publicar Obra'}</Text>
             <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>Detalla tu obra maestra para el mundo</Text>
          </View>
          <View style={{width: 40}} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <View style={styles.imageSection}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Imágenes de la obra (máx 5)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
              {imagenes.map((img, index) => (
                <View key={index} style={[styles.imageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Image source={{ uri: img }} style={styles.imagePreviewThumb} />
                  <TouchableOpacity style={[styles.removeImageBtn, { backgroundColor: colors.surface }]} onPress={() => removeImage(index)}>
                    <Icon name="close-circle" size={20} color={colors.error || "#ff6b6b"} />
                  </TouchableOpacity>
                  {index === 0 && (
                    <View style={[styles.mainImageBadge, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.mainImageText, { color: colors.surface }]}>Principal</Text>
                    </View>
                  )}
                </View>
              ))}
              
              {imagenes.length < 5 && (
                <TouchableOpacity 
                  style={[styles.addImageBtn, { borderColor: colors.primary, backgroundColor: colors.surface }, uploadingImage && { opacity: 0.5 }]} 
                  onPress={handlePickProductImage}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <>
                      <Icon name="camera-outline" size={24} color={colors.primary} />
                      <Text style={[styles.addImageText, { color: colors.primary }]}>Añadir</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>O introduce una URL de imagen</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Icon name="link-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput 
                style={[styles.inputFlex, { color: colors.textPrimary }]} 
                placeholder="https://ejemplo.com/foto.jpg" 
                placeholderTextColor={colors.textMuted} 
                value={imagenes[0] || ''} 
                autoCapitalize="none" 
                onChangeText={(val) => setImagenes(prev => prev.length > 0 ? [val, ...prev.slice(1)] : [val])} 
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Nombre de la obra *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]} placeholder="Ejem: Vasija de barro ceremonial" placeholderTextColor={colors.textMuted} value={nombre} onChangeText={setNombre} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Precio (COP) *</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>$</Text>
              <TextInput style={[styles.inputFlex, { color: colors.textPrimary }]} placeholder="15000" placeholderTextColor={colors.textMuted} value={precio} onChangeText={setPrecio} keyboardType="numeric" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Categoría</Text>
            {initLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
                {categories.map(cat => (
                  <TouchableOpacity 
                    key={cat} 
                    style={[styles.catChip, { backgroundColor: colors.surface, borderColor: colors.border }, categoria === cat && { backgroundColor: colors.primary, borderColor: colors.primary, shadowColor: colors.primary }]}
                    onPress={() => setCategoria(cat)}
                  >
                    <Text style={[styles.catText, { color: colors.textSecondary }, categoria === cat && { color: colors.surface }]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Descripción de la obra *</Text>
            <TextInput style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.textPrimary }]} placeholder="Cuenta la historia, técnica y materiales de tu artesanía..." placeholderTextColor={colors.textMuted} value={descripcion} onChangeText={setDescripcion} multiline />
          </View>

          <TouchableOpacity style={[styles.publishBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }, loading && {opacity: 0.7}]} onPress={handlePublish} disabled={loading || initLoading}>
            {loading ? <ActivityIndicator color={colors.surface} /> : (
               <Text style={[styles.publishBtnText, { color: colors.surface }]}>
                 {productToEdit ? 'Guardar Cambios' : 'Lanzar al Mercado'}
               </Text>
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
  
  content: { padding: 20, paddingBottom: 60 },
  
  imagePreviewContainer: { width: '100%', height: 200, borderRadius: 16, overflow: 'hidden', marginBottom: 20, position: 'relative' },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  uploadIconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  editImageBadge: { position: 'absolute', bottom: 15, right: 15, width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  imagePlaceholderText: { marginTop: 10, fontSize: 14, fontWeight: 'bold' },
  
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginLeft: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 15, height: 50 },
  inputIcon: { marginRight: 10 },
  currencySymbol: { fontSize: 18, fontWeight: 'bold', marginRight: 10 },
  inputFlex: { flex: 1, fontSize: 16 },
  input: { borderRadius: 12, paddingHorizontal: 15, height: 50, fontSize: 16, borderWidth: 1 },
  textArea: { height: 120, textAlignVertical: 'top', paddingTop: 15 },
  
  catScroll: { flexDirection: 'row', paddingBottom: 5 },
  catChip: { paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderRadius: 20, marginRight: 8 },
  catText: { fontWeight: 'bold', fontSize: 13 },
  
  publishBtn: { borderRadius: 14, height: 55, justifyContent: 'center', alignItems: 'center', marginTop: 20, shadowOffset: { width:0, height:4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  publishBtnText: { fontSize: 18, fontWeight: 'bold' },

  imageSection: { marginBottom: 25 },
  imagesScroll: { flexDirection: 'row', marginTop: 10 },
  imageCard: { width: 120, height: 120, borderRadius: 12, marginRight: 12, borderWidth: 1, position: 'relative', overflow: 'hidden' },
  imagePreviewThumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImageBtn: { position: 'absolute', top: 5, right: 5, borderRadius: 10 },
  mainImageBadge: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingVertical: 4, alignItems: 'center' },
  mainImageText: { fontSize: 10, fontWeight: 'bold' },
  addImageBtn: { width: 120, height: 120, borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  addImageText: { fontSize: 12, fontWeight: 'bold', marginTop: 8 }
});
