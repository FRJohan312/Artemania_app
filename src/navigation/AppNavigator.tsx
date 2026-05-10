import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import messaging from '@react-native-firebase/messaging';

// Auth
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// System
import HomeScreen from '../screens/system/HomeScreen';
import NotificationsScreen from '../screens/system/NotificationsScreen';
import SuspendedScreen from '../screens/system/SuspendedScreen';
import PausedScreen from '../screens/system/PausedScreen';
import TerrorScreen from '../screens/system/TerrorScreen';
import MaintenanceScreen from '../screens/system/MaintenanceScreen';
import EduModuleScreen from '../screens/system/EduModuleScreen';

// Shop
import MarketplaceScreen from '../screens/shop/MarketplaceScreen';
import ProductDetailScreen from '../screens/shop/ProductDetailScreen';
import CartScreen from '../screens/shop/CartScreen';
import FavoritesScreen from '../screens/shop/FavoritesScreen';
import ArtesanoProfileScreen from '../screens/shop/ArtesanoProfileScreen';

// Artisan
import ProductsScreen from '../screens/artisan/ProductsScreen';
import PublishProductScreen from '../screens/artisan/PublishProductScreen';
import ArtisanStatsScreen from '../screens/artisan/ArtisanStatsScreen';
import ArtisanClassesScreen from '../screens/artisan/ArtisanClassesScreen';
import SalesScreen from '../screens/artisan/SalesScreen';

// Community
import TutorialsScreen from '../screens/community/TutorialsScreen';
import PublishPostScreen from '../screens/community/PublishPostScreen';
import PostDetailScreen from '../screens/community/PostDetailScreen';
import LikedPostsScreen from '../screens/community/LikedPostsScreen';

// Orders
import PurchasesScreen from '../screens/orders/PurchasesScreen';
import OrderDetailsScreen from '../screens/orders/OrderDetailsScreen';
import InvoiceScreen from '../screens/orders/InvoiceScreen';

// Profile
import AccountSettingsScreen from '../screens/profile/AccountSettingsScreen';
import AddressesScreen from '../screens/profile/AddressesScreen';
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';

// Chat
import ChatsListScreen from '../screens/chat/ChatsListScreen';
import ChatScreen from '../screens/chat/ChatScreen';

import { CartProvider } from '../context/CartContext';
import { FavoritesProvider } from '../context/FavoritesContext';
import { LikedPostsProvider } from '../context/LikedPostsContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { NotificationsProvider } from '../context/NotificationsContext';
import { ChatProvider } from '../context/ChatContext';
import { ToastProvider, useToast } from '../context/ToastContext';
import MainHeader from '../components/MainHeader';
import BottomNav from '../components/BottomNav';
import WelcomeModal from '../components/WelcomeModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { unsuspendEntity } from '../services/db';
import { useTheme } from '../context/ConfigContext';

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();
// Crear una referencia para navegar desde fuera de los componentes
export const navigationRef = createNavigationContainerRef();

function MainTabs({ navigation }: any) {
  const { profile } = useAuth();

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBarPosition="bottom"
        tabBar={(props) => (
          <BottomNav
            navigation={props.navigation}
            activeRoute={props.state.routeNames[props.state.index]}
            profile={profile}
          />
        )}
        screenOptions={{
          swipeEnabled: true,
        }}
      >
        <Tab.Screen
          name="Tutorials"
          component={TutorialsScreen}
        />
        <Tab.Screen
          name="Marketplace"
          component={MarketplaceScreen}
        />
        <Tab.Screen
          name="Cart"
          component={CartScreen}
        />
        <Tab.Screen
          name="Home"
          component={HomeScreen}
        />
      </Tab.Navigator>
    </View>
  );
}

function AppContent() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth();
  const { themeMode, colors } = useTheme();
  const toast = useToast();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem('hasSeenWelcome_v1');
        if (!hasSeen) {
          setShowWelcome(true);
        }
      } catch (e) {
        console.log('Error checking launch status:', e);
      }
    };
    checkFirstLaunch();

    // Manejar avisos cuando la app está en segundo plano o cerrada
    const unsubscribeOnNotificationOpen = messaging().onNotificationOpenedApp(remoteMessage => {
      handleNotificationNavigation(remoteMessage);
    });

    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        // Un pequeño delay para que la navegación cargue bien
        setTimeout(() => handleNotificationNavigation(remoteMessage), 1000);
      }
    });

    // Cuando la app está abierta y llega algo
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      console.log('Notificación recibida en primer plano:', remoteMessage);

      const { targetId, targetType } = remoteMessage.data || {};

      if (targetId) {
        // Elegir icono según el tipo
        let iconName = 'notifications';
        if (targetType === 'comentario') iconName = 'chatbubble-ellipses';
        if (targetType === 'respuesta_comentario') iconName = 'arrow-undo';

        toast.show({
          type: 'info',
          title: remoteMessage.notification?.title || 'Nueva Notificación',
          message: remoteMessage.notification?.body || 'Toca para ver los detalles.',
          icon: iconName,
          duration: 5000,
          onPress: () => {
            if (navigationRef.isReady()) {
              if (targetType === 'pedido') {
                (navigationRef as any).navigate('OrderDetails', { orderId: targetId, isCliente: false });
              } else {
                (navigationRef as any).navigate('PostDetail', { postId: targetId });
              }
            }
          }
        });
      }
    });

    const handleNotificationNavigation = (remoteMessage: any) => {
      const { targetId, targetType } = remoteMessage.data || {};

      if (targetId) {
        if (targetType === 'post' || targetType === 'comentario' || targetType === 'respuesta_comentario') {
          if (navigationRef.isReady()) {
            (navigationRef as any).navigate('PostDetail', { postId: targetId });
          }
        } else if (targetType === 'pedido') {
          if (navigationRef.isReady()) {
            (navigationRef as any).navigate('OrderDetails', { orderId: targetId, isCliente: false });
          }
        } else if (targetType === 'mensaje') {
          if (navigationRef.isReady()) {
            const extra = remoteMessage.data?.extraData
              ? JSON.parse(remoteMessage.data.extraData as string)
              : {};
            (navigationRef as any).navigate('Chat', {
              chatId: targetId,
              otherUser: {
                id: extra.otherUserId || '',
                nombre: extra.otherUserName || 'Usuario',
                foto: extra.otherUserPhoto || '',
              },
            });
          }
        }
      }
    };

    return () => {
      unsubscribeOnNotificationOpen();
      unsubscribeOnMessage();
    };
  }, []);

  useEffect(() => {
    const checkSuspension = async () => {
      if (profile?.estado === 'suspendido' && profile.fechaExpiracionSuspension) {
        const now = new Date();
        const expiry = new Date(profile.fechaExpiracionSuspension);

        if (now > expiry) {
          console.log("Sanción expirada, reactivando usuario...");
          await unsuspendEntity(user.uid, 'usuario');
          await refreshProfile();
        }
      }
    };
    checkSuspension();
  }, [profile, user]);

  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <StatusBar
          barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background}
        />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (profile?.estado === 'suspendido') {
    const now = new Date();
    const expiry = profile.fechaExpiracionSuspension ? new Date(profile.fechaExpiracionSuspension) : null;
    if (!expiry || now < expiry) {
      return <SuspendedScreen profile={profile} />;
    }
  }

  if (profile?.estado === 'en_pausa') {
    return <PausedScreen profile={profile} />;
  }

  const handleCloseWelcome = async () => {
    setShowWelcome(false);
    await AsyncStorage.setItem('hasSeenWelcome_v1', 'true');
  };

  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.surface}
        translucent={false}
      />
      <WelcomeModal visible={showWelcome} onClose={handleCloseWelcome} />
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          header: (props) => <MainHeader {...props} />,
          headerShown: true,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Products" component={ProductsScreen} options={{ title: 'Mis Obras' }} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Detalle de Obra' }} />
        <Stack.Screen name="PublishProduct" component={PublishProductScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Mis Favoritos' }} />
        <Stack.Screen name="Invoice" component={InvoiceScreen} options={{ title: 'Factura' }} />
        <Stack.Screen name="LikedPosts" component={LikedPostsScreen} options={{ title: 'Mis Post Favoritos' }} />
        <Stack.Screen name="PublishPost" component={PublishPostScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ArtesanoProfile" component={ArtesanoProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Purchases" component={PurchasesScreen} options={{ title: 'Mis Compras' }} />
        <Stack.Screen name="Sales" component={SalesScreen} options={{ title: 'Mis Ventas' }} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ title: 'Detalle de Pedido' }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} options={{ title: 'Ajustes de Cuenta' }} />
        <Stack.Screen name="Addresses" component={AddressesScreen} options={{ title: 'Mis Direcciones' }} />
        <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ title: 'Métodos de Pago' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notificaciones' }} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ArtisanStats" component={ArtisanStatsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ArtisanClasses" component={ArtisanClassesScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Terror" component={TerrorScreen} options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="Chats" component={ChatsListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import { CommunityProvider } from '../context/CommunityContext';
import { StoreProvider } from '../context/StoreContext';

export default function AppNavigator() {
  return (
    <ToastProvider>
      <AuthProvider>
        <StoreProvider>
          <CommunityProvider>
            <NotificationsProvider>
              <ChatProvider>
                <FavoritesProvider>
                  <LikedPostsProvider>
                    <CartProvider>
                      <AppContent />
                    </CartProvider>
                  </LikedPostsProvider>
                </FavoritesProvider>
              </ChatProvider>
            </NotificationsProvider>
          </CommunityProvider>
        </StoreProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
