import { SafeAreaView } from { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useFavorites } from '../../context/FavoritesContext';
import { auth } from '../../services/firebaseConnection';
import { useTranslation, useTheme } from '../../context/ConfigContext';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import MainHeader from '../../components/MainHeader';

const { width } = Dimensions.get('window');

export default function FavoritesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { favorites, toggleFavorite } = useFavorites();
  const userId = auth.currentUser?.uid;
  const { t } = useTranslation();
  const { profile } = useAuth();
  const { colors } = useTheme();

  const renderProduct = ({ item }: any) => (
    <TouchableOpacity 
      style={[styles.productCard, { backgroundColor: colors.surface, shadowColor: colors.border }]}
      onPress={() => navigation.navigate('ProductDetail', { product: item, isCliente: true, profile })}
    >
      <View style={[styles.productImageWrapper, { backgroundColor: colors.divider }]}>
        {item.imagen ? (
           <Image source={{ uri: item.imagen }} style={styles.productImgResult} />
        ) : (
           <View style={styles.productImgPlaceholder}>
             <Icon name="image-outline" size={40} color={colors.textMuted} />
           </View>
        )}
        <TouchableOpacity 
          style={[styles.favBtn, { backgroundColor: colors.primary }]} 
          onPress={() => {
            if (userId) toggleFavorite(item, userId);
          }}
        >
          <Icon name="heart" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={1}>{item.nombre}</Text>
        <Text style={[styles.productArtist, { color: colors.textMuted }]} numberOfLines={1}>{item.autorNombre || 'Artesano Local'}</Text>
        <View style={styles.productRow}>
          <Text style={[styles.productPrice, { color: colors.primary }]}>${Math.round(item.precio || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
          <Text style={[styles.productRating, { color: colors.textSecondary }]}><Icon name="star" size={12} color="#f1c40f" /> {item.calificacion === 0 || !item.calificacion ? 'Nuevo' : item.calificacion}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );



  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { paddingTop: insets.top,  backgroundColor: colors.background }]}>
      <FlatList
        data={favorites.productos}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="heart-dislike-outline" size={80} color={colors.divider} style={{marginBottom: 20}} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('favorites.empty_title', 'Aún no tienes favoritos guardados.')}</Text>
            <TouchableOpacity style={[styles.exploreBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Marketplace')}>
              <Text style={styles.exploreBtnText}>{t('favorites.btn_explore', 'Explorar Productos')}</Text>
            </TouchableOpacity>
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

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', margin: 20 },
  listContent: { paddingBottom: 110 },
  row: { justifyContent: 'space-between', paddingHorizontal: 15 },
  productCard: { width: (width - 45) / 2, borderRadius: 16, marginBottom: 15, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, overflow: 'hidden' },
  productImageWrapper: { height: 180, position: 'relative' },
  productImgPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  favBtn: { position: 'absolute', top: 10, right: 10, borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  productInfo: { padding: 12 },
  productName: { fontSize: 14, fontWeight: 'bold', marginBottom: 2 },
  productArtist: { fontSize: 12, marginBottom: 4 },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  productPrice: { fontSize: 16, fontWeight: '900' },
  productRating: { fontSize: 12, fontWeight: '500' },
  
  // Empty State
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100, paddingHorizontal: 20 },
  emptyText: { fontSize: 16, textAlign: 'center', marginBottom: 30 },
  exploreBtn: { paddingHorizontal: 25, paddingVertical: 12, borderRadius: 25 },
  exploreBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  productImgResult: { width: '100%', height: '100%', resizeMode: 'cover' }
});
