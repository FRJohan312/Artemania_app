import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { logOut } from '../../services/auth';
import { useTranslation, useTheme } from '../../context/ConfigContext';
import { useAuth } from '../../context/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { useToast } from '../../context/ToastContext';
import { useChat } from '../../context/ChatContext';
import BecomeArtisanModal from '../../components/BecomeArtisanModal';

// Definiciones de tipos para el menú

interface MenuItem {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
  badge?: number;
  disabled?: boolean;
  danger?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

// Fila individual de opciones del menú

function MenuRow({ item, isLast }: { item: MenuItem; isLast: boolean }) {
  const { colors } = useTheme();
  const toast = useToast();
  const navigation = useNavigation<any>();

  const handlePress = () => {
    if (item.disabled) {
      toast.info(item.label, '¡Próximamente! Estamos trabajando en esta funcionalidad. ✨');
      return;
    }
    item.onPress();
  };

  const iconColor = item.disabled ? colors.textMuted : (item.danger ? '#fa5252' : item.color);

  return (
    <TouchableOpacity
      style={[
        styles.menuRow,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.divider },
        item.disabled && { opacity: 0.55 },
      ]}
      onPress={handlePress}
      activeOpacity={0.6}
    >
      {/* Icono izquierdo */}
      <View style={[styles.menuRowIcon, { backgroundColor: iconColor + '18' }]}>
        <Icon name={item.icon} size={20} color={iconColor} />
      </View>

      {/* Label */}
      <Text
        style={[
          styles.menuRowLabel,
          { color: item.danger ? '#fa5252' : colors.textPrimary },
          item.disabled && { color: colors.textMuted },
        ]}
      >
        {item.label}
      </Text>

      {/* Badge o flecha */}
      <View style={styles.menuRowRight}>
        {item.badge !== undefined && item.badge > 0 && (
          <View style={styles.rowBadge}>
            <Text style={styles.rowBadgeText}>{item.badge > 99 ? '99+' : item.badge}</Text>
          </View>
        )}
        {item.disabled ? (
          <Text style={[styles.soonTag, { color: colors.textMuted, backgroundColor: colors.divider }]}>Pronto</Text>
        ) : (
          <Icon name="chevron-forward" size={16} color={colors.textMuted} />
        )}
      </View>
    </TouchableOpacity>
  );
}

// Grupo o sección de opciones

function MenuSectionBlock({ section, colors }: { section: MenuSection; colors: any }) {
  return (
    <View style={styles.sectionBlock}>
      <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{section.title.toUpperCase()}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {section.items.map((item, idx) => (
          <MenuRow key={item.label} item={item} isLast={idx === section.items.length - 1} />
        ))}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// Pantalla principal
// ─────────────────────────────────────────────

export default function HomeScreen({ navigation }: any) {
  const { profile, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const { colors, themeMode, toggleThemeMode } = useTheme();
  const toast = useToast();
  const { totalUnread } = useChat();
  const insets = useSafeAreaInsets();

  const [showBecomeArtisanModal, setShowBecomeArtisanModal] = useState(false);

  useFocusEffect(useCallback(() => { }, [profile?.id]));

  const handleLogout = async () => {
    await logOut();
    navigation.navigate('MainTabs');
  };

  if (authLoading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#B96A4A" />
      </View>
    );
  }

  // ── Estado invitado ──────────────────────────
  if (!profile) {
    return (
      <SafeAreaView style={[styles.mainContainer, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
        <View style={{ alignItems: 'center', marginBottom: 40 }}>
          <View style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: '#fdf4f0', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
            <Icon name="person" size={50} color={colors.primary} />
          </View>
          <Text style={{ fontSize: 26, fontWeight: '900', color: colors.textPrimary, textAlign: 'center' }}>Únete a Artemanía</Text>
          <Text style={{ fontSize: 16, color: colors.textMuted, textAlign: 'center', marginTop: 10, lineHeight: 22 }}>
            Regístrate para guardar tus obras favoritas, compartir tus procesos y conectar con otros artesanos.
          </Text>
        </View>
        <TouchableOpacity
          style={[{ backgroundColor: colors.primary, width: '100%', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginBottom: 15 }]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>Iniciar Sesión</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[{ backgroundColor: colors.surface, width: '100%', paddingVertical: 18, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: colors.border }]}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '800' }}>Crear una Cuenta</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isArtesano = profile.tipo === 'Artesano';

  // ── Definición de secciones ──────────────────

  const artesanoSections: MenuSection[] = [
    {
      title: 'Mi Tienda',
      items: [
        {
          icon: 'add-circle-outline',
          label: 'Publicar obra',
          color: '#28a745',
          onPress: () => navigation.navigate('PublishProduct', { artesanoId: profile.id, profile }),
        },
        {
          icon: 'cube-outline',
          label: 'Mis Obras',
          color: '#4dabf7',
          onPress: () => navigation.navigate('Products', { artesanoId: profile.id }),
        },
        {
          icon: 'receipt-outline',
          label: 'Mis Ventas',
          color: '#f03e3e',
          onPress: () => navigation.navigate('Sales', { artesanoId: profile.id }),
        },
        {
          icon: 'bag-check-outline',
          label: 'Mis Compras',
          color: '#339af0',
          onPress: () => navigation.navigate('Purchases', { clienteId: profile.id }),
        },
        {
          icon: 'bar-chart-outline',
          label: 'Estadísticas',
          color: '#20c997',
          onPress: () => navigation.navigate('ArtisanStats', { profile }),
        },
        {
          icon: 'eye-outline',
          label: 'Ver mi Vitrina',
          color: '#845ef7',
          onPress: () => navigation.navigate('ArtesanoProfile', { artesano: profile, profile }),
        },
      ],
    },
    {
      title: 'Comunidad',
      items: [
        {
          icon: 'chatbubble-ellipses-outline',
          label: 'Mis Mensajes',
          color: '#B96A4A',
          onPress: () => navigation.navigate('Chats'),
          badge: totalUnread > 0 ? totalUnread : undefined,
        },
        {
          icon: 'heart-outline',
          label: 'Guardados en Tienda',
          color: '#ff6b6b',
          onPress: () => navigation.navigate('Favorites'),
        },
        {
          icon: 'heart',
          label: 'Me Gusta en el Muro',
          color: '#e03131',
          onPress: () => navigation.navigate('LikedPosts'),
        },
      ],
    },
    {
      title: 'Cuenta',
      items: [
        {
          icon: 'person-circle-outline',
          label: 'Ajustes de Cuenta',
          color: '#339af0',
          onPress: () => navigation.navigate('AccountSettings', { profile }),
        },
        {
          icon: 'map-outline',
          label: 'Mis Direcciones',
          color: '#20c997',
          onPress: () => navigation.navigate('Addresses', { profile }),
        },
        {
          icon: 'card-outline',
          label: 'Métodos de Pago',
          color: '#fcc419',
          onPress: () => navigation.navigate('PaymentMethods', { profile }),
        },
        {
          icon: 'school-outline',
          label: 'Mis Clases',
          color: '#fcc419',
          onPress: () => navigation.navigate('ArtisanClasses', { artesanoId: profile.id }),
          disabled: true,
        },
      ],
    },
  ];

  const clienteSections: MenuSection[] = [
    {
      title: 'Mis Pedidos',
      items: [
        {
          icon: 'bag-check-outline',
          label: 'Mis Compras',
          color: '#339af0',
          onPress: () => navigation.navigate('Purchases', { clienteId: profile.id }),
        },
        {
          icon: 'heart-outline',
          label: 'Favoritos en Tienda',
          color: '#ff6b6b',
          onPress: () => navigation.navigate('Favorites'),
        },
        {
          icon: 'heart',
          label: 'Me Gusta en el Muro',
          color: '#e03131',
          onPress: () => navigation.navigate('LikedPosts'),
        },
      ],
    },
    {
      title: 'Comunidad',
      items: [
        {
          icon: 'chatbubble-ellipses-outline',
          label: 'Mis Mensajes',
          color: '#B96A4A',
          onPress: () => navigation.navigate('Chats'),
          badge: totalUnread > 0 ? totalUnread : undefined,
        },
      ],
    },
    {
      title: 'Cuenta',
      items: [
        {
          icon: 'person-circle-outline',
          label: 'Ajustes de Cuenta',
          color: '#339af0',
          onPress: () => navigation.navigate('AccountSettings', { profile }),
        },
        {
          icon: 'map-outline',
          label: 'Mis Direcciones',
          color: '#20c997',
          onPress: () => navigation.navigate('Addresses', { profile }),
        },
        {
          icon: 'card-outline',
          label: 'Métodos de Pago',
          color: '#fcc419',
          onPress: () => navigation.navigate('PaymentMethods', { profile }),
        },
        {
          icon: 'help-circle-outline',
          label: 'Soporte y Ayuda',
          color: '#f59f00',
          onPress: () => navigation.navigate('Terror'),
          disabled: true,
        },
        {
          icon: 'shield-checkmark-outline',
          label: 'Privacidad',
          color: '#40c057',
          onPress: () => navigation.navigate('Terror'),
          disabled: true,
        },
      ],
    },
  ];

  const sections = isArtesano ? artesanoSections : clienteSections;

  // ────────────────────────────────────────────
  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top }, { paddingTop: Math.max(insets.top, 10) + 10 }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {t('profile.header_title', 'Mi Perfil')}
          </Text>
          <TouchableOpacity onPress={toggleThemeMode} style={[styles.menuIconBtn, { backgroundColor: colors.surface }]}>
            <Icon name={themeMode === 'light' ? 'moon-outline' : 'sunny-outline'} size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Tarjeta de perfil */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.avatarWrapper, { backgroundColor: colors.background, borderColor: colors.surface }]}>
            {profile.foto
              ? <Image source={{ uri: profile.foto }} style={styles.avatarImg} />
              : <Icon name="person" size={50} color={colors.textMuted} />}
          </View>

          <Text style={[styles.userName, { color: colors.textPrimary }]}>{profile.nombre}</Text>
          {profile.pronombres ? <Text style={styles.pronouns}>{profile.pronombres}</Text> : null}
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{profile.tipo}{profile.isAdmin ? ' · Admin' : ''}</Text>
          </View>

          {profile.bio ? (
            <View style={[styles.bioContainer, { backgroundColor: colors.background }]}>
              <Text style={[styles.bioText, { color: colors.textSecondary }]} numberOfLines={3}>{profile.bio}</Text>
            </View>
          ) : null}
        </View>

        {/* Bienvenida */}
        <Text style={[styles.welcomeText, { color: colors.textMuted }]}>
          {t('home.welcome', 'Bienvenido de nuevo,')} {profile.nombre?.split(' ')[0] || 'Artesano'} 👋
        </Text>

        {/* Banner convertirse en artesano */}
        {!isArtesano && (
          <TouchableOpacity style={styles.upgradeBanner} onPress={() => setShowBecomeArtisanModal(true)}>
            <View style={styles.upgradeIconBox}>
              <Icon name="color-palette" size={26} color="#fff" />
            </View>
            <View style={styles.upgradeTextBody}>
              <Text style={styles.upgradeTitle}>¿Eres artista o artesano?</Text>
              <Text style={styles.upgradeSub}>Empieza a vender tus obras hoy.</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Menú por secciones */}
        <View style={styles.menuContainer}>
          {sections.map((section) => (
            <MenuSectionBlock key={section.title} section={section} colors={colors} />
          ))}

          {/* Cerrar sesión */}
          <View style={styles.sectionBlock}>
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TouchableOpacity style={styles.menuRow} onPress={handleLogout} activeOpacity={0.6}>
                <View style={[styles.menuRowIcon, { backgroundColor: '#fa525218' }]}>
                  <Icon name="log-out-outline" size={20} color="#fa5252" />
                </View>
                <Text style={[styles.menuRowLabel, { color: '#fa5252' }]}>Cerrar Sesión</Text>
                <View style={styles.menuRowRight}>
                  <Icon name="chevron-forward" size={16} color="#fa525270" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <BecomeArtisanModal
        visible={showBecomeArtisanModal}
        onClose={() => setShowBecomeArtisanModal(false)}
      />
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────
// Estilos
// ─────────────────────────────────────────────

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 20 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 32, fontWeight: '800' },
  menuIconBtn: {
    width: 45, height: 45, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 3,
  },

  // Tarjeta perfil
  profileCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, elevation: 4,
    borderWidth: 1,
  },
  avatarWrapper: {
    width: 90, height: 90, borderRadius: 45,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 2,
  },
  avatarImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  userName: { fontSize: 22, fontWeight: '800', marginBottom: 2, textAlign: 'center' },
  pronouns: { fontSize: 13, color: '#adb5bd', marginBottom: 8, fontWeight: '500' },
  roleBadge: { backgroundColor: '#fdede5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  roleText: { fontSize: 11, fontWeight: '900', color: '#B96A4A', textTransform: 'uppercase', letterSpacing: 0.5 },
  bioContainer: { marginTop: 14, padding: 14, borderRadius: 14, width: '100%' },
  bioText: { fontSize: 14, textAlign: 'center', lineHeight: 20, fontStyle: 'italic' },

  // Bienvenida
  welcomeText: { marginTop: 22, marginBottom: 4, marginLeft: 20, fontSize: 14, fontWeight: '600' },

  // Banner upgrade
  upgradeBanner: {
    marginHorizontal: 20, marginTop: 12, marginBottom: 6,
    backgroundColor: '#B96A4A', borderRadius: 18, padding: 18,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#B96A4A', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, shadowRadius: 10, elevation: 6,
  },
  upgradeIconBox: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  upgradeTextBody: { flex: 1 },
  upgradeTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 2 },
  upgradeSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500' },

  // Menú
  menuContainer: { marginTop: 22, paddingHorizontal: 20 },
  sectionBlock: { marginBottom: 22 },
  sectionLabel: {
    fontSize: 11, fontWeight: '800', letterSpacing: 0.8,
    marginBottom: 8, marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
  },
  menuRowIcon: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 14,
  },
  menuRowLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  menuRowRight: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  rowBadge: {
    backgroundColor: '#fa5252',
    minWidth: 20, height: 20, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 5,
  },
  rowBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  soonTag: {
    fontSize: 10, fontWeight: '700',
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 8,
  },
});
