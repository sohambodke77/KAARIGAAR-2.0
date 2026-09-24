import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useMarket, type Order } from '../context/MarketContext';
import { getProduct } from '../data/products';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { fonts, light } from '../theme';

const DEMO_ORDERS: Order[] = [
  {
    id: 'ORD-DEMO1',
    items: [{ productId: 'p1', qty: 1 }],
    placedAt: Date.now() - 1000 * 60 * 60 * 6,
    status: 'Processing',
    total: 1899,
    address: { name: 'Aarav Mehta', phone: '9876543210', city: 'Mumbai', locality: 'Bandra West' },
  },
  {
    id: 'ORD-DEMO2',
    items: [{ productId: 'p4', qty: 2 }],
    placedAt: Date.now() - 1000 * 60 * 60 * 30,
    status: 'Ready to Ship',
    total: 1598,
    address: { name: 'Diya Sharma', phone: '9123456780', city: 'Pune', locality: 'Kothrud' },
  },
  {
    id: 'ORD-DEMO3',
    items: [{ productId: 'p7', qty: 1 }],
    placedAt: Date.now() - 1000 * 60 * 60 * 72,
    status: 'Delivered',
    total: 1249,
    address: { name: 'Kabir Singh', phone: '9988776655', city: 'Delhi', locality: 'Hauz Khas' },
  },
];

const FLOW: Order['status'][] = ['Processing', 'Ready to Ship', 'Shipped', 'Delivered'];

export function CreatorOrdersScreen() {
  const { orders, updateOrderStatus } = useMarket();
  const [demo, setDemo] = useState<Order[]>(DEMO_ORDERS);

  const advance = (id: string) => {
    const isSession = orders.some((o) => o.id === id);
    if (isSession) {
      const order = orders.find((o) => o.id === id);
      if (!order) return;
      const next = FLOW[Math.min(FLOW.indexOf(order.status) + 1, FLOW.length - 1)];
      updateOrderStatus(id, next);
      return;
    }
    setDemo((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, status: FLOW[Math.min(FLOW.indexOf(o.status) + 1, FLOW.length - 1)] }
          : o,
      ),
    );
  };

  const list = [...orders, ...demo];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PageHeader title="Orders" subtitle={`${list.length} total`} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {list.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No orders yet"
            subtitle="Orders from customers will appear here."
          />
        ) : (
          list.map((o) => {
            const first = getProduct(o.items[0].productId);
            const next = FLOW[Math.min(FLOW.indexOf(o.status) + 1, FLOW.length - 1)];
            const done = o.status === 'Delivered';
            return (
              <View key={o.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.orderId}>{o.id}</Text>
                    <Text style={styles.orderMeta} numberOfLines={1}>
                      {o.items.map((i) => `${getProduct(i.productId).name} ×${i.qty}`).join(', ')}
                    </Text>
                    <Text style={styles.orderAddr} numberOfLines={1}>
                      {o.address.name} · {o.address.locality}, {o.address.city}
                    </Text>
                  </View>
                  <View style={styles.amountBlock}>
                    <Text style={styles.amount}>₹{o.total.toLocaleString('en-IN')}</Text>
                    <View style={[styles.statusPill, done && styles.statusDone]}>
                      <Text style={[styles.statusText, done && styles.statusTextDone]}>{o.status}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.cardBottom}>
                  <Text style={styles.first}>{first.name}</Text>
                  {done ? (
                    <Text style={styles.doneNote}>
                      <Ionicons name="checkmark-circle" size={13} color="#4A6A3A" /> Delivered
                    </Text>
                  ) : (
                    <Pressable
                      onPress={() => advance(o.id)}
                      style={({ pressed }) => [styles.advanceBtn, pressed && { opacity: 0.85 }]}
                    >
                      <Text style={styles.advanceText}>Mark as {next}</Text>
                    </Pressable>
                  )}
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
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  cardInfo: { flex: 1, gap: 3 },
  orderId: {
    color: '#A9823A',
    fontFamily: fonts.sans.bold,
    fontSize: 12,
    letterSpacing: 1,
  },
  orderMeta: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 14.5,
  },
  orderAddr: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
  },
  amountBlock: { alignItems: 'flex-end', gap: 6 },
  amount: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 18,
  },
  statusPill: {
    backgroundColor: 'rgba(212,163,89,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusDone: { backgroundColor: 'rgba(120,152,96,0.18)' },
  statusText: {
    color: '#8A6B2A',
    fontFamily: fonts.sans.semibold,
    fontSize: 11,
  },
  statusTextDone: { color: '#4A6A3A' },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: light.line,
    paddingTop: 12,
    gap: 12,
  },
  first: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    flexShrink: 1,
  },
  advanceBtn: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#D9A94A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  advanceText: {
    color: '#2A1A10',
    fontFamily: fonts.sans.bold,
    fontSize: 12.5,
  },
  doneNote: {
    color: '#4A6A3A',
    fontFamily: fonts.sans.semibold,
    fontSize: 12.5,
  },
});