import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Order } from '../context/MarketContext';
import { getProduct } from '../data/products';
import { fonts, light } from '../theme';

function fmtDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const statusTone: Record<Order['status'], string> = {
  Processing: '#A9823A',
  'Ready to Ship': '#7A6A57',
  Shipped: '#3F5A33',
  Delivered: '#3F5A33',
};

interface OrderRowProps {
  order: Order;
  onPress: () => void;
  showTrack?: boolean;
}

export function OrderRow({ order, onPress, showTrack = true }: OrderRowProps) {
  const first = getProduct(order.items[0].productId);
  const more = order.items.length - 1;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
      accessibilityRole="button"
      accessibilityLabel={`Order ${order.id}`}
    >
      <View style={styles.topRow}>
        <Text style={styles.id}>{order.isCustomRequest ? `${order.id} · Custom` : order.id}</Text>
        <Text style={styles.date}>{fmtDate(order.placedAt)}</Text>
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {first.name}
        {more > 0 ? ` + ${more} more` : ''}
      </Text>

      <View style={styles.bottomRow}>
        <View style={[styles.statusChip, { backgroundColor: `${statusTone[order.status]}18` }]}>
          <Text style={[styles.statusText, { color: statusTone[order.status] }]}>{order.status}</Text>
        </View>
        <Text style={styles.total}>₹{order.total.toLocaleString('en-IN')}</Text>
      </View>

      {showTrack ? (
        <View style={styles.trackRow}>
          <Ionicons name="navigate-outline" size={13} color="#B98A2E" />
          <Text style={styles.trackText}>Track Order</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: light.line,
    padding: 14,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  id: {
    color: light.inkFaint,
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  date: {
    color: light.inkFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 12,
  },
  name: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 15,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 11.5,
  },
  total: {
    color: light.ink,
    fontFamily: fonts.sans.bold,
    fontSize: 15,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderTopWidth: 1,
    borderTopColor: light.line,
    paddingTop: 9,
  },
  trackText: {
    color: '#B98A2E',
    fontFamily: fonts.sans.semibold,
    fontSize: 12.5,
  },
});