import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, FlatList, Image, ActivityIndicator, Dimensions, Keyboard, Platform, RefreshControl } from 'react-native';
import { getProducts, getCategories, getArtisans, getAllReviews } from '../../services/db';
import { useFavorites } from '../../context/FavoritesContext';
import { useTranslation, useTheme } from '../../context/ConfigContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationsContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import BottomNav from '../../components/BottomNav';
import { useToast } from '../../context/ToastContext';
import { useStore } from '../../context/StoreContext';
import AddressModal from '../../components/AddressModal';
import BecomeArtisanModal from '../../components/BecomeArtisanModal';

export default function MarketplaceScreen({ navigation, route }: any) {
  const { products: rawProducts, categories, artisans: rawArtisans, loading, refreshStore } = useStore();
  const { colors, themeMode, toggleThemeMode } = useTheme();
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [refreshing, setRefreshing] = useState(false);
  
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showBecomeArtisanModal, setShowBecomeArtisanModal] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  
  const { profile } = useAuth();
  const { favorites, toggleFavorite } = useFavorites();
  const { t } = useTranslation();
  const { unreadCount } = useNotifications();
  const toast = useToast();
  
  const userId = profile?.id;
  const address = (profile as any)?.direccion || 'Añadir dirección de entrega';

  const loadData = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    await refreshStore(refresh);
    setRefreshing(false);
  };

  useEffect(() => {
    // Cruzamos los datos de productos con los de artesanos para mostrar el nombre del autor en cada tarjeta
    const processed = rawProducts.map((p: any) => {
      const autor = rawArtisans.find((a: any) => a.id === p.artesanoId);
      return { ...p, autorNombre: autor?.nombre || 'Artesano Local', calificacion: p.calificacion || 'Nuevo' };
    });
    setProducts(processed);
  }, [rawProducts, rawArtisans]);

  useFocusEffect(
    useCallback(() => {
      loadData(false);
    }, [])
  );

  const handleSearchFocus = () => {
    setIsSearchMode(true);
  };

  const handleSearchCancel = () => {
    Keyboard.dismiss();
    setIsSearchMode(false);
    setSearchQuery('');
  };

  // Filtramos la lista basándonos en la categoría seleccionada y el texto que escribe el usuario
  const filteredProducts = useMemo(() => products.filter(p => {
    const matchCat = activeCategory === 'Todos' || p.categoria === activeCategory;
    const matchSearch = p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  }), [products, activeCategory, searchQuery]);

  const renderCustomHeader = () => {
    return (
      <View style={[styles.mlHeader, { paddingTop: Math.max(insets.top, Platform.OS === 'android' ? 20 : 0) + 10 }]}>
        {/* Buscador y notificaciones */}
        <View style={styles.mlHeaderTopRow}>
          {isSearchMode ? (
            <TouchableOpacity onPress={handleSearchCancel} style={styles.mlBackBtn}>
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ) : null}
          <View style={[styles.mlSearchBar, isSearchMode && { marginLeft: 10 }]}>
            <Icon name="search" size={18} color="#999" style={{ marginRight: 8 }} />
            <TextInput
              ref={searchInputRef}
              placeholder={t('marketplace.search_placeholder', 'Buscar artesanías...')}
              style={styles.mlSearchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={handleSearchFocus}
              placeholderTextColor="#999"
            />
          </View>
          {!isSearchMode && (
            <TouchableOpacity style={styles.mlNotifBtn} onPress={() => navigation.navigate('Notifications')}>
              <Icon name="notifications-outline" size={26} color="#fff" />
              {unreadCount > 0 && <View style={styles.headerDot} />}
            </TouchableOpacity>
          )}
        </View>

        {/* Address and Categories (Hidden in Search Mode) */}
        {!isSearchMode && (
          <>
            <TouchableOpacity 
              style={styles.mlAddressRow}
              onPress={() => setShowAddressModal(true)}
            >
              <Icon name="location-outline" size={16} color="#fff" />
              <Text style={styles.mlAddressText} numberOfLines={1}>Enviar a {address}</Text>
              <Icon name="chevron-down" size={14} color="#fff" />
            </TouchableOpacity>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mlCategoriesScroll}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.mlCategoryChip, activeCategory === cat && styles.mlCategoryChipActive]}
                  onPress={() => setActiveCategory(cat)}
                >
                  <Text style={[styles.mlCategoryText, activeCategory === cat && styles.mlCategoryTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    );
  };

  const renderFeaturedArtisans = () => (
    <View style={styles.featuredSection}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginLeft: 0 }]}>Artesanos Destacados</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mlArtisansScroll}>
        {rawArtisans.map(art => (
          <TouchableOpacity 
             key={art.id} 
             style={styles.mlArtisanCard}
             onPress={() => navigation.navigate('ArtesanoProfile', { artesano: art, profile })}
          >
            <View style={[styles.mlArtisanAvatar, { backgroundColor: colors.divider, borderColor: colors.primary }]}>
              {art.foto ? (
                <Image source={{ uri: art.foto }} style={styles.mlArtisanImg} />
              ) : (
                <Icon name="person" size={30} color={colors.textMuted} />
              )}
            </View>
            <Text style={[styles.mlArtisanName, { color: colors.textPrimary }]} numberOfLines={1}>{art.nombre.split(' ')[0]}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderUpgradeBanner = () => {
    if (profile?.tipo === 'Artesano') return null;
    return (
      <TouchableOpacity 
        style={styles.mlUpgradeBanner}
        activeOpacity={0.8}
        onPress={() => {
          console.log('[MARKETPLACE] Abriendo modal de artesano');
          setShowBecomeArtisanModal(true);
        }}
      >
        <View style={styles.mlUpgradeIconBox}>
          <Icon name="color-palette" size={24} color="#fff" />
        </View>
        <View style={styles.mlUpgradeTextBody}>
          <Text style={styles.mlUpgradeTitle}>¿Haces algo parecido?</Text>
          <Text style={styles.mlUpgradeSub}>Vende tus propias obras aquí.</Text>
        </View>
        <Icon name="arrow-forward" size={18} color="#fff" />
      </TouchableOpacity>
    );
  };

  const renderProduct = useCallback(({ item }: any) => {
    const isFav = favorites?.productos?.some((p: any) => p.id === item.id);
    return (
      <TouchableOpacity
        style={[styles.productCard, { backgroundColor: colors.surface }]}
        onPress={() => navigation.navigate('ProductDetail', { product: item, isCliente: profile?.tipo === 'Cliente' || !profile?.tipo })}
      >
        <View style={[styles.productImageWrapper, { backgroundColor: themeMode === 'light' ? '#F0EBE1' : '#2C2C2C' }]}>
          {item.imagen ? (
            <Image source={{ uri: item.imagen }} style={styles.productImage} />
          ) : (
            <View style={styles.productImgPlaceholder}>
              <Icon name="image-outline" size={40} color={colors.textMuted} />
            </View>
          )}
          {item.imagenes && item.imagenes.length > 1 && (
            <View style={styles.multiImageBadge}>
              <Icon name="copy" size={12} color="#fff" />
            </View>
          )}
          <TouchableOpacity
            style={[styles.favBtn, isFav && { backgroundColor: colors.primary }]}
            onPress={() => { 
              if (userId) {
                toggleFavorite(item, userId);
              } else {
                toast.confirm({
                  type: 'info',
                  title: '🎨 ¡Guarda tus favoritos!',
                  message: 'Inicia sesión para guardar las obras que más te gusten y no perderlas de vista. ✨',
                  confirmText: 'Ir a Iniciar Sesión',
                  cancelText: 'Más tarde',
                  onConfirm: () => navigation.navigate('Login')
                });
              }
            }}
          >
            <Icon name={isFav ? "heart" : "heart-outline"} size={16} color={isFav ? "#fff" : colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={1}>{item.nombre}</Text>
          <Text style={[styles.productArtist, { color: colors.textMuted }]} numberOfLines={1}>{item.autorNombre || 'Artesano Local'}</Text>
          <View style={styles.productRow}>
            <Text style={[styles.productPrice, { color: colors.primary }]}>${Math.round(item.precio || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
            <Text style={[styles.productRating, { color: colors.textSecondary }]}>
              <Icon name="star" size={12} color={colors.star} /> {item.calificacion}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [favorites, userId, colors, themeMode, navigation, toggleFavorite, toast, route, profile]);

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { paddingTop: insets.top,  backgroundColor: colors.background }]}>
      {renderCustomHeader()}
      
      {loading && products.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#B96A4A" />
        </View>
      ) : isSearchMode ? (
        <View style={[styles.searchOverlay, { backgroundColor: colors.background }]}>
          {searchQuery.length > 0 ? (
            <FlatList
              data={filteredProducts}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
              renderItem={renderProduct}
              showsVerticalScrollIndicator={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={6}
              windowSize={5}
              initialNumToRender={6}
              ListEmptyComponent={
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Icon name="search-outline" size={50} color={colors.textMuted} />
                  <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 10 }}>No hay productos que coincidan con tu búsqueda.</Text>
                </View>
              }
            />
          ) : (
            <View style={styles.searchEmptyState}>
              <Icon name="time-outline" size={50} color={colors.border} />
              <Text style={[styles.searchEmptyText, { color: colors.textSecondary }]}>Busca artesanías, cerámicas, joyas y más...</Text>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} tintColor="#B96A4A" />
          }
          ListHeaderComponent={
            <>
              {renderFeaturedArtisans()}
              {renderUpgradeBanner()}
              <View style={styles.recommendedHeader}>
                <Text style={[styles.recommendedPreTitle, { color: colors.primary }]}>DESCUBRE TU ESTILO</Text>
                <Text style={[styles.recommendedMainTitle, { color: colors.textPrimary }]}>
                  {t('marketplace.recommended', 'Recomendados para ti')}
                </Text>
                <View style={[styles.recommendedUnderline, { backgroundColor: colors.primary }]} />
              </View>
            </>
          }
          ListEmptyComponent={
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Icon name="albums-outline" size={50} color={colors.textMuted} />
              <Text style={{ color: colors.textMuted, textAlign: 'center', marginTop: 10 }}>Aún no hay productos en esta categoría.</Text>
            </View>
          }
          renderItem={renderProduct}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={6}
          windowSize={5}
          initialNumToRender={6}
        />
      )}

      <AddressModal 
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        currentAddress={(profile as any)?.direccion}
      />
      <BecomeArtisanModal 
        visible={showBecomeArtisanModal}
        onClose={() => setShowBecomeArtisanModal(false)}
      />
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F6F1' },

  // MercadoLibre Style Header
  mlHeader: { backgroundColor: '#B96A4A', paddingBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5, zIndex: 10 },
  mlHeaderTopRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 15 },
  mlBackBtn: { padding: 5, marginLeft: -5 },
  mlSearchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, height: 42, paddingHorizontal: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  mlSearchInput: { flex: 1, fontSize: 15, color: '#2D2D2D' },
  mlNotifBtn: { marginLeft: 15, padding: 5, position: 'relative' },
  headerDot: { position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF5A5F', borderWidth: 1.5, borderColor: '#B96A4A' },
  mlAddressRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, marginBottom: 12 },
  mlAddressText: { fontSize: 13, color: '#fff', marginHorizontal: 5, fontWeight: '500' },
  mlCategoriesScroll: { paddingHorizontal: 15, gap: 10 },
  mlCategoryChip: { paddingHorizontal: 15, paddingVertical: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16, marginRight: 8 },
  mlCategoryChipActive: { backgroundColor: '#fff' },
  mlCategoryText: { fontSize: 13, color: '#fff', fontWeight: '600' },
  mlCategoryTextActive: { color: '#B96A4A', fontWeight: 'bold' },
  
  // Search Overlay
  searchOverlay: { flex: 1, zIndex: 5 },
  searchEmptyState: { alignItems: 'center', marginTop: 80, paddingHorizontal: 20 },
  searchEmptyText: { marginTop: 15, fontSize: 15, textAlign: 'center' },

  // Featured Artisans
  featuredSection: { paddingHorizontal: 20, marginVertical: 15 },
  mlArtisansScroll: { paddingVertical: 5 },
  mlArtisanCard: { alignItems: 'center', marginRight: 18, width: 70 },
  mlArtisanAvatar: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 8, borderWidth: 2 },
  mlArtisanImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  mlArtisanName: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  
  mlUpgradeBanner: { marginHorizontal: 20, marginBottom: 25, backgroundColor: '#B96A4A', borderRadius: 16, padding: 15, flexDirection: 'row', alignItems: 'center', shadowColor: '#B96A4A', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4, zIndex: 5 },
  mlUpgradeIconBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  mlUpgradeTextBody: { flex: 1 },
  mlUpgradeTitle: { color: '#fff', fontSize: 15, fontWeight: '800', marginBottom: 2 },
  mlUpgradeSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '500' },

  // List & Products
  listContent: { paddingBottom: 110, paddingTop: 10 },
  sectionTitle: { fontSize: 22, fontWeight: '900', marginHorizontal: 20, marginBottom: 15, letterSpacing: -0.5 },
  
  recommendedHeader: { marginHorizontal: 20, marginTop: 10, marginBottom: 25 },
  recommendedPreTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 2, marginBottom: 4, textTransform: 'uppercase' },
  recommendedMainTitle: { fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  recommendedUnderline: { width: 50, height: 5, borderRadius: 3, marginTop: 10 },
  row: { justifyContent: 'space-between', paddingHorizontal: 0 },
  productCard: { width: (width - 8) / 2, borderRadius: 0, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  productImageWrapper: { height: 170, borderTopLeftRadius: 0, borderTopRightRadius: 0, position: 'relative', overflow: 'hidden' },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  productImgPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  multiImageBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  favBtn: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 18, width: 34, height: 34, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  productInfo: { padding: 12 },
  productName: { fontSize: 15, fontWeight: '800', marginBottom: 4 },
  productArtist: { fontSize: 13, marginBottom: 8 },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  productPrice: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  productRating: { fontSize: 13, fontWeight: '600' }
});
