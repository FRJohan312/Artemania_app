import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import {  SafeAreaView , useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { getPedidos } from '../../services/db';
import MainHeader from '../../components/MainHeader';
import { useTheme } from '../../context/ConfigContext';

export default function PurchasesScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { clienteId } = route.params || {};
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors, themeMode } = useTheme();

  useEffect(() => {
    if (clienteId) {
      loadPedidos();
    }
  }, [clienteId]);

  const loadPedidos = async () => {
    setLoading(true);
    const { data } = await getPedidos(clienteId);
    if (data) {
      setPedidos(data);
    }
    setLoading(false);
  };
  
  const renderStatus = (status: string) => {
    if (status === 'En camino') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: themeMode === 'dark' ? 'rgba(51,154,240,0.2)' : '#e7f5ff' }]}>
          <Icon name="car-outline" size={14} color="#339af0" style={{marginRight: 5}} />
          <Text style={[styles.statusText, { color: '#339af0' }]}>{status}</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusBadge, { backgroundColor: themeMode === 'dark' ? 'rgba(64,192,87,0.2)' : '#ebfbee' }]}>
        <Icon name="checkmark-circle-outline" size={14} color={colors.success} style={{marginRight: 5}} />
        <Text style={[styles.statusText, { color: colors.success }]}>{status}</Text>
      </View>
    );
  };

  const renderPurchaseItem = ({ item }: { item: any }) => {
    const firstProduct = item.productos?.[0] || {};
    const hasMore = item.productos?.length > 1;
    const formattedDate = new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    
    return (
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.border }]}>
        <View style={[styles.imageContainer, { backgroundColor: colors.divider }]}>
          {firstProduct.imagen ? (
            <Image source={{ uri: firstProduct.imagen }} style={styles.image} />
          ) : (
            <Icon name="image-outline" size={30} color={colors.textMuted} style={{ alignSelf: 'center', marginTop: 35 }} />
          )}
        </View>
        <View style={styles.infoContainer}>
          <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={1}>
            {firstProduct.nombre || 'Producto'} {hasMore && <Text style={{color: colors.textMuted, fontSize: 13}}> +{item.productos.length - 1} más</Text>}
          </Text>
          <Text style={[styles.artistName, { color: colors.textMuted }]}>Artículos comprados: {item.productos?.length}</Text>
          
          <View style={styles.bottomRow}>
            <Text style={[styles.price, { color: colors.primary }]}>${Math.round(item.total || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>{formattedDate}</Text>
          </View>
          
          <View style={styles.statusRow}>
            {renderStatus(item.estado || 'Procesando')}
            <TouchableOpacity style={styles.detailBtn} onPress={() => navigation.navigate('OrderDetails', { order: item, isCliente: true })}>
              <Text style={[styles.detailBtnText, { color: colors.primary }]}>Ver detalles</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top,  backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { paddingTop: insets.top,  backgroundColor: colors.background }]}>
      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.id}
        renderItem={renderPurchaseItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Icon name="bag-remove-outline" size={60} color={colors.textMuted} style={{ marginBottom: 15 }} />
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>No has realizado compras aún.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  headerTitle: { fontSize: 24, fontWeight: '800' },
  
  listContainer: { padding: 15, paddingBottom: 40 },
  card: { borderRadius: 16, marginBottom: 15, padding: 12, flexDirection: 'row', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, borderWidth: 1 },
  
  imageContainer: { width: 90, height: 100, borderRadius: 12, overflow: 'hidden' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  infoContainer: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  productName: { fontSize: 16, fontWeight: 'bold' },
  artistName: { fontSize: 13, marginTop: 2 },
  
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  price: { fontSize: 15, fontWeight: '900' },
  date: { fontSize: 12, fontWeight: '500' },
  
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  
  detailBtn: { paddingHorizontal: 10, paddingVertical: 5 },
  detailBtnText: { fontSize: 13, fontWeight: '600' }
});
