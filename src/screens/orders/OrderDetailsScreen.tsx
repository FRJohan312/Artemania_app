import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useToast } from '../../context/ToastContext';
import {  SafeAreaView , useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { updatePedidoStatus, getPedidoById } from '../../services/db';
import MainHeader from '../../components/MainHeader';
import { useTheme } from '../../context/ConfigContext';
import { ActivityIndicator } from 'react-native';

export default function OrderDetailsScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { order: initialOrder, orderId, isCliente } = route.params || {};
  const [order, setOrder] = React.useState<any>(initialOrder);
  const [loading, setLoading] = React.useState(!initialOrder && !!orderId);
  const toast = useToast();
  const { colors } = useTheme();

  React.useEffect(() => {
    const loadOrder = async () => {
      if (!order && orderId) {
        setLoading(true);
        const { data, error } = await getPedidoById(orderId);
        if (data) {
          setOrder({ id: orderId, ...data });
        } else {
          toast.error('Error', 'No pudimos cargar los detalles del pedido.');
        }
        setLoading(false);
      }
    };
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top,  backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top,  backgroundColor: colors.background }]}>
         <Text style={{textAlign: 'center', marginTop: 50, color: colors.textPrimary}}>Error: No se encontró el pedido</Text>
      </SafeAreaView>
    );
  }

  const formattedDate = new Date(order.fecha).toLocaleDateString('es-ES', { 
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  const renderStatus = (status: string) => {
    let color = '#339af0';
    let bg = '#e7f5ff';
    let icon = 'car-outline';

    if (status === 'Pendiente de envío' || status === 'Recibido') {
      color = '#f59f00'; bg = '#fff4e6'; icon = 'time-outline';
    } else if (status === 'Entregado') {
      color = '#40c057'; bg = '#ebfbee'; icon = 'checkmark-circle-outline';
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor: bg }]}>
        <Icon name={icon} size={16} color={color} style={{marginRight: 6}} />
        <Text style={[styles.statusText, { color }]}>{status}</Text>
      </View>
    );
  };

  const handleStatusChange = () => {
    const nextStatus = order.estado === 'Pendiente de envío' ? 'En camino' : 'Entregado';
    toast.confirm({
      type: 'info',
      title: 'Actualizar Envío 📦',
      message: `¿Deseas avanzar este pedido a "${nextStatus}"?`,
      confirmText: 'Sí, actualizar',
      onConfirm: async () => {
        const { success } = await updatePedidoStatus(order.id, nextStatus);
        if (success) {
           toast.success('✅ Estado Actualizado', `El pedido ahora está como "${nextStatus}". El comprador será notificado.`);
           navigation.goBack();
        } else {
          toast.error('No se pudo actualizar', 'Ocurrió un inconveniente. Inténtalo de nuevo en unos momentos.');
        }
      } 
    });
  };

  const renderProductItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.productCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => navigation.navigate('ProductDetail', { product: item, isCliente })}
    >
      <View style={[styles.imageContainer, { backgroundColor: colors.divider }]}>
        {item.imagen ? (
          <Image source={{ uri: item.imagen }} style={styles.productImage} />
        ) : (
          <Icon name="image-outline" size={30} color={colors.textMuted} />
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={[styles.productName, { color: colors.textPrimary }]} numberOfLines={2}>{item.nombre}</Text>
        <Text style={[styles.productQty, { color: colors.textMuted }]}>Cantidad: {item.cantidad}</Text>
        <Text style={[styles.productPrice, { color: colors.primary }]}>${Math.round(item.precio * item.cantidad).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { paddingTop: insets.top,  backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Sumario del Pedido */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.border }]}>
          <View style={styles.summaryHeader}>
            <Text style={[styles.orderIdTitle, { color: colors.textSecondary }]}>ID: {order.id.slice(0, 8).toUpperCase()}</Text>
            {renderStatus(order.estado || 'Procesando')}
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Fecha:</Text>
            <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{formattedDate}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Total de Compra:</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>${Math.round(order.total || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
          </View>

          {order.direccionEnvio && (
            <View style={[styles.addressContainer, { backgroundColor: colors.background, borderLeftColor: colors.primary }]}>
              <View style={styles.addressHeader}>
                <Icon name="location-outline" size={16} color={colors.textMuted} />
                <Text style={[styles.addressTitle, { color: colors.textMuted }]}>Dirección de Entrega</Text>
              </View>
              <Text style={[styles.addressText, { color: colors.textPrimary }]}>{order.direccionEnvio}</Text>
            </View>
          )}

          {!isCliente && order.estado !== 'Entregado' && (
            <TouchableOpacity style={[styles.adminStatusBtn, { backgroundColor: colors.primary }]} onPress={handleStatusChange}>
              <Text style={[styles.adminStatusBtnText, { color: colors.surface }]}>Avanzar Estado de Envío</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Lista de Productos */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Artículos ({order.productos?.length || 0})</Text>
        
        {order.productos?.map((prod: any, index: number) => (
          <React.Fragment key={index}>
            {renderProductItem({ item: prod })}
          </React.Fragment>
        ))}

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  
  scrollContent: { paddingHorizontal: 15, paddingBottom: 20 },
  
  summaryCard: { borderRadius: 16, padding: 20, marginBottom: 25, shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, borderWidth: 1 },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  orderIdTitle: { fontSize: 16, fontWeight: 'bold' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  
  divider: { height: 1, marginVertical: 15 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 14, fontWeight: '500' },
  totalValue: { fontSize: 18, fontWeight: '900' },
  
  adminStatusBtn: { marginTop: 20, padding: 12, borderRadius: 10, alignItems: 'center' },
  adminStatusBtnText: { fontWeight: 'bold' },
  
  addressContainer: { marginTop: 20, padding: 15, borderRadius: 12, borderLeftWidth: 4 },
  addressHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  addressTitle: { fontSize: 13, fontWeight: 'bold', marginLeft: 6, textTransform: 'uppercase' },
  addressText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, marginLeft: 5 },
  
  productCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, marginBottom: 12, shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1, borderWidth: 1 },
  imageContainer: { width: 70, height: 70, borderRadius: 8, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginRight: 15 },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
  productQty: { fontSize: 13, marginBottom: 2 },
  productPrice: { fontSize: 15, fontWeight: '900' }
});
