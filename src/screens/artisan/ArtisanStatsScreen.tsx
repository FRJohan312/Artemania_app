import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, ActivityIndicator, RefreshControl, Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../../context/ConfigContext';
import { useAuth } from '../../context/AuthContext';
import { getProducts } from '../../services/products';
import { getVentas } from '../../services/commerce';
import { getTutorialsByUser } from '../../services/posts';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

// ─── Helpers ────────────────────────────────────────────────────────────────

const fmt = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const fmtCOP = (n: number): string =>
  `$${n.toLocaleString('es-CO')}`;

const pct = (a: number, b: number): string => {
  if (b === 0) return '–';
  const p = ((a - b) / b) * 100;
  return `${p >= 0 ? '+' : ''}${p.toFixed(0)}%`;
};

const monthRange = (monthsBack: number) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  return start.toISOString();
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon, color, dark }: any) {
  const scale = React.useRef(new Animated.Value(0.92)).current;
  React.useEffect(() => {
    Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }).start();
  }, []);

  return (
    <Animated.View style={[styles.kpiCard, { backgroundColor: color, shadowColor: color, transform: [{ scale }] }]}>
      <View style={styles.kpiIconBox}>
        <Icon name={icon} size={22} color="rgba(255,255,255,0.9)" />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiTitle}>{title}</Text>
      {sub ? <Text style={styles.kpiSub}>{sub}</Text> : null}
    </Animated.View>
  );
}

function MiniStat({ label, value, icon, color, colors }: any) {
  return (
    <View style={[styles.miniStat, { backgroundColor: colors.surface }]}>
      <View style={[styles.miniStatIcon, { backgroundColor: color + '18' }]}>
        <Icon name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.miniStatValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.miniStatLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

function SectionTitle({ children, colors }: any) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{children}</Text>
    </View>
  );
}

function BarChart({ data, colors }: { data: number[]; colors: any }) {
  const max = Math.max(...data, 1);
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  return (
    <View style={styles.barRow}>
      {data.map((v, i) => (
        <View key={i} style={styles.barCol}>
          <Text style={[styles.barValue, { color: colors.textMuted }]}>{v > 0 ? fmt(v) : ''}</Text>
          <View style={styles.barTrack}>
            <Animated.View
              style={[styles.barFill, {
                height: `${(v / max) * 100}%`,
                backgroundColor: v === max ? colors.primary : colors.primary + '55',
                borderRadius: 6,
              }]}
            />
          </View>
          <Text style={[styles.barDay, { color: colors.textMuted }]}>{days[i]}</Text>
        </View>
      ))}
    </View>
  );
}

function TopProduct({ rank, name, sales, revenue, colors, primary }: any) {
  return (
    <View style={[styles.topRow, { borderBottomColor: colors.divider }]}>
      <View style={[styles.topRank, { backgroundColor: rank === 1 ? primary : colors.divider }]}>
        <Text style={[styles.topRankText, { color: rank === 1 ? '#fff' : colors.textMuted }]}>{rank}</Text>
      </View>
      <View style={styles.topInfo}>
        <Text style={[styles.topName, { color: colors.textPrimary }]} numberOfLines={1}>{name}</Text>
        <Text style={[styles.topSales, { color: colors.textMuted }]}>{sales} venta{sales !== 1 ? 's' : ''}</Text>
      </View>
      <Text style={[styles.topRevenue, { color: primary }]}>{fmtCOP(revenue)}</Text>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ArtisanStatsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { profile } = useAuth();

  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats]         = useState<any>(null);

  const loadStats = useCallback(async (force = false) => {
    if (!profile?.id) return;
    try {
      const [prodRes, ventasRes, postsRes] = await Promise.all([
        getProducts(profile.id, true, force),
        getVentas(profile.id),
        getTutorialsByUser(profile.id, force),
      ]);

      const products: any[]  = prodRes.data  || [];
      const ventas: any[]    = ventasRes.data || [];
      const posts: any[]     = postsRes.data  || [];

      // ── Ventas ──────────────────────────────────────────────────
      const now    = new Date();
      const thisM  = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const lastM  = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const lastM2 = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString();

      const ventasThisMonth = ventas.filter(v => v.fecha >= thisM);
      const ventasLastMonth = ventas.filter(v => v.fecha >= lastM && v.fecha < thisM);

      const totalRevenueThisMonth = ventasThisMonth.reduce((s: number, v: any) => s + (Number(v.total) || 0), 0);
      const totalRevenueLastMonth = ventasLastMonth.reduce((s: number, v: any) => s + (Number(v.total) || 0), 0);

      // ── Productos ────────────────────────────────────────────────
      const activeProducts = products.filter(p => !p.estado || p.estado === 'activo');

      // Top productos por ventas
      const salesByProduct: Record<string, { name: string; count: number; revenue: number }> = {};
      ventas.forEach(v => {
        (v.productos || []).forEach((item: any) => {
          if (!salesByProduct[item.id]) {
            salesByProduct[item.id] = { name: item.nombre || item.name || 'Producto', count: 0, revenue: 0 };
          }
          salesByProduct[item.id].count  += item.cantidad || 1;
          salesByProduct[item.id].revenue += (Number(item.precio) || 0) * (item.cantidad || 1);
        });
      });
      const topProducts = Object.values(salesByProduct)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // ── Comunidad ────────────────────────────────────────────────
      const totalLikes    = posts.reduce((s: number, p: any) => s + (p.likesCount    || 0), 0);
      const totalComments = posts.reduce((s: number, p: any) => s + (p.commentsCount || 0), 0);
      const totalShares   = posts.reduce((s: number, p: any) => s + (p.sharesCount   || 0), 0);

      // ── Ventas por día de la semana ──────────────────────────────
      const salesByDay = [0, 0, 0, 0, 0, 0, 0]; // L…D
      ventasThisMonth.forEach(v => {
        const d = new Date(v.fecha).getDay(); // 0=Dom, 1=Lun
        const idx = d === 0 ? 6 : d - 1;
        salesByDay[idx] += Number(v.total) || 0;
      });

      setStats({
        totalRevenue: totalRevenueThisMonth,
        revenueChange: pct(totalRevenueThisMonth, totalRevenueLastMonth),
        revenueUp: totalRevenueThisMonth >= totalRevenueLastMonth,
        totalVentas: ventas.length,
        ventasThisMonth: ventasThisMonth.length,
        ventasLastMonth: ventasLastMonth.length,
        activeProducts: activeProducts.length,
        totalProducts: products.length,
        totalPosts: posts.length,
        totalLikes,
        totalComments,
        totalShares,
        topProducts,
        salesByDay,
        avgOrderValue: ventasThisMonth.length > 0
          ? Math.round(totalRevenueThisMonth / ventasThisMonth.length) : 0,
      });
    } catch (e) {
      console.error('Error loading stats:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile?.id]);

  useEffect(() => { loadStats(); }, [loadStats]);

  const onRefresh = () => { setRefreshing(true); loadStats(true); };

  // ─── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Analizando tu taller…</Text>
      </View>
    );
  }

  const s = stats!;

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider, paddingTop: Math.max(insets.top, 10) + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-back" size={26} color={colors.primary} />
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Mis Estadísticas</Text>
          <Text style={[styles.headerSub, { color: colors.textMuted }]}>Este mes</Text>
        </View>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Icon name="refresh" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* ── Saludo ── */}
        <View style={styles.greeting}>
          <Text style={[styles.greetName, { color: colors.textPrimary }]}>
            ¡Hola, {profile?.nombre?.split(' ')[0]}! 👋
          </Text>
          <Text style={[styles.greetSub, { color: colors.textMuted }]}>
            Aquí va el resumen de tu taller este mes.
          </Text>
        </View>

        {/* ── KPIs principales ── */}
        <View style={styles.kpiRow}>
          <KpiCard
            title="Ingresos"
            value={fmtCOP(s.totalRevenue)}
            sub={`${s.revenueChange} vs. mes anterior`}
            icon="cash-outline"
            color="#B96A4A"
          />
          <KpiCard
            title="Ventas"
            value={String(s.ventasThisMonth)}
            sub={`${s.ventasLastMonth} el mes pasado`}
            icon="cart-outline"
            color="#20c997"
          />
        </View>
        <View style={styles.kpiRow}>
          <KpiCard
            title="Valor Promedio"
            value={fmtCOP(s.avgOrderValue)}
            sub="por orden"
            icon="trending-up-outline"
            color="#845ef7"
          />
          <KpiCard
            title="Productos"
            value={String(s.activeProducts)}
            sub={`${s.totalProducts} en total`}
            icon="cube-outline"
            color="#339af0"
          />
        </View>

        {/* ── Comunidad ── */}
        <SectionTitle colors={colors}>Comunidad</SectionTitle>
        <View style={styles.miniGrid}>
          <MiniStat label="Publicaciones" value={fmt(s.totalPosts)}    icon="newspaper-outline"     color="#B96A4A"  colors={colors} />
          <MiniStat label="Likes"         value={fmt(s.totalLikes)}    icon="heart-outline"         color="#fa5252"  colors={colors} />
          <MiniStat label="Comentarios"   value={fmt(s.totalComments)} icon="chatbubble-outline"    color="#845ef7"  colors={colors} />
          <MiniStat label="Compartidos"   value={fmt(s.totalShares)}   icon="share-social-outline"  color="#339af0"  colors={colors} />
        </View>

        {/* ── Ventas por día ── */}
        <SectionTitle colors={colors}>Ventas por Día (Este Mes)</SectionTitle>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {s.salesByDay.every((v: number) => v === 0) ? (
            <View style={styles.emptyChart}>
              <Icon name="bar-chart-outline" size={40} color={colors.border} />
              <Text style={[styles.emptyChartText, { color: colors.textMuted }]}>Sin ventas este mes aún</Text>
            </View>
          ) : (
            <BarChart data={s.salesByDay} colors={colors} />
          )}
        </View>

        {/* ── Top Productos ── */}
        <SectionTitle colors={colors}>Top Productos</SectionTitle>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {s.topProducts.length === 0 ? (
            <View style={styles.emptyChart}>
              <Icon name="trophy-outline" size={40} color={colors.border} />
              <Text style={[styles.emptyChartText, { color: colors.textMuted }]}>Aún no hay ventas registradas</Text>
            </View>
          ) : (
            s.topProducts.map((p: any, i: number) => (
              <TopProduct
                key={i}
                rank={i + 1}
                name={p.name}
                sales={p.count}
                revenue={p.revenue}
                colors={colors}
                primary={colors.primary}
              />
            ))
          )}
        </View>

        {/* ── Totales históricos ── */}
        <SectionTitle colors={colors}>Historial Total</SectionTitle>
        <View style={[styles.card, { backgroundColor: colors.surface, flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 24 }]}>
          <View style={styles.histItem}>
            <Icon name="cart" size={26} color="#20c997" />
            <Text style={[styles.histValue, { color: colors.textPrimary }]}>{fmt(s.totalVentas)}</Text>
            <Text style={[styles.histLabel, { color: colors.textMuted }]}>Ventas Totales</Text>
          </View>
          <View style={[styles.histDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.histItem}>
            <Icon name="heart" size={26} color="#fa5252" />
            <Text style={[styles.histValue, { color: colors.textPrimary }]}>{fmt(s.totalLikes)}</Text>
            <Text style={[styles.histLabel, { color: colors.textMuted }]}>Likes Totales</Text>
          </View>
          <View style={[styles.histDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.histItem}>
            <Icon name="newspaper" size={26} color="#B96A4A" />
            <Text style={[styles.histValue, { color: colors.textPrimary }]}>{fmt(s.totalPosts)}</Text>
            <Text style={[styles.histLabel, { color: colors.textMuted }]}>Publicaciones</Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:        { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText:      { marginTop: 14, fontSize: 15, fontWeight: '600' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn:    { padding: 6 },
  refreshBtn: { padding: 8, borderRadius: 20 },
  headerTitle:{ fontSize: 19, fontWeight: '900' },
  headerSub:  { fontSize: 12, marginTop: 1 },

  scroll: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 30 },

  greeting:   { marginBottom: 20, marginTop: 8 },
  greetName:  { fontSize: 22, fontWeight: '900' },
  greetSub:   { fontSize: 14, marginTop: 3 },

  // KPIs
  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  kpiCard: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  kpiIconBox: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 12,
  },
  kpiValue: { fontSize: 22, fontWeight: '900', color: '#fff' },
  kpiTitle: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '700', marginTop: 2 },
  kpiSub:   { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 4 },

  // Section
  sectionHeader: { marginTop: 24, marginBottom: 12 },
  sectionTitle:  { fontSize: 17, fontWeight: '800' },

  // Mini stats
  miniGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  miniStat: {
    width: CARD_W, padding: 16, borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  miniStatIcon:  { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  miniStatValue: { fontSize: 20, fontWeight: '900' },
  miniStatLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },

  // Generic card
  card: {
    borderRadius: 20, padding: 16, marginBottom: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },

  // Bar chart
  barRow:  { flexDirection: 'row', alignItems: 'flex-end', height: 130, gap: 4 },
  barCol:  { flex: 1, alignItems: 'center' },
  barValue:{ fontSize: 8, marginBottom: 2 },
  barTrack:{ flex: 1, width: '80%', justifyContent: 'flex-end' },
  barFill: { width: '100%' },
  barDay:  { fontSize: 10, fontWeight: '700', marginTop: 4 },

  // Top products
  topRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 0.5,
  },
  topRank:     { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  topRankText: { fontSize: 13, fontWeight: '900' },
  topInfo:     { flex: 1 },
  topName:     { fontSize: 14, fontWeight: '700' },
  topSales:    { fontSize: 12, marginTop: 2 },
  topRevenue:  { fontSize: 14, fontWeight: '800' },

  // Historial
  histItem:    { alignItems: 'center', gap: 6 },
  histValue:   { fontSize: 20, fontWeight: '900' },
  histLabel:   { fontSize: 12, fontWeight: '600' },
  histDivider: { width: 1, height: '60%', alignSelf: 'center' },

  // Empty
  emptyChart:     { alignItems: 'center', paddingVertical: 30, gap: 10 },
  emptyChartText: { fontSize: 14, fontWeight: '600' },
});
