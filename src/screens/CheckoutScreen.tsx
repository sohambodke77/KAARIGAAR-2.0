import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getProduct } from '../data/products';
import { PageHeader } from '../components/PageHeader';
import { FormField } from '../components/FormField';
import { useMarket, type Address } from '../context/MarketContext';
import { colors, fonts, light } from '../theme';
import type { CustomerStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;

export function CheckoutScreen() {
  const navigation = useNavigation<Nav>();
  const { cart, placeOrder } = useMarket();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Pune');
  const [locality, setLocality] = useState('');
  const [addressError, setAddressError] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const total = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => {
      const p = getProduct(item.productId);
      return sum + p.price * (item.customization ? 1.25 : 1) * item.qty;
    }, 0);
    const delivery = subtotal >= 999 ? 0 : 49;
    return subtotal + delivery;
  }, [cart]);

  const placeOrderClick = () => {
    if (!name.trim() || !phone.trim() || !locality.trim()) {
      setAddressError('Please fill your name, phone and locality to deliver.');
      return;
    }
    setAddressError(null);
    setPlacing(true);
    setTimeout(() => {
      const address: Address = {
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        locality: locality.trim(),
      };
      const order = placeOrder(address);
      setPlacedOrderId(order.id);
      setPlacing(false);
    }, 800);
  };

  if (placedOrderId) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.success}>
          <Ionicons name="checkmark-circle" size={64} color="#8B9B5A" />
          <Text style={styles.successTitle}>Order Placed!</Text>
          <Text style={styles.successBody}>
            Your order {placedOrderId} is confirmed. The creator will begin your handmade piece
            within a couple of days — watch its journey from My Orders.
          </Text>
          <View style={styles.successBtns}>
            <Pressable
              onPress={() => navigation.navigate('OrderDetail', { orderId: placedOrderId })}
              style={({ pressed }) => [styles.goldBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.goldBtnText}>Track this Order</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('Tabs', { screen: 'OrdersTab' })}
              style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.ghostBtnText}>My Orders</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PageHeader title="Checkout" fallback={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.intro}>
          A real creator will make, pack and ship your pieces. Please share delivery details.
        </Text>

        {addressError ? <Text style={styles.error}>{addressError}</Text> : null}

        <FormField label="Full name" value={name} onChangeText={setName} placeholder="As on delivery" />
        <FormField label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="10-digit mobile" maxLength={10} />
        <FormField label="City" value={city} onChangeText={setCity} />
        <FormField label="Locality / Address" value={locality} onChangeText={setLocality} multiline />

        <View style={styles.payment}>
          <Text style={styles.paymentTitle}>Payment</Text>
          <View style={styles.paymentRow}>
            <Ionicons name="cash-outline" size={20} color="#A9823A" />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>Cash on Delivery</Text>
              <Text style={styles.paymentSub}>Demo checkout — no real payment (sample marketplace)</Text>
            </View>
            <Ionicons name="checkmark-circle" size={20} color="#3F5A33" />
          </View>
        </View>

        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          {(function () {
            const subtotal = cart.reduce((sum, item) => {
              const p = getProduct(item.productId);
              return sum + p.price * (item.customization ? 1.25 : 1) * item.qty;
            }, 0);
            const delivery = subtotal >= 999 ? 0 : 49;
            return (
              <>
                <Row label={`Items (${cart.length})`} value={`₹${subtotal.toLocaleString('en-IN')}`} />
                <Row label="Delivery" value={delivery === 0 ? 'Free' : `₹${delivery}`} />
                <View style={styles.divider} />
                <Row label="Total to pay" value={`₹${(subtotal + delivery).toLocaleString('en-IN')}`} strong />
              </>
            );
          })()}
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          onPress={placeOrderClick}
          disabled={placing}
          style={({ pressed }) => [styles.placeBtn, placing && { opacity: 0.6 }, pressed && { opacity: 0.88 }]}
        >
          <Text style={styles.placeBtnText}>{placing ? 'Placing…' : `Place Order · ₹${total.toLocaleString('en-IN')}`}</Text>
        </Pressable>
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
  scroll: { padding: 16, paddingBottom: 110 },
  intro: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  error: {
    color: light.danger,
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    marginBottom: 10,
  },
  payment: {
    marginTop: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: light.line,
    backgroundColor: light.surface,
    padding: 14,
  },
  paymentTitle: {
    color: light.ink,
    fontFamily: fonts.serif.semibold,
    fontSize: 16,
    marginBottom: 10,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentInfo: { flex: 1 },
  paymentName: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 13.5,
  },
  paymentSub: {
    color: light.inkFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
  },
  summary: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: light.line,
    backgroundColor: light.surface,
    padding: 14,
    gap: 10,
  },
  summaryTitle: {
    color: '#A9823A',
    fontFamily: fonts.serif.semibold,
    fontSize: 16,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { color: light.inkMuted, fontFamily: fonts.sans.regular, fontSize: 13.5 },
  rowLabelStrong: { color: light.ink, fontFamily: fonts.sans.bold },
  rowValue: { color: light.ink, fontFamily: fonts.sans.medium, fontSize: 13.5 },
  rowValueStrong: { fontFamily: fonts.sans.bold, fontSize: 16 },
  divider: { height: 1, backgroundColor: light.line },
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
  placeBtn: {
    height: 54,
    borderRadius: 999,
    backgroundColor: colors.goldGradientStart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeBtnText: {
    color: colors.buttonText,
    fontFamily: fonts.sans.bold,
    fontSize: 15,
  },
  success: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  successTitle: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 23,
    marginTop: 16,
  },
  successBody: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  successBtns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  goldBtn: {
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: colors.goldGradientStart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldBtnText: { color: colors.buttonText, fontFamily: fonts.sans.semibold, fontSize: 13.5 },
  ghostBtn: {
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: light.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBtnText: { color: light.ink, fontFamily: fonts.sans.semibold, fontSize: 13.5 },
});