import {  SafeAreaView , useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../context/ConfigContext';

export default function InvoiceScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { pedido } = route.params || {};
  const { colors } = useTheme();

  if (!pedido) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.textPrimary, marginBottom: 20 }}>No hay datos de factura disponibles.</Text>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.popToTop()}>
          <Text style={[styles.primaryBtnText, { color: colors.surface }]}>Volver al Inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleReturnHome = () => {
    navigation.popToTop(); // Volver al Home, limpiando el stack
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top }, {  paddingTop: Math.max(insets.top, 10) + 10 , paddingTop: Math.max(insets.top, 10) + 10 }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.surface, shadowColor: colors.border }]} onPress={handleReturnHome}>
          <Icon name="home" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.success }]}>Compra Exitosa</Text>
      </View>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Detalles de tu Factura</Text>
      
      <View style={[styles.invoiceCard, { backgroundColor: colors.surface, shadowColor: colors.border }]}>
        <Text style={[styles.date, { color: colors.textSecondary }]}>Fecha: {new Date(pedido.fecha).toLocaleString()}</Text>
        <Text style={[styles.status, { color: colors.primary }]}>Estado: {pedido.estado}</Text>
        
        {pedido.direccionEnvio && (
          <View style={[styles.addressSection, { backgroundColor: colors.background }]}>
            <Text style={[styles.addressTitle, { color: colors.textSecondary }]}>Dirección de Envío:</Text>
            <View style={styles.addressBox}>
              <Icon name="location" size={16} color={colors.error || "#d9534f"} style={{ marginRight: 6 }} />
              <Text style={[styles.addressText, { color: colors.textPrimary }]}>{pedido.direccionEnvio}</Text>
            </View>
          </View>
        )}
        
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        
        <Text style={[styles.listTitle, { color: colors.textPrimary }]}>Artículos:</Text>
        <FlatList
          data={pedido.productos}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <Text style={[styles.itemName, { color: colors.textPrimary }]}>{item.cantidad}x {item.nombre}</Text>
              <Text style={[styles.itemPrice, { color: colors.textPrimary }]}>${Math.round(item.precio * item.cantidad).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
            </View>
          )}
        />
        
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        
        <Text style={[styles.totalText, { color: colors.error || "#d9534f" }]}>Total Pagado: ${Math.round(pedido.total || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
      </View>

      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={handleReturnHome}>
          <Text style={[styles.primaryBtnText, { color: colors.surface }]}>Volver al Inicio</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, },
  backBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginRight: 15 },
  headerTitle: { fontSize: 24, fontWeight: '900' },
  subtitle: { fontSize: 18, textAlign: 'center', marginBottom: 20, marginTop: 10 },
  invoiceCard: { padding: 20, borderRadius: 10, elevation: 3, flex: 1, marginBottom: 20 },
  date: { fontSize: 14, marginBottom: 5 },
  status: { fontSize: 14, fontWeight: 'bold', marginBottom: 15 },
  divider: { height: 1, marginVertical: 15 },
  listTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  itemName: { fontSize: 16 },
  itemPrice: { fontSize: 16, fontWeight: 'bold' },
  totalText: { fontSize: 22, fontWeight: 'bold', textAlign: 'right', marginTop: 10 },
  addressSection: { marginTop: 10, padding: 12, borderRadius: 8 },
  addressTitle: { fontSize: 13, fontWeight: 'bold', marginBottom: 4 },
  addressBox: { flexDirection: 'row', alignItems: 'center' },
  addressText: { fontSize: 14, flex: 1, fontWeight: '500' },
  buttonWrapper: { marginBottom: 20, paddingHorizontal: 20 },
  primaryBtn: { padding: 15, borderRadius: 8, alignItems: 'center', marginHorizontal: 20 },
  primaryBtnText: { fontSize: 16, fontWeight: 'bold' }
});
