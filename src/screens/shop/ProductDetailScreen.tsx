import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image, Dimensions, FlatList, Modal } from 'react-native';
import styles from './ProductDetailScreen.styles';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { useTranslation, useTheme } from '../../context/ConfigContext';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../services/firebaseConnection';
import { deleteProduct, updateProduct } from '../../services/db';
import { uploadImageAsync } from '../../services/storage';
import Icon from 'react-native-vector-icons/Ionicons';
import ReportModal from '../../components/ReportModal';
import { useToast } from '../../context/ToastContext';
import { useProductDetail } from '../../hooks/useProductDetail';
import ProductReviews from '../../components/ProductReviews';
import ProductOwnerControls from '../../components/ProductOwnerControls';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Product } from '../../types';

export default function ProductDetailScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { product, isCliente } = route.params;
  const { profile } = useAuth();
  const { colors } = useTheme();
  const isAdmin = profile?.isAdmin || false;
  const [cantidad, setCantidad] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const { addToCart } = useCart();
  const { favorites, toggleFavorite } = useFavorites();
  const toast = useToast();
  // Importante: No usamos solo auth.currentUser?.uid porque la app usa inicio anónimo para invitados.
  // Un usuario "real" es aquel que tiene un perfil cargado.
  const userId = profile ? auth.currentUser?.uid : undefined;
  
  const isOwner = userId === product.artesanoId;

  // Use Custom Hook
  const { 
    reviews, isLoadingReviews, artesanoInfo, 
    myReview, addReview, isSubmittingReview,
    deleteReview, updateReview 
  } = useProductDetail(product.id, product.artesanoId, userId);

  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  if (!product) {
    return (
      <View style={styles.centerContainer}>
        <Icon name="alert-circle-outline" size={60} color="#ccc" />
        <Text style={styles.errorText}>Producto no encontrado</Text>
      </View>
    );
  }

  const isFav = favorites?.productos?.some((p: any) => p.id === product.id);

  const handleAddToCart = async () => {
    if (!userId) {
      toast.confirm({
        type: 'info',
        title: '🛒 Tu Carrito te espera',
        message: 'Inicia sesión para añadir esta obra a tu carrito y completar tu colección de arte. ✨',
        confirmText: 'Ir a Iniciar Sesión',
        cancelText: 'Más tarde',
        onConfirm: () => navigation.navigate('Login')
      });
      return;
    }
    setIsAddingToCart(true);
    const productWithMeta = {
      ...product,
      autorNombre: artesanoInfo?.nombre || product.autorNombre || 'Artesano Local',
    };
    await addToCart(productWithMeta, cantidad, userId);
    setIsAddingToCart(false);
    
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('MainTabs');
      }
    }, 1500);
  };

  const handleToggleFav = async () => {
    if (!userId) {
      toast.confirm({
        type: 'info',
        title: '❤️ ¡Guarda lo que amas!',
        message: 'Inicia sesión para guardar tus obras favoritas y crear tu propia galería personal. ✨',
        confirmText: 'Ir a Iniciar Sesión',
        cancelText: 'Más tarde',
        onConfirm: () => navigation.navigate('Login')
      });
      return;
    }
    await toggleFavorite(product, userId);
  };

  const handleDelete = () => {
    toast.confirm({
      type: 'danger',
      title: 'Retirar del Mercado',
      message: '¿Deseas retirar esta obra de forma permanente? Esta acción no se puede deshacer.',
      confirmText: 'Sí, retirar',
      destructive: true,
      onConfirm: async () => {
        const res = await deleteProduct(product.id);
        if (res.success) {
          toast.success('✅ Obra Retirada', 'La obra ha sido eliminada del mercado exitosamente.');
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('MainTabs');
          }
        } else {
          toast.error('No se pudo eliminar', 'Ocurrió un inconveniente. Inténtalo de nuevo en unos momentos.');
        }
      },
    });
  };

  const handleSubmitReview = async (rating: number, comment: string, photoUris?: string[]) => {
    if (!profile || !userId) {
      toast.warn('Sesión requerida', 'Inicia sesión para dejar una reseña.');
      return;
    }
    try {
      let uploadedPhotos: string[] = [];
      
      if (photoUris && photoUris.length > 0) {
        for (const uri of photoUris) {
          const uploadRes = await uploadImageAsync(uri, 'reviews/');
          if (uploadRes.success && uploadRes.url) {
            uploadedPhotos.push(uploadRes.url);
          }
        }
      }

      await addReview({
        userId: userId,
        userName: profile?.nombre || 'Usuario',
        userFoto: profile?.foto || '',
        rating,
        comment: comment.trim(),
        ...(uploadedPhotos.length > 0 ? { fotos: uploadedPhotos } : {})
      });
      toast.success('¡Opinión Registrada! ⭐', 'Gracias por apoyar el trabajo artesanal con tu calificación.');
    } catch {
      toast.error('No se pudo guardar', 'Tu opinión es importante, pero hubo un inconveniente. Inténtalo nuevamente.');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    toast.confirm({
      type: 'danger',
      title: 'Eliminar Reseña',
      message: '¿Estás seguro de que deseas eliminar esta opinión? Esta acción es irreversible.',
      confirmText: 'Eliminar',
      destructive: true,
      onConfirm: async () => {
        try {
          await deleteReview(reviewId);
          toast.success('Reseña Eliminada', 'La opinión ha sido borrada del sistema.');
        } catch {
          toast.error('Error', 'No se pudo eliminar la reseña en este momento.');
        }
      }
    });
  };

  const handleUpdateReview = async (reviewId: string, rating: number, comment: string) => {
    try {
      await updateReview({
        reviewId,
        data: {
          rating,
          comment: comment.trim()
        }
      });
      toast.success('Opinión Actualizada', 'Tus cambios se han guardado con éxito.');
    } catch {
      toast.error('Error', 'No se pudo actualizar tu opinión en este momento.');
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* IMAGE CAROUSEL */}
        <View style={styles.imageContainer}>
          {product.imagenes && product.imagenes.length > 0 ? (
            <>
              <FlatList
                data={product.imagenes}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / Dimensions.get('window').width);
                  setActiveImageIndex(index);
                }}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    activeOpacity={0.9} 
                    onPress={() => setShowFullscreen(true)}
                    style={{ width: Dimensions.get('window').width, height: 350 }}
                  >
                    <Image source={{ uri: item }} style={styles.productImage} />
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
              />
              {product.imagenes.length > 1 && (
                <View style={styles.paginationDots}>
                  {product.imagenes.map((_: any, i: number) => (
                    <View 
                      key={i} 
                      style={[
                        styles.dot, 
                        activeImageIndex === i && styles.activeDot
                      ]} 
                    />
                  ))}
                </View>
              )}
            </>
          ) : product.imagen ? (
            <TouchableOpacity activeOpacity={0.9} onPress={() => setShowFullscreen(true)}>
              <Image source={{ uri: product.imagen }} style={styles.productImage} />
            </TouchableOpacity>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="image-outline" size={80} color="#ccc" />
            </View>
          )}
          
          {/* FULLSCREEN MODAL */}
          <Modal visible={showFullscreen} transparent animationType="fade">
            <View style={styles.fullscreenContainer}>
              <TouchableOpacity style={styles.closeFullscreen} onPress={() => setShowFullscreen(false)}>
                <Icon name="close" size={30} color="#fff" />
              </TouchableOpacity>
              
              <FlatList
                data={(product.imagenes && product.imagenes.length > 0) ? product.imagenes : [product.imagen]}
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
              
              <View style={styles.fullscreenFooter}>
                <Text style={styles.fullscreenCount}>
                  {((product.imagenes && product.imagenes.length > 0) ? product.imagenes : [product.imagen]).length > 1 
                    ? `${activeImageIndex + 1} / ${((product.imagenes && product.imagenes.length > 0) ? product.imagenes : [product.imagen]).length}`
                    : ''}
                </Text>
              </View>
            </View>
          </Modal>
        </View>

        <View style={[styles.infoContainer, { backgroundColor: colors.surface }]}>
          {/* HEADER ROW */}
          <View style={styles.headerRow}>
            <View style={{flex: 1}}>
              <Text style={[styles.title, { color: colors.textPrimary }]} numberOfLines={2}>{product.nombre}</Text>
              <View style={styles.ratingOverviewRow}>
                <Icon name="star" size={16} color={colors.star} />
                <Text style={[styles.ratingText, { color: colors.textMuted }]}> {avgRating} ({reviews.length} reseñas)</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.favBtnLg, { backgroundColor: isFav ? colors.primary : colors.background }, isFav && { backgroundColor: colors.primary }]}
              onPress={handleToggleFav}
            >
              <Icon name={isFav ? "heart" : "heart-outline"} size={26} color={isFav ? "#fff" : colors.primary} />
            </TouchableOpacity>
          </View>

          {/* PRICE & CATEGORY */}
          <View style={styles.metaRow}>
            <Text style={[styles.price, { color: colors.primary }]}>${Math.round(product.precio || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
            {product.categoria && (
              <View style={[styles.categoryBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.categoryText, { color: colors.primary }]}>{product.categoria}</Text>
              </View>
            )}
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Descripción</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>{product.descripcion}</Text>

          {/* ARTESANO CARD */}
          {artesanoInfo && (
            <TouchableOpacity 
               style={[styles.artesanoCardMini, { backgroundColor: colors.background, borderColor: colors.border }]} 
               onPress={() => navigation.navigate('ArtesanoProfile', { artesano: artesanoInfo, profile })}
            >
               <View style={[styles.artesanoAvatarMini, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                 {artesanoInfo.foto ? (
                   <Image source={{ uri: artesanoInfo.foto }} style={styles.artesanoImgMini} />
                 ) : (
                   <Icon name="person" size={24} color="#ccc" />
                 )}
               </View>
               <View style={styles.artesanoInfoMini}>
                 <Text style={[styles.artesanoMiniTitle, { color: colors.textMuted }]}>Obra creada por:</Text>
                 <Text style={[styles.artesanoMiniName, { color: colors.textPrimary }]}>{artesanoInfo.nombre}</Text>
               </View>
               <Icon name="chevron-forward" size={24} color={colors.textMuted} />
            </TouchableOpacity>
          )}

          {/* REPORT BUTTON */}
          {!isOwner && (
            <TouchableOpacity 
              style={styles.reportBtnLink} 
              onPress={() => {
                if (!profile) {
                  toast.confirm({
                    type: 'info',
                    title: '🛡️ Seguridad Artemanía',
                    message: 'Para reportar una obra y ayudarnos a mantener la calidad de nuestra comunidad, por favor inicia sesión primero. ✨',
                    confirmText: 'Ir a Iniciar Sesión',
                    cancelText: 'Más tarde',
                    onConfirm: () => navigation.navigate('Login')
                  });
                } else {
                  setShowReportModal(true);
                }
              }}
            >
              <Icon name="flag-outline" size={16} color={colors.textMuted} />
              <Text style={[styles.reportBtnText, { color: colors.textMuted }]}>Reportar Obra Inapropiada</Text>
            </TouchableOpacity>
          )}

          {/* OWNER CONTROLS */}
          {isOwner && (
            <ProductOwnerControls 
               product={product}
               onEdit={() => navigation.navigate('PublishProduct', { artesanoId: product.artesanoId, profile, productToEdit: product })}
               onToggleVisibility={async () => {
                  const newStatus = product.estado === 'activo' ? 'privado' : 'activo';
                  const res = await updateProduct(product.id, { estado: newStatus });
                  if (res.success) {
                    navigation.setParams({ product: { ...product, estado: newStatus } });
                    toast.success('✅ Visibilidad Actualizada', `Tu obra ahora está ${newStatus === 'activo' ? 'visible' : 'oculta'} del Mercado`);
                  }
               }}
               onDelete={handleDelete}
            />
          )}

          {/* ADMIN CONTROLS (IF NOT OWNER) */}
          {isAdmin && !isOwner && (
            <View style={[styles.adminControls, { backgroundColor: colors.primaryLight, borderColor: colors.border }]}>
              <Text style={[styles.adminTitle, { color: colors.primary }]}><Icon name="shield-checkmark" size={16} color={colors.danger} /> Controles de Admin</Text>
              <View style={styles.adminBtns}>
                <TouchableOpacity style={[styles.editBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('PublishProduct', { artesanoId: product.artesanoId, profile, productToEdit: product })}>
                  <Icon name="pencil" size={20} color="#fff" />
                  <Text style={styles.adminBtnText}>Editar Producto</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: colors.danger }]} onPress={handleDelete}>
                  <Icon name="trash" size={20} color="#fff" />
                  <Text style={styles.adminBtnText}>Eliminar Definitivamente</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* REVIEWS SECTION */}
          <ProductReviews
            reviews={reviews}
            isLoading={isLoadingReviews}
            myReview={myReview}
            userId={userId}
            isAdmin={isAdmin}
            isOwner={isOwner}
            isSubmitting={isSubmittingReview}
            onSubmitReview={handleSubmitReview}
            onUpdateReview={handleUpdateReview}
            onDeleteReview={handleDeleteReview}
            onLoginPrompt={() => toast.warn('Sesión requerida', 'Inicia sesión para dejar una reseña.')}
            onOwnerPrompt={() => toast.info('Artista Detectado 🎨', 'No puedes calificar tu propia creación.')}
          />
        </View>
      </ScrollView>

      {/* BOTTOM ACTION BAR FOR BUYERS */}
      {!isOwner && (
        <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.divider }]}>
          {profile ? (
            <>
              <View style={[styles.qtyControls, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => setCantidad(Math.max(1, cantidad - 1))}>
                  <Icon name="remove" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.qtyText, { color: colors.textPrimary }]}>{cantidad}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => setCantidad(cantidad + 1)}>
                  <Icon name="add" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={[styles.addToCartBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }, isAddingToCart && {opacity: 0.7}]} onPress={handleAddToCart} disabled={isAddingToCart}>
                {isAddingToCart ? (
                   <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Icon name="cart" size={24} color="#fff" style={{marginRight: 8}} />
                    <Text style={styles.addToCartText}>Agregar ${Math.round(product.precio * cantidad).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={[styles.addToCartBtn, { flex: 1, backgroundColor: colors.primary }]} 
              onPress={() => navigation.navigate('Login')}
            >
              <Icon name="log-in-outline" size={24} color="#fff" style={{marginRight: 10}} />
              <Text style={styles.addToCartText}>Inicia sesión para comprar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {showToast && (
        <View style={[styles.toastContainer, { backgroundColor: colors.success }]}>
          <Icon name="checkmark-circle" size={24} color="#fff" style={{marginRight: 8}} />
          <Text style={styles.toastText}>¡Añadido al carrito con éxito!</Text>
        </View>
      )}

      <ReportModal 
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetId={product.id}
        targetType="producto"
        targetName={product.nombre}
      />
    </View>
  );
}

