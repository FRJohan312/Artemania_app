import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useToast } from '../../context/ToastContext';
import {  SafeAreaView , useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { getVentas, updatePedidoStatus } from '../../services/db';
import MainHeader from '../../components/MainHeader';
import { useTheme } from '../../context/ConfigContext';

export default function SalesScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { artesanoId } = route.params || {};
  const [ventas, setVentas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { colors, themeMode } = useTheme();
  
  useEffect(() => {
    if (artesanoId) {
      loadVentas();
    }
  }, [artesanoId]);

  const loadVentas = async () => {
    setLoading(true);
    const { data } = await getVentas(artesanoId);
    if (data) {
      setVentas(data);
    }
    setLoading(false);
  };

  const handleStatusChange = (pedidoId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Pendiente de envío' ? 'En camino' : 'Entregado';

    toast.confirm({
      type: 'info',
      title: 'Actualizar Envío 📦',
      message: `¿Deseas marcar este pedido como "${nextStatus}"?`,
      confirmText: 'Sí, actualizar',
      onConfirm: async () => {
        const { success } = await updatePedidoStatus(pedidoId, nextStatus);
        if (success) {
          loadVentas(); 
          toast.success('Estado Actualizado', `El pedido ahora está "${nextStatus}"`);
        } else {
          toast.error('No se pudo actualizar', 'Ocurrió un inconveniente al cambiar el estado del envío. Inténtalo de nuevo.');
        }
      }
    });
  };

  
  const renderStatus = (status: string) => {
    if (status === 'Pendiente de envío') {
      return (
        <View style={[styles.statusBadge, { backgroundColor: themeMode === 'dark' ? 'rgba(245,159,0,0.2)' : '#fff4e6' }]}>
          <Icon name="time-outline" size={14} color="#f59f00" style={{marginRight: 5}} />
          <Text style={[styles.statusText, { color: '#f59f00' }]}>{status}</Text>
        </View>
      );
    }
    return (
      <View style={[styles.statusBadge, { backgroundColor: themeMode === 'dark' ? 'rgba(51,154,240,0.2)' : '#e7f5ff' }]}>
        <Icon name="airplane-outline" size={14} color="#339af0" style={{marginRight: 5}} />
        <Text style={[styles.statusText, { color: '#339af0' }]}>{status}</Text>
      </View>
    );
  };

  const renderSaleItem = ({ item }: { item: any }) => {
    const firstProduct = item.productos?.[0] || {};
    const formattedDate = new Date(item.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    const isCompleted = item.estado === 'Entregado';

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
          <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={1}>{firstProduct.nombre || 'Producto Múltiple'}</Text>
          <Text style={[styles.clientName, { color: colors.textMuted }]}>Ver Detalles para Cliente</Text>
          
          <View style={styles.bottomRow}>
            <Text style={[styles.price, { color: colors.success }]}>+${Math.round(item.total || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
            <Text style={[styles.date, { color: colors.textSecondary }]}>{formattedDate}</Text>
          </View>
          
          <View style={styles.statusRow}>
            {renderStatus(item.estado || 'Recibido')}
            <View style={{flexDirection: 'row', gap: 6}}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.background, borderColor: colors.divider }]} onPress={() => navigation.navigate('OrderDetails', { order: item, isCliente: false })}>
                <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>Obras</Text>
              </TouchableOpacity>
              {!isCompleted && (
                <TouchableOpacity style={[styles.actionBtn, {backgroundColor: '#4dabf7', borderColor: '#4dabf7'}]} onPress={() => handleStatusChange(item.id, item.estado)}>
                  <Text style={[styles.actionBtnText, {color: '#fff'}]}>Avanzar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  const totalRevenue = ventas.reduce((sum, v) => sum + (v.total || 0), 0);
  const pendingCount = ventas.filter(v => v.estado === 'Pendiente de envío').length;

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top,  backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { paddingTop: insets.top,  backgroundColor: colors.background }]}>
      <View style={[styles.dashboardCard, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
        <View style={styles.metricItem}>
           <Text style={[styles.metricLabel, { color: colors.surface }]}>Ingresos</Text>
           <Text style={styles.metricValue}>${Math.round(totalRevenue).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
           <Text style={[styles.metricLabel, { color: colors.surface }]}>Por Enviar</Text>
           <Text style={styles.metricValue}>{pendingCount}</Text>
        </View>
      </View>
      
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Historial de Pedidos</Text>
      <FlatList
        data={ventas}
        keyExtractor={(item) => item.id}
        renderItem={renderSaleItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 50 }}>
            <Icon name="wallet-outline" size={60} color={colors.textMuted} style={{ marginBottom: 15 }} />
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>Aún no tienes ventas registradas.</Text>
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
  
  dashboardCard: { marginHorizontal: 15, borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5, marginBottom: 20 },
  metricItem: { flex: 1, alignItems: 'center' },
  metricLabel: { fontSize: 12, fontWeight: '600', marginBottom: 5, textTransform: 'uppercase' },
  metricValue: { color: '#fff', fontSize: 22, fontWeight: '900' },
  metricDivider: { width: 1, height: '80%', backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 10 },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 20, marginBottom: 10 },
  listContainer: { padding: 15, paddingBottom: 40 },
  
  card: { borderRadius: 16, marginBottom: 15, padding: 12, flexDirection: 'row', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, borderWidth: 1 },
  
  imageContainer: { width: 90, height: 100, borderRadius: 12, overflow: 'hidden' },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  
  infoContainer: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  productName: { fontSize: 16, fontWeight: 'bold' },
  clientName: { fontSize: 13, marginTop: 2 },
  
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  price: { fontSize: 15, fontWeight: '900' },
  date: { fontSize: 12, fontWeight: '500' },
  
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  
  actionBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  actionBtnText: { fontSize: 12, fontWeight: 'bold' }
});
