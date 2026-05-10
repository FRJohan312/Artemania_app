import { SafeAreaView } from { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { createPedido, createNotification } from '../../services/db';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator, Modal, Animated, Easing } from 'react-native';
import styles from './CartScreen.styles';
import { useToast } from '../../context/ToastContext';
import { useCart } from '../../context/CartContext';
import { useTranslation, useTheme } from '../../context/ConfigContext';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import MainHeader from '../../components/MainHeader';
import BottomNav from '../../components/BottomNav';
import AddressModal from '../../components/AddressModal';
import PaymentModal from '../../components/PaymentModal';
import { updateUserProfile } from '../../services/users';
import { MetodoPago } from '../../types';

export default function CartScreen({ route, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  // ✅ Usar profile.id como fallback si route.params no tiene clienteId
  const clienteId = route.params?.clienteId || profile?.id;
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastPedido, setLastPedido] = useState<any>(null);
  const { t } = useTranslation();
  const toast = useToast();
  const { colors } = useTheme();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Animaciones
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const startSpinAnimation = () => {
    spinAnim.setValue(0);
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  };

  const playSuccessAnimation = () => {
    scaleAnim.setValue(0);
    fadeAnim.setValue(0);
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  };

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleCheckout = async () => {
    if (!profile) {
      toast.info('🎨 ¡Casi listo!', 'Inicia sesión para registrar tu dirección y completar tu pedido de forma segura. ✨');
      return;
    }

    if (cart.productos.length === 0) {
      toast.info('Carrito Vacío 🛒', 'Explora el Mercado y añade obras artesanales antes de proceder al pago.');
      return;
    }

    if (!profile?.direccion) {
      toast.warn('Dirección requerida', 'Necesitamos saber dónde entregar tus artesanías antes de proceder al pago. 🚚');
      setShowAddressModal(true);
      return;
    }

    // NUEVO: Validar método de pago abriendo el modal
    setShowPaymentModal(true);
  };

  const processOrder = async (method: MetodoPago, saveCard: boolean) => {
    setShowPaymentModal(false);
    setProcessing(true);
    startSpinAnimation();

    // Guardar tarjeta si el usuario lo solicitó
    if (saveCard && profile) {
      const updatedMethods = [...(profile.metodosPago || []), method];
      await updateUserProfile(profile.id, { metodosPago: updatedMethods });
    }

    // Agrupar productos por artesanoId (Pedidos separados por artesano)
    const ordersByArtisan: { [key: string]: any[] } = {};
    cart.productos.forEach((item: any) => {
      const artId = item.artesanoId || 'unknown';
      if (!ordersByArtisan[artId]) {
        ordersByArtisan[artId] = [];
      }
      ordersByArtisan[artId].push(item);
    });

    let hasErrors = false;
    let fallbackError = '';
    let totalGlobal = 0;
    let totalProductos = cart.productos.length;

    for (const artId in ordersByArtisan) {
      const prods = ordersByArtisan[artId];
      const artisanTotal = prods.reduce((sum: number, p: any) => sum + (p.precio * p.cantidad), 0);
      totalGlobal += artisanTotal;

      const pedido = {
        clienteId,
        artesanoId: artId,
        productos: prods,
        total: artisanTotal,
        direccionEnvio: profile.direccion, // Guardamos la dirección actual en el pedido
        metodoPagoInfo: `${method.franquicia} terminada en ${method.numero.slice(-4)}`, // Info del pago
        fecha: new Date().toISOString(),
        estado: 'Pendiente de envío'
      };
      
      const { success, id: pedidoId, error } = await createPedido(pedido);
      if (success) {
        // NOTIFICAR AL ARTESANO
        await createNotification(artId, {
          title: '🎨 ¡Nueva Venta!',
          message: `Has recibido un nuevo pedido de ${prods.length} ${prods.length === 1 ? 'obra' : 'obras'} por $${Math.round(artisanTotal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}.`,
          type: 'venta',
          targetType: 'pedido',
          targetId: pedidoId, // ID del pedido para que pueda abrirlo
          icon: 'cart'
        });
      } else {
        hasErrors = true;
        fallbackError = error || 'Error desconocido';
      }
    }

    if (!hasErrors) {
      await clearCart(clienteId);
      setLastPedido({
        total: totalGlobal,
        cantidadProductos: totalProductos,
        cantidadPedidos: Object.keys(ordersByArtisan).length,
        fecha: new Date(),
      });
      setProcessing(false);
      setShowSuccess(true);
      playSuccessAnimation();
    } else {
      setProcessing(false);
      toast.error('Compra Incompleta', 'Hubo un inconveniente procesando tu pedido. Inténtalo de nuevo en unos momentos.');
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    navigation.navigate('Purchases', { clienteId });
  };

  const handleBackToExplore = () => {
    setShowSuccess(false);
    navigation.navigate('Marketplace');
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.cartCard, { backgroundColor: colors.surface, shadowColor: colors.border }]}>
      <TouchableOpacity 
        style={[styles.cartImgWrapper, { backgroundColor: colors.divider }]}
        onPress={() => navigation.navigate('ProductDetail', { product: item, isCliente: true, profile })}
      >
        {item.imagen ? (
          <Image source={{ uri: item.imagen }} style={styles.cartImg} />
        ) : (
          <View style={styles.cartImgPlaceholder}>
            <Icon name="image-outline" size={30} color={colors.textMuted} />
          </View>
        )}
      </TouchableOpacity>
      
      <View style={styles.cartInfo}>
        <View style={styles.cartHeaderRow}>
          <Text style={[styles.itemName, { color: colors.textPrimary }]} numberOfLines={1}>{item.nombre}</Text>
          <TouchableOpacity onPress={() => removeFromCart(item.id, clienteId)} style={styles.trashBtn}>
            <Icon name="trash-outline" size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.itemArtist, { color: colors.textMuted }]} numberOfLines={1}>{item.autorNombre || 'Artesano Local'}</Text>
        
        <View style={styles.cartBottomRow}>
          <Text style={[styles.itemPrice, { color: colors.primary }]}>${Math.round(item.precio || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
          <View style={[styles.qtyControls, { backgroundColor: colors.background }]}>
            <TouchableOpacity onPress={() => updateQuantity(item.id, item.cantidad - 1, clienteId)} style={[styles.qtyBtn, { backgroundColor: colors.surface, shadowColor: colors.border }]}>
              <Icon name="remove" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            <Text style={[styles.qtyText, { color: colors.textPrimary }]}>{item.cantidad}</Text>
            <TouchableOpacity onPress={() => updateQuantity(item.id, item.cantidad + 1, clienteId)} style={[styles.qtyBtn, { backgroundColor: colors.surface, shadowColor: colors.border }]}>
              <Icon name="add" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );



  const isEmpty = cart.productos.length === 0;

  if (!profile) {
    return (
      <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { paddingTop: insets.top,  backgroundColor: colors.background }]}>
        <MainHeader navigation={navigation} route={{ name: 'Cart', key: 'cart' } as any} options={{ title: 'Carrito' } as any} back={undefined} />
        <View style={styles.emptyContainer}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <Icon name="cart-outline" size={50} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.textSecondary, textAlign: 'center' }}>¿Listo para comprar?</Text>
          <Text style={{ fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: 10, paddingHorizontal: 40, lineHeight: 22 }}>
            Inicia sesión para añadir las mejores artesanías a tu carrito y apoyar a los talentos locales.
          </Text>
          <TouchableOpacity 
            style={[styles.exploreBtn, { marginTop: 30, backgroundColor: colors.primary, paddingHorizontal: 40 }]} 
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.exploreBtnText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { paddingTop: insets.top,  backgroundColor: colors.background }]}>
      <MainHeader 
        navigation={navigation} 
        route={{ name: 'Cart', key: 'cart' } as any}
        options={{ title: 'Carrito' } as any}
        back={undefined}
      />
      <FlatList
        data={cart.productos}
        keyExtractor={(item: any) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        windowSize={5}
        initialNumToRender={5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="cart-outline" size={80} color={colors.divider} style={{marginBottom: 20}} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>{t('cart.empty_title', 'Tu carrito de compras está vacío.')}</Text>
            <TouchableOpacity style={[styles.exploreBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Marketplace')}>
              <Text style={styles.exploreBtnText}>{t('cart.btn_explore', 'Explorar Obras')}</Text>
            </TouchableOpacity>
          </View>
        }
      />
      
      {!isEmpty && (
        <View style={[styles.footer, { backgroundColor: colors.surface, shadowColor: colors.border }]}>
          <View style={styles.totalRow}>
            <View>
              <Text style={[styles.totalLabel, { color: colors.textMuted }]}>{t('cart.total_label', 'Total a pagar')}</Text>
              <Text style={[styles.itemCount, { color: colors.textSecondary }]}>{cart.productos.length} {cart.productos.length === 1 ? 'artículo' : 'artículos'}</Text>
            </View>
            <Text style={[styles.totalValue, { color: colors.textPrimary }]}>${Math.round(cart.total || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</Text>
          </View>
          <TouchableOpacity 
            style={[styles.checkoutBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }, processing && {opacity: 0.7}]}
            onPress={handleCheckout}
            disabled={processing}
          >
            {processing ? (
              <View style={styles.processingRow}>
                <ActivityIndicator color="#fff" style={{marginRight: 10}} />
                <Text style={styles.checkoutBtnText}>Procesando...</Text>
              </View>
            ) : (
              <View style={styles.processingRow}>
                <Icon name="lock-closed" size={18} color="#fff" style={{marginRight: 8}} />
                <Text style={styles.checkoutBtnText}>{t('cart.btn_checkout', 'Proceder al Pago')}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}

      <AddressModal 
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        currentAddress={profile?.direccion}
      />

      <PaymentModal 
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPay={processOrder}
        total={cart.total || 0}
      />

      {/* ===== MODAL DE PROCESANDO ===== */}
      <Modal visible={processing} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.processingCard, { backgroundColor: colors.surface }]}>
            <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
              <Icon name="sync" size={50} color={colors.primary} />
            </Animated.View>
            <Text style={[styles.processingTitle, { color: colors.textPrimary }]}>Procesando tu compra</Text>
            <Text style={[styles.processingSubtitle, { color: colors.textSecondary }]}>Estamos preparando tus pedidos...</Text>
            <View style={styles.processingDots}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          </View>
        </View>
      </Modal>

      {/* ===== MODAL DE ÉXITO ===== */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View style={[
            styles.successCard,
            { backgroundColor: colors.surface },
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}>
            <View style={[styles.successIconCircle, { backgroundColor: colors.background }]}>
              <Icon name="checkmark-circle" size={70} color={colors.success} />
            </View>
            <Text style={[styles.successTitle, { color: colors.textPrimary }]}>¡Compra Exitosa!</Text>
            <Text style={[styles.successSubtitle, { color: colors.textSecondary }]}>Tu pedido ha sido procesado correctamente</Text>

            {lastPedido && (
              <View style={[styles.successDetails, { backgroundColor: colors.background }]}>
                <View style={styles.successDetailRow}>
                  <Icon name="cube-outline" size={18} color={colors.textSecondary} />
                  <Text style={[styles.successDetailText, { color: colors.textPrimary }]}>
                    {lastPedido.cantidadProductos} {lastPedido.cantidadProductos === 1 ? 'producto' : 'productos'}
                  </Text>
                </View>
                <View style={styles.successDetailRow}>
                  <Icon name="people-outline" size={18} color={colors.textSecondary} />
                  <Text style={[styles.successDetailText, { color: colors.textPrimary }]}>
                    {lastPedido.cantidadPedidos} {lastPedido.cantidadPedidos === 1 ? 'pedido separado' : 'pedidos separados'} por taller
                  </Text>
                </View>
                <View style={[styles.successDetailRow, styles.successTotalRow, { borderTopColor: colors.divider }]}>
                  <Icon name="card-outline" size={18} color={colors.primary} />
                  <Text style={[styles.successTotalText, { color: colors.primary }]}>
                    Total: ${Math.round(lastPedido.total).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                  </Text>
                </View>
              </View>
            )}

            <TouchableOpacity style={[styles.successBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} onPress={handleCloseSuccess}>
              <Icon name="receipt-outline" size={20} color="#fff" style={{marginRight: 8}} />
              <Text style={styles.successBtnText}>Ver Mis Pedidos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.successBtnSecondary} onPress={handleBackToExplore}>
              <Text style={[styles.successBtnSecondaryText, { color: colors.textMuted }]}>Seguir Comprando</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}


