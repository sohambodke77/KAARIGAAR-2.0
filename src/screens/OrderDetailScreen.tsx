import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { Order } from '../context/MarketContext';
import { useMarket } from '../context/MarketContext';
import { getProduct, getCreator } from '../data';
import { PageHeader } from '../components/PageHeader';
import { ProductCover } from '../components/ProductCover';
import { fonts, light } from '../theme';
import type { CustomerStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;
type Route = RouteProp<CustomerStackParamList, 'OrderDetail'>;

const STATUS_INDEX: Order['status'][] = ['Processing', 'Ready to Ship', 'Shipped', 'Delivered'];

export function OrderDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { orderId } = useRoute<Route>().params;
  const { orders } = useMarket();

  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <PageHeader title="Order not found" fallback={() => navigation.goBack()} />
        <Text style={styles.missing}>This order no longer exists.</Text>
      </SafeAreaView>
    );
  }

  const currentIndex = STATUS_INDEX.indexOf(order.status);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PageHeader title={order.id} subtitle="Order details" fallback={() => navigation.goBack()} />
      <View style={styles.scrollWrap}>
        <View style={styles.timeline}>
          {STATUS_INDEX.map((status, i) => (
            <View key={status} style={styles.timelineItem}>
              <View
                style={[
                  styles.timelineDot,
                  i <= currentIndex && styles.timelineDotActive,
                ]}
              >
                {i < currentIndex ? (
                  <Ionicons name="checkmark" size={11} color="#FFF8EC" />
                ) : null}
              </View>
              <Text
                style={[
                  styles.timelineText,
                  i <= currentIndex && { color: light.ink, fontFamily: fonts.sans.semibold },
                ]}
              >
                {status}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.items}>
          {order.items.map((item, idx) => {
            const product = getProduct(item.productId);
            const creator = getCreator(product.creatorId);
            return (
              <View key={`${item.productId}-${idx}`} style={styles.itemRow}>
                <ProductCover categoryId={product.categoryId} label={product.name} width={64} height={64} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{product.name}</Text>
                  <Text style={styles.itemCreator}>by {creator.name} · × {item.qty}</Text>
                  <Text style={styles.itemPrice}>
                    ₹{(product.price * (item.customization ? 1.25 : 1) * item.qty).toLocaleString('en-IN')}
                  </Text>
                  {item.customization ? (
                    <Text style={styles.customNote}>
                      Customised · {item.customization.name || item.customization.size || item.customization.color}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.summary}>
          <Row label="Order total" value={`₹${order.total.toLocaleString('en-IN')}`} strong />
          <Row label="Placed on" value={new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} />
          <Row label="Payment" value="Cash on Delivery (demo)" />
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Deliver to</Text>
          <Text style={styles.addressName}>{order.address.name}</Text>
          <Text style={styles.addressBody}>
            {order.address.locality}, {order.address.city} · {order.address.phone}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, strong && styles.rowLabelStrong]}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.rowValueStrong]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  missing: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 30,
  },
  scrollWrap: {
    padding: 16,
    paddingBottom: 32,
  },
  timeline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: light.line,
    padding: 16,
    marginBottom: 14,
  },
  timelineItem: {
    alignItems: 'center',
    gap: 6,
    width: 64,
  },
  timelineDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: light.lineStrong,
    backgroundColor: light.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotActive: {
    borderColor: '#A9823A',
    backgroundColor: '#A9823A',
  },
  timelineText: {
    color: light.inkFaint,
    fontFamily: fonts.sans.medium,
    fontSize: 9.5,
    textAlign: 'center',
  },
  items: {
    gap: 10,
    marginBottom: 14,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: light.line,
    padding: 12,
  },
  itemInfo: { flex: 1, gap: 2 },
  itemName: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
    lineHeight: 18,
  },
  itemCreator: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12,
  },
  itemPrice: {
    color: light.ink,
    fontFamily: fonts.sans.bold,
    fontSize: 14,
  },
  customNote: {
    color: '#A9823A',
    fontFamily: fonts.sans.medium,
    fontSize: 11.5,
  },
  summary: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: light.line,
    backgroundColor: light.surface,
    padding: 14,
    gap: 10,
    marginBottom: 14,
  },
  summaryTitle: {
    color: '#A9823A',
    fontFamily: fonts.serif.semibold,
    fontSize: 15,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { color: light.inkMuted, fontFamily: fonts.sans.regular, fontSize: 13 },
  rowLabelStrong: { color: light.ink, fontFamily: fonts.sans.semibold },
  rowValue: { color: light.ink, fontFamily: fonts.sans.medium, fontSize: 13 },
  rowValueStrong: { fontFamily: fonts.sans.bold },
  addressName: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
  },
  addressBody: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    lineHeight: 19,
  },
});