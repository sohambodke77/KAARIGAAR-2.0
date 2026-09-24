import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getProduct } from '../data/products';
import { PageHeader } from '../components/PageHeader';
import { CartRow } from '../components/CartRow';
import { EmptyState } from '../components/EmptyState';
import { useMarket } from '../context/MarketContext';
import { colors, fonts, light } from '../theme';
import type { CustomerStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;

export function CartScreen() {
  const navigation = useNavigation<Nav>();
  const { cart } = useMarket();

  const summary = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => {
      const p = getProduct(item.productId);
      return sum + p.price * (item.customization ? 1.25 : 1) * item.qty;
    }, 0);
    const discount = cart.reduce((sum, item) => {
      const p = getProduct(item.productId);
      if (!p.compareAt) return sum;
      return sum + (p.compareAt - p.price) * (item.customization ? 1.25 : 1) * item.qty;
    }, 0);
    const delivery = subtotal === 0 ? 0 : subtotal - discount >= 999 ? 0 : 49;
    return { subtotal, discount, delivery, total: subtotal - discount + delivery };
  }, [cart]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PageHeader
        title="My Cart"
        subtitle="Continue shopping"
        fallback={() => navigation.navigate('Tabs', { screen: 'HomeTab' })}
      />

      {cart.length === 0 ? (
        <EmptyState
          icon="bag-handle-outline"
          title="Your cart is empty"
          subtitle="Fill it with something handmade and meaningful."
          ctaLabel="Discover Handmade"
          onCta={() => navigation.navigate('Tabs', { screen: 'HomeTab' })}
        />
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <View style={styles.items}>
              {cart.map((item) => (
                <CartRow key={item.key} item={item} />
              ))}
            </View>

            <View style={styles.summary}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <Row label="Subtotal" value={`₹${summary.subtotal.toLocaleString('en-IN')}`} />
              <Row label="Coupon savings" value={`−₹${summary.discount.toLocaleString('en-IN')}`} accent />
              <Row label="Delivery" value={summary.delivery === 0 ? 'Free' : `₹${summary.delivery}`} />
              <View style={styles.divider} />
              <Row label="Total" value={`₹${summary.total.toLocaleString('en-IN')}`} strong />
              {summary.delivery === 0 ? (
                <Text style={styles.freeShip}>Free delivery unlocked</Text>
              ) : (
                <Text style={styles.shipHint}>
                  Add ₹{(999 - (summary.subtotal - summary.discount)).toLocaleString('en-IN')} more for free delivery.
                </Text>
              )}
            </View>
          </ScrollView>

          <View style={styles.bottomBar}>
            <Pressable
              onPress={() => navigation.navigate('Checkout')}
              style={({ pressed }) => [styles.checkoutBtn, pressed && { opacity: 0.88 }]}
            >
              <View>
                <Text style={styles.checkoutTotal}>₹{summary.total.toLocaleString('en-IN')}</Text>
                <Text style={styles.checkoutSub}>incl. delivery</Text>
              </View>
              <Text style={styles.checkoutText}>Proceed to Checkout →</Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function Row({ label, value, strong = false, accent = false }: { label: string; value: string; strong?: boolean; accent?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, strong && { color: light.ink, fontFamily: fonts.sans.bold }]}>{label}</Text>
      <Text
        style={[
          styles.rowValue,
          strong && { fontFamily: fonts.sans.bold, fontSize: 16 },
          accent && { color: '#3F5A33' },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  scroll: { padding: 16, paddingBottom: 110 },
  items: { gap: 12 },
  summary: {
    marginTop: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: light.line,
    backgroundColor: light.surface,
    padding: 16,
    gap: 10,
  },
  summaryTitle: {
    color: '#A9823A',
    fontFamily: fonts.serif.semibold,
    fontSize: 16,
    marginBottom: 2,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { color: light.inkMuted, fontFamily: fonts.sans.regular, fontSize: 13.5 },
  rowValue: { color: light.ink, fontFamily: fonts.sans.medium, fontSize: 13.5 },
  divider: { height: 1, backgroundColor: light.line },
  freeShip: {
    color: '#3F5A33',
    fontFamily: fonts.sans.semibold,
    fontSize: 12.5,
  },
  shipHint: {
    color: light.inkFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 12,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: light.surface,
    borderTopWidth: 1,
    borderTopColor: light.line,
    padding: 16,
  },
  checkoutBtn: {
    height: 58,
    borderRadius: 999,
    backgroundColor: colors.goldGradientStart,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
  },
  checkoutTotal: {
    color: colors.buttonText,
    fontFamily: fonts.sans.bold,
    fontSize: 16,
  },
  checkoutSub: {
    color: 'rgba(42,26,16,0.65)',
    fontFamily: fonts.sans.regular,
    fontSize: 10.5,
  },
  checkoutText: {
    color: colors.buttonText,
    fontFamily: fonts.sans.bold,
    fontSize: 14.5,
  },
});