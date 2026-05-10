import {  SafeAreaView , useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getProducts, updateProduct } from '../../services/db';
import { useTranslation } from '../../context/ConfigContext';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import MainHeader from '../../components/MainHeader';
import { useTheme } from '../../context/ConfigContext';

export default function ProductsScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { artesanoId } = route.params || {};
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'activo' | 'privado'>('all');
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { colors } = useTheme();

  const loadProducts = async () => {
    setLoading(true);
    // includePrivate = true para que el artesano vea sus obras ocultas
    const { data } = await getProducts(artesanoId, true);
    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleToggleVisibility = async (product: any) => {
    const newStatus = product.estado === 'privado' ? 'activo' : 'privado';
    const res = await updateProduct(product.id, { estado: newStatus });
    if (res.success) {
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, estado: newStatus } : p));
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const filteredProducts = products.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'activo') return !p.estado || p.estado === 'activo';
    return p.estado === 'privado';
  });

  const renderItem = ({ item }: any) => {
    const isPrivate = item.estado === 'privado';
    
    return (
      <TouchableOpacity 
        style={[styles.productCard, { backgroundColor: colors.surface, shadowColor: colors.border }, isPrivate && styles.privateCard]}
        onPress={() => navigation.navigate('ProductDetail', { product: item, isCliente: false, profile })}
        activeOpacity={0.9}
      >
        <View style={[styles.imageWrapper, { backgroundColor: colors.divider }]}>
          {item.imagen ? (
            <Image source={{ uri: item.imagen }} style={[styles.productImage, isPrivate && { opacity: 0.6 }]} />
          ) : (
            <View style={styles.placeholderImage}>
              <Icon name="image-outline" size={50} color={colors.textMuted} />
            </View>
          )}
          
          {isPrivate && (
            <View style={styles.privateBadge}>
              <Icon name="eye-off" size={12} color="#fff" style={{ marginRight: 4 }} />
              <Text style={styles.privateBadgeText}>Privado</Text>
            </View>
          )}

          <View style={styles.priceTag}>
            <Text style={styles.priceTagText}>${Math.round(item.precio || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
          </View>
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.cardHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.productName, { color: colors.textPrimary }, isPrivate && { color: colors.textMuted }]} numberOfLines={1}>
                {item.nombre}
              </Text>
              <Text style={[styles.productDesc, { color: colors.textSecondary }]} numberOfLines={1}>{item.descripcion}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.quickActionBtn, isPrivate ? { backgroundColor: colors.success } : { backgroundColor: colors.primary }]}
              onPress={() => handleToggleVisibility(item)}
            >
              <Icon name={isPrivate ? "eye" : "eye-off"} size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={[styles.cardFooter, { borderTopColor: colors.divider }]}>
            <Text style={[styles.detailsText, { color: colors.textMuted }]}>
              {isPrivate ? 'No visible en la tienda' : 'Visible para todos'}
            </Text>
            <View style={styles.statsRow}>
              <Icon name="star" size={14} color="#f1c40f" />
              <Text style={[styles.statsText, { color: colors.textSecondary }]}> {item.calificacion || 'Nuevo'}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    let title = t('products.empty_title', 'No tienes obras');
    let subtitle = t('products.empty_subtitle', 'Anímate a compartir tu arte con el mundo.');
    let icon = "cube-outline";

    if (filter === 'activo') {
      title = "No hay obras públicas";
      subtitle = "Tus obras visibles para los compradores aparecerán aquí.";
      icon = "eye-outline";
    } else if (filter === 'privado') {
      title = "No hay obras privadas";
      subtitle = "Aquí verás las obras que decidas ocultar temporalmente.";
      icon = "eye-off-outline";
    }

    return (
      <View style={styles.emptyState}>
        <Icon name={icon} size={80} color={colors.divider} />
        <Text style={[styles.emptyTitle, { color: colors.textSecondary }]}>{title}</Text>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>{subtitle}</Text>
        {filter === 'all' && (
          <TouchableOpacity 
            style={[styles.publishBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
            onPress={() => navigation.navigate('PublishProduct', { artesanoId, profile })}
          >
            <Icon name="add-circle-outline" size={20} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.publishBtnText}>{t('products.btn_publish', 'Publicar mi primera obra')}</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top,  backgroundColor: colors.background }]}>
      {/* Filtros por estado (Todas, Públicas, Privadas) */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.surface, shadowColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.tab, filter === 'all' && { backgroundColor: colors.primary }]} 
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.tabText, { color: colors.textMuted }, filter === 'all' && { color: '#fff' }]}>Todas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, filter === 'activo' && { backgroundColor: colors.primary }]} 
          onPress={() => setFilter('activo')}
        >
          <Text style={[styles.tabText, { color: colors.textMuted }, filter === 'activo' && { color: '#fff' }]}>Públicas</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, filter === 'privado' && { backgroundColor: colors.primary }]} 
          onPress={() => setFilter('privado')}
        >
          <Text style={[styles.tabText, { color: colors.textMuted }, filter === 'privado' && { color: '#fff' }]}>Privadas</Text>
        </TouchableOpacity>
      </View>

      {loading && products.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={products.length === 0 ? styles.emptyListContent : styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadProducts} tintColor={colors.primary} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, },
  backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginRight: 15 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 15, paddingBottom: 40 },
  emptyListContent: { flexGrow: 1, padding: 20 },
  
  productCard: { borderRadius: 24, marginBottom: 20, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6, overflow: 'hidden' },
  imageWrapper: { width: '100%', height: 200, position: 'relative' },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  priceTag: { position: 'absolute', bottom: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  priceTagText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  
  cardInfo: { padding: 20 },
  productName: { fontSize: 20, fontWeight: '900', marginBottom: 6 },
  productDesc: { fontSize: 14, marginBottom: 15, lineHeight: 22 },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 15 },
  detailsText: { fontSize: 13, fontWeight: 'bold' },
  
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 50 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  emptyText: { fontSize: 15, textAlign: 'center', marginTop: 8, paddingHorizontal: 20, marginBottom: 30 },
  publishBtn: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 25, borderRadius: 30, alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 5 },
  publishBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  tabsContainer: { flexDirection: 'row', padding: 5, marginHorizontal: 20, marginTop: 15, borderRadius: 15, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabText: { fontSize: 14, fontWeight: '700' },

  privateCard: { opacity: 0.8 },
  privateBadge: { position: 'absolute', top: 15, left: 15, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
  privateBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  quickActionBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 15, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 4 },
  
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statsText: { fontSize: 13, fontWeight: 'bold' }
});
