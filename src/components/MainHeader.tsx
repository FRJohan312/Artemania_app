import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { useChat } from '../context/ChatContext';
import { useTheme } from '../context/ConfigContext';
import { useToast } from '../context/ToastContext';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { db } from '../services/firebaseConnection';
import { doc, onSnapshot } from 'firebase/firestore';
import MinecraftSplash from './MinecraftSplash';

const MainHeader: React.FC<NativeStackHeaderProps> = ({ options, navigation, back }) => {
  const insets = useSafeAreaInsets();
  const { profile, user } = useAuth();
  const { unreadCount } = useNotifications();
  const { totalUnread: unreadChats } = useChat();
  const { colors } = useTheme();
  const toast = useToast();
  const [splashText, setSplashText] = React.useState('');
  const [splashColor, setSplashColor] = React.useState('#ffff00');

  React.useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(doc(db, 'app_config', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSplashText(data.splashText || '');
        setSplashColor(data.splashColor || '#ffff00');
      }
    }, (err) => console.error("Error en tiempo real splash:", err));

    return () => unsub();
  }, [user]);

  const title = options.title;
  const isLogoScreen = !title || title === 'Home' || title === 'Marketplace' || title === 'Artemanía' || title === 'Mi Perfil' || title === 'Comunidad' || title === 'Mi Carrito';
  const isRootScreen = isLogoScreen || title === 'Home' || title === 'Marketplace' || title === 'Tutorials' || title === 'Cart';
  const isNotificationsScreen = title === 'Notificaciones';

  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? 20 : 0) + 15;

  return (
    <View style={[styles.container, { paddingTop: topPadding, backgroundColor: colors.surface, borderBottomColor: colors.divider }]}>
      <View style={styles.leftSection}>
        {back && !isRootScreen ? (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Icon name="chevron-back" size={32} color={colors.primary} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoWrapper}>
            <Icon name="color-palette" size={28} color={colors.primary} />
            <View>
              <Text style={[styles.logoText, { color: colors.primary }]}>Artemanía</Text>
              <MinecraftSplash text={splashText} color={splashColor} />
            </View>
          </View>
        )}
      </View>

      <View style={styles.centerSection}>
        {!isLogoScreen && title && (
          <Text style={[styles.titleText, { color: colors.textPrimary }]} numberOfLines={1}>{title}</Text>
        )}
      </View>

      <View style={styles.rightSection}>
        {!isNotificationsScreen && (
          profile ? (
            <>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate('Notifications')}
              >
                <Icon name="notifications-outline" size={26} color={colors.textPrimary} />
                {unreadCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.danger, borderColor: colors.surface }]}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate('Chats')}
              >
                <Icon name="chatbubbles-outline" size={26} color={colors.textPrimary} />
                {unreadChats > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.danger, borderColor: colors.surface }]}>
                    <Text style={styles.badgeText}>
                      {unreadChats > 9 ? '9+' : unreadChats}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.loginPill, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginPillText}>Iniciar sesión</Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 100,
  },
  leftSection: {
    width: 130,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  rightSection: {
    width: 130,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 15,
  },
  iconBtn: {
    position: 'relative',
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    right: 2,
    top: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loginPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  loginPillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default MainHeader;
