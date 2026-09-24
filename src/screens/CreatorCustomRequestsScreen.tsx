import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useMarket } from '../context/MarketContext';
import { getProduct } from '../data/products';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { fonts, light } from '../theme';

export function CreatorCustomRequestsScreen() {
  const { customRequests, respondToRequest } = useMarket();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PageHeader title="Custom Requests" subtitle={`${customRequests.length} received`} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {customRequests.length === 0 ? (
          <EmptyState
            icon="color-wand-outline"
            title="No custom requests yet"
            subtitle="When a customer requests a personalized creation, it lands here with their brief and budget."
          />
        ) : (
          customRequests.map((r) => {
            const c = r.customization;
            const brief = [c.name, c.size, c.color, c.material, c.pattern, c.message]
              .filter(Boolean)
              .slice(0, 3)
              .join(' · ');
            return (
              <View key={r.id} style={styles.card}>
                <View style={styles.cardHead}>
                  <Text style={styles.reqId}>{r.id}</Text>
                  <View
                    style={[
                      styles.pill,
                      r.status === 'Pending' && styles.pillPending,
                      r.status === 'Accepted' && styles.pillAccepted,
                      r.status === 'Quoted' && styles.pillQuoted,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        r.status === 'Pending' && styles.pillTextPending,
                        r.status === 'Accepted' && styles.pillTextAccepted,
                        r.status === 'Quoted' && styles.pillTextQuoted,
                      ]}
                    >
                      {r.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.product}>{getProduct(r.productId).name}</Text>
                <Text style={styles.brief} numberOfLines={3}>{brief || c.instructions || 'Custom brief'}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.meta}>× {r.qty}</Text>
                  <Text style={styles.meta}>Budget {r.budget}</Text>
                </View>

                <View style={styles.actions}>
                  <Pressable
                    onPress={() => respondToRequest(r.id, 'Accepted')}
                    style={({ pressed }) => [styles.acceptBtn, pressed && { opacity: 0.85 }]}
                  >
                    <Text style={styles.acceptText}>Accept</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => respondToRequest(r.id, 'Quoted')}
                    style={({ pressed }) => [styles.quoteBtn, pressed && { opacity: 0.85 }]}
                  >
                    <Text style={styles.quoteText}>Send Quote</Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  scroll: { padding: 16, paddingBottom: 32 },
  card: {
    backgroundColor: light.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: light.line,
    padding: 16,
    marginBottom: 12,
    gap: 8,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reqId: {
    color: '#A9823A',
    fontFamily: fonts.sans.bold,
    fontSize: 12,
    letterSpacing: 1,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: light.surfaceAlt,
  },
  pillPending: { backgroundColor: 'rgba(212,163,89,0.2)' },
  pillAccepted: { backgroundColor: 'rgba(120,152,96,0.2)' },
  pillQuoted: { backgroundColor: 'rgba(107,128,166,0.2)' },
  pillText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 11,
    color: light.inkMuted,
  },
  pillTextPending: { color: '#8A6B2A' },
  pillTextAccepted: { color: '#4A6A3A' },
  pillTextQuoted: { color: '#3D5478' },
  product: {
    color: light.ink,
    fontFamily: fonts.serif.semibold,
    fontSize: 17,
  },
  brief: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  meta: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  acceptBtn: {
    flex: 1,
    height: 42,
    borderRadius: 999,
    backgroundColor: '#D9A94A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: {
    color: '#2A1A10',
    fontFamily: fonts.sans.bold,
    fontSize: 13.5,
  },
  quoteBtn: {
    flex: 1,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: light.lineStrong,
    backgroundColor: light.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteText: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 13.5,
  },
});