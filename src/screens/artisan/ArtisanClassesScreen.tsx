import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../context/ConfigContext';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function ArtisanClassesScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors, themeMode } = useTheme();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const ClassCard = ({ title, students, price, image, status }: any) => (
    <View style={[styles.classCard, { backgroundColor: colors.surface }]}>
      <View style={styles.classImagePlaceholder}>
        <Icon name="videocam" size={30} color={colors.primaryLight} />
      </View>
      <View style={styles.classInfo}>
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: status === 'En Vivo' ? '#fff0f6' : '#e7f5ff' }]}>
            <Text style={[styles.statusText, { color: status === 'En Vivo' ? '#d6336c' : '#228be6' }]}>{status}</Text>
          </View>
          <Text style={[styles.classPrice, { color: colors.primary }]}>${price}</Text>
        </View>
        <Text style={[styles.classTitle, { color: colors.textPrimary }]} numberOfLines={1}>{title}</Text>
        <View style={styles.classMeta}>
          <Icon name="people-outline" size={16} color={colors.textMuted} />
          <Text style={[styles.classMetaText, { color: colors.textMuted }]}>{students} estudiantes inscritos</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Preparando tu academia...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top }, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-back" size={28} color={colors.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Mis Clases</Text>
        <TouchableOpacity style={styles.addBtn}>
          <Icon name="add-circle" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: colors.textPrimary }]}>Tu Academia Virtual 🎓</Text>
          <Text style={[styles.welcomeSub, { color: colors.textSecondary }]}>Gestiona tus cursos, tutorías y mentorías personalizadas.</Text>
        </View>

        <View style={styles.statsOverview}>
          <View style={[styles.overviewBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.overviewValue, { color: colors.primary }]}>24</Text>
            <Text style={[styles.overviewLabel, { color: colors.textMuted }]}>Estudiantes</Text>
          </View>
          <View style={[styles.overviewBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.overviewValue, { color: colors.primary }]}>3</Text>
            <Text style={[styles.overviewLabel, { color: colors.textMuted }]}>Cursos Activos</Text>
          </View>
          <View style={[styles.overviewBox, { backgroundColor: colors.surface }]}>
            <Text style={[styles.overviewValue, { color: colors.primary }]}>4.9</Text>
            <Text style={[styles.overviewLabel, { color: colors.textMuted }]}>Promedio</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Cursos Actuales</Text>
        <ClassCard title="Técnicas de Alfarería Ancestral" students="12" price="45.000" status="En Vivo" />
        <ClassCard title="Tejido en Crochet para Principiantes" students="8" price="32.000" status="Grabado" />
        <ClassCard title="Taller de Pintura Orgánica" students="4" price="28.000" status="Grabado" />

        <TouchableOpacity style={[styles.revenueCard, { backgroundColor: colors.primary }]}>
          <View>
            <Text style={styles.revenueTitle}>Ingresos por Clases</Text>
            <Text style={styles.revenueValue}>$580.000 COP</Text>
          </View>
          <Icon name="wallet-outline" size={40} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
      </ScrollView>

      {/* OVERLAY DE PRÓXIMAMENTE */}
      <View style={styles.comingSoonOverlay} pointerEvents="box-none">
        <View style={[styles.comingSoonBlur, { backgroundColor: themeMode === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)' }]} />
        <View style={[styles.comingSoonContent, { backgroundColor: colors.surface }]}>
          <View style={[styles.comingSoonBadge, { backgroundColor: '#fff9db' }]}>
            <Text style={styles.comingSoonBadgeText}>NUEVO MÓDULO</Text>
          </View>
          <Text style={[styles.comingSoonTitle, { color: colors.textPrimary }]}>Tu Academia está en camino</Text>
          <Text style={[styles.comingSoonSub, { color: colors.textSecondary }]}>
            Pronto podrás crear cursos.
          </Text>
          <TouchableOpacity
            style={[styles.comingSoonBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.comingSoonBtnText}>Volver al Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 15, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 5 },
  addBtn: { padding: 5 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 16, fontWeight: '600' },

  welcomeSection: { marginBottom: 25 },
  welcomeTitle: { fontSize: 24, fontWeight: '900' },
  welcomeSub: { fontSize: 15, marginTop: 5, lineHeight: 22 },

  statsOverview: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  overviewBox: { width: (width - 60) / 3, padding: 15, borderRadius: 20, alignItems: 'center', elevation: 2 },
  overviewValue: { fontSize: 20, fontWeight: '900' },
  overviewLabel: { fontSize: 11, fontWeight: '700', marginTop: 4 },

  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 15 },
  classCard: { flexDirection: 'row', borderRadius: 20, padding: 12, marginBottom: 15, elevation: 2 },
  classImagePlaceholder: { width: 80, height: 80, borderRadius: 15, backgroundColor: '#f8f9fa', justifyContent: 'center', alignItems: 'center' },
  classInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '800' },
  classPrice: { fontSize: 14, fontWeight: '900' },
  classTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  classMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  classMetaText: { fontSize: 12, fontWeight: '500' },

  revenueCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderRadius: 25, marginTop: 15 },
  revenueTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '700' },
  revenueValue: { color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 5 },

  // Coming Soon Overlay
  comingSoonOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', zIndex: 1000 },
  comingSoonBlur: { ...StyleSheet.absoluteFillObject },
  comingSoonContent: { padding: 40, paddingTop: 50, borderTopLeftRadius: 40, borderTopRightRadius: 40, alignItems: 'center', elevation: 25 },
  comingSoonBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, marginBottom: 15 },
  comingSoonBadgeText: { fontSize: 11, fontWeight: '900', color: '#fcc419' },
  comingSoonTitle: { fontSize: 26, fontWeight: '900', marginBottom: 10, textAlign: 'center' },
  comingSoonSub: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  comingSoonBtn: { paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, width: '100%', alignItems: 'center' },
  comingSoonBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
