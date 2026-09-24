import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMarket } from '../context/MarketContext';
import { PRODUCTS } from '../data/products';
import { CATEGORIES } from '../data/categories';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { fonts, light } from '../theme';

export function CreatorAnalyticsScreen() {
  const { width } = useWindowDimensions();
  const { orders } = useMarket();

  const columns = width < 700 ? 1 : 3;
  const revenue = orders.reduce((sum, o) => sum + o.total, 0) * 0.8;
  const avg = orders.length ? Math.round(revenue / orders.length) : 0;
  const delivered = orders.filter((o) => o.status === 'Delivered').length;

  const counts: Record<string, number> = {};
  for (const p of PRODUCTS) {
    counts[p.categoryId] = (counts[p.categoryId] ?? 0) + 1;
  }
  const max = Math.max(1, ...Object.values(counts));
  const breakdown = CATEGORIES.filter((c) => counts[c.id])
    .map((c) => ({ name: c.name, value: counts[c.id] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PageHeader title="Analytics" subtitle="Sales & craft insights" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={[styles.statRow, { flexDirection: columns === 1 ? 'column' : 'row' }]}>
          <Stat label="Earnings (net 80%)" value={`₹${revenue.toLocaleString('en-IN')}`} />
          <Stat label="Avg Order Value" value={`₹${avg.toLocaleString('en-IN')}`} />
          <Stat label="Delivered Orders" value={`${delivered}`} />
        </View>

        {orders.length === 0 ? (
          <EmptyState
            icon="analytics-outline"
            title="No sales data yet"
            subtitle="Place a test order from the customer side to see revenue, fulfilment and category trends here."
          />
        ) : (
          <>
            <Text style={styles.sectionTitle}>Fulfilment</Text>
            <View style={styles.card}>
              {(['Processing', 'Ready to Ship', 'Shipped', 'Delivered'] as const).map((s) => {
                const n = orders.filter((o) => o.status === s).length;
                const pct = orders.length ? (n / orders.length) * 100 : 0;
                return (
                  <View key={s} style={styles.barRow}>
                    <Text style={styles.barLabel}>{s}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${pct}%` }]} />
                    </View>
                    <Text style={styles.barValue}>{n}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Catalog by Category</Text>
        <View style={styles.card}>
          {breakdown.map((b) => (
            <View key={b.name} style={styles.barRow}>
              <Text style={styles.barLabel}>{b.name}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, styles.barFillGold, { width: `${(b.value / max) * 100}%` }]} />
              </View>
              <Text style={styles.barValue}>{b.value}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  scroll: { padding: 16, paddingBottom: 32 },
  statRow: { gap: 12 },
  stat: {
    flex: 1,
    backgroundColor: light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: light.line,
    padding: 16,
    gap: 4,
    marginBottom: 12,
  },
  statValue: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 24,
  },
  statLabel: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
  },
  sectionTitle: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 18,
    marginTop: 14,
    marginBottom: 12,
  },
  card: {
    backgroundColor: light.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: light.line,
    padding: 16,
    gap: 12,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  barLabel: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    width: 110,
  },
  barTrack: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: light.surfaceAlt,
    overflow: 'hidden',
  },
  barFill: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(212,163,89,0.75)',
  },
  barFillGold: { backgroundColor: 'rgba(196,146,64,0.9)' },
  barValue: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 12.5,
    width: 24,
    textAlign: 'right',
  },
});