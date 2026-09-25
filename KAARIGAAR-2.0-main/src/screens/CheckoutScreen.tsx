import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton } from '../components/BackButton';
import { MarketplaceHeader } from '../components/MarketplaceHeader';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadow } from '../theme';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI (Google Pay, PhonePe, Paytm)', icon: 'phone-portrait-outline' },
  { id: 'card', label: 'Credit or Debit Card', icon: 'card-outline' },
  { id: 'netbanking', label: 'Net Banking (All Indian Banks)', icon: 'business-outline' },
  { id: 'cod', label: 'Cash on Artisan Delivery', icon: 'cash-outline' },
];

export function CheckoutScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { user } = useAuth();
  const { cart, getCartSubtotal, createOrder } = useMarketplace();

  // Address State
  const [recipientName, setRecipientName] = useState(user?.profile?.name || 'Sanket Joshi');
  const [phone, setPhone] = useState(user?.profile?.phone || '+91 98220 45678');
  const [streetAddress, setStreetAddress] = useState('Flat 402, Mayur Heights, Paud Road');
  const [locality, setLocality] = useState(user?.profile?.locality || 'Kothrud');
  const [city] = useState('Pune');
  const [pincode, setPincode] = useState('411038');

  // Delivery & Payment
  const [selectedPayment, setSelectedPayment] = useState(PAYMENT_METHODS[0].id);
  const [deliveryType, setDeliveryType] = useState<'standard' | 'express'>('standard');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  const subtotal = getCartSubtotal();
  const deliveryCost = deliveryType === 'express' ? 79 : subtotal >= 499 ? 0 : 49;
  const grandTotal = subtotal + deliveryCost;

  const handlePlaceOrder = () => {
    setPlacingOrder(true);
    const chosenMethod = PAYMENT_METHODS.find((p) => p.id === selectedPayment)?.label || 'UPI';

    const orderId = createOrder(
      {
        name: recipientName,
        phone,
        address: streetAddress,
        city,
        locality,
        pincode,
      },
      chosenMethod,
      0,
    );

    setTimeout(() => {
      setPlacingOrder(false);
      setConfirmedOrderId(orderId);
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <MarketplaceHeader />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Back Row */}
          <View style={styles.backRow}>
            <BackButton label="Back to Cart" fallbackRoute="Cart" />
          </View>

          <Text style={styles.pageTitle}>Artisan Checkout</Text>
          <Text style={styles.pageSubtitle}>
            Complete your order to begin handcrafting and direct packaging by makers in Pune.
          </Text>

          <View style={[styles.layout, isDesktop && styles.layoutDesktop]}>
            {/* Form Column */}
            <View style={[styles.formColumn, isDesktop && { width: '62%' }]}>
              {/* Delivery Address */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="location-outline" size={20} color={colors.goldDeep} />
                  <Text style={styles.cardTitle}>1. Delivery Address in Pune</Text>
                </View>

                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Recipient Name</Text>
                    <TextInput
                      style={styles.textInput}
                      value={recipientName}
                      onChangeText={setRecipientName}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Phone Number</Text>
                    <TextInput
                      style={styles.textInput}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={{ marginTop: 12 }}>
                  <Text style={styles.fieldLabel}>Street Address / Apartment</Text>
                  <TextInput
                    style={styles.textInput}
                    value={streetAddress}
                    onChangeText={setStreetAddress}
                  />
                </View>

                <View style={[styles.formRow, { marginTop: 12 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Locality / Area</Text>
                    <TextInput
                      style={styles.textInput}
                      value={locality}
                      onChangeText={setLocality}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>City</Text>
                    <TextInput style={[styles.textInput, styles.disabledInput]} value={city} editable={false} />
                  </View>
                  <View style={{ flex: 0.8 }}>
                    <Text style={styles.fieldLabel}>Pincode</Text>
                    <TextInput
                      style={styles.textInput}
                      value={pincode}
                      onChangeText={setPincode}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>
              </View>

              {/* Delivery Method */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="cube-outline" size={20} color={colors.goldDeep} />
                  <Text style={styles.cardTitle}>2. Delivery Option</Text>
                </View>

                <View style={styles.deliveryOptions}>
                  <Pressable
                    onPress={() => setDeliveryType('standard')}
                    style={[
                      styles.deliveryChoice,
                      deliveryType === 'standard' && styles.deliveryChoiceSelected,
                    ]}
                  >
                    <View style={[styles.radioDot, deliveryType === 'standard' && styles.radioDotSelected]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.deliveryChoiceTitle}>
                        Standard Artisan Delivery ({subtotal >= 499 ? 'FREE' : '₹49'})
                      </Text>
                      <Text style={styles.deliveryChoiceSub}>Handcrafted and safely dispatched in 3 to 5 business days.</Text>
                    </View>
                  </Pressable>

                  <Pressable
                    onPress={() => setDeliveryType('express')}
                    style={[
                      styles.deliveryChoice,
                      deliveryType === 'express' && styles.deliveryChoiceSelected,
                    ]}
                  >
                    <View style={[styles.radioDot, deliveryType === 'express' && styles.radioDotSelected]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.deliveryChoiceTitle}>Express Pune Courier (+₹79)</Text>
                      <Text style={styles.deliveryChoiceSub}>Priority maker packaging with delivery in 1 to 2 business days.</Text>
                    </View>
                  </Pressable>
                </View>
              </View>

              {/* Payment Method */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="card-outline" size={20} color={colors.goldDeep} />
                  <Text style={styles.cardTitle}>3. Payment Method</Text>
                </View>

                <View style={styles.paymentMethodsList}>
                  {PAYMENT_METHODS.map((pm) => {
                    const isSelected = selectedPayment === pm.id;
                    return (
                      <Pressable
                        key={pm.id}
                        onPress={() => setSelectedPayment(pm.id)}
                        style={[
                          styles.paymentOption,
                          isSelected && styles.paymentOptionSelected,
                        ]}
                      >
                        <View style={[styles.radioDot, isSelected && styles.radioDotSelected]} />
                        <Ionicons name={pm.icon as any} size={20} color={colors.charcoal} />
                        <Text style={styles.paymentOptionText}>{pm.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Summary Column */}
            <View style={[styles.summaryColumn, isDesktop && { width: '35%' }]}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Order Overview</Text>

                <View style={styles.summaryItemsList}>
                  {cart.map((item) => (
                    <View key={item.id} style={styles.summaryItemRow}>
                      <Text style={styles.summaryItemName} numberOfLines={1}>
                        {item.quantity}× {item.product.name}
                      </Text>
                      <Text style={styles.summaryItemPrice}>
                        ₹{(item.product.price + (item.customization?.extraPrice || 0)) * item.quantity}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.divider} />

                <View style={styles.summaryBreakdown}>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Subtotal</Text>
                    <Text style={styles.breakdownVal}>₹{subtotal}</Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Shipping</Text>
                    <Text style={styles.breakdownVal}>
                      {deliveryCost === 0 ? 'FREE' : `₹${deliveryCost}`}
                    </Text>
                  </View>
                  <View style={styles.breakdownRow}>
                    <Text style={styles.breakdownLabel}>Carbon-Neutral Wrap</Text>
                    <Text style={[styles.breakdownVal, { color: colors.ecoGreen }]}>FREE</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.grandTotalRow}>
                  <Text style={styles.grandTotalLabel}>Total Amount</Text>
                  <Text style={styles.grandTotalVal}>₹{grandTotal}</Text>
                </View>

                <Pressable
                  onPress={handlePlaceOrder}
                  style={({ pressed }) => [
                    styles.placeOrderBtn,
                    pressed && styles.placeOrderBtnPressed,
                  ]}
                  accessibilityRole="button"
                >
                  <Text style={styles.placeOrderBtnText}>
                    {placingOrder ? 'Confirming Order…' : `Pay ₹${grandTotal} & Place Order`}
                  </Text>
                  <Ionicons name="shield-checkmark" size={17} color="#FFFFFF" />
                </Pressable>

                <Text style={styles.safeNote}>
                  🔒 100% Secure Payment • 7-day maker satisfaction guarantee
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Confirmation Celebration Modal */}
      <Modal
        visible={confirmedOrderId !== null}
        transparent
        animationType="fade"
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmIconCircle}>
              <Ionicons name="checkmark-done" size={42} color={colors.goldBright} />
            </View>

            <Text style={styles.confirmHeading}>Order Confirmed!</Text>
            <Text style={styles.confirmId}>Order ID: {confirmedOrderId}</Text>
            <Text style={styles.confirmBody}>
              Thank you for supporting authentic Karigaars in Pune. Your maker has received your order and is preparing their workshop tools!
            </Text>

            <Pressable
              onPress={() => {
                const id = confirmedOrderId;
                setConfirmedOrderId(null);
                navigation.navigate('OrderDetail', { orderId: id! });
              }}
              style={styles.trackOrderBtn}
            >
              <Text style={styles.trackOrderBtnText}>Track Order Status →</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.marketplaceBg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 48,
  },
  container: {
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backRow: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  pageTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 28,
    color: colors.charcoal,
  },
  pageSubtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 24,
    maxWidth: 640,
  },
  layout: {
    flexDirection: 'column',
    gap: 24,
  },
  layoutDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 32,
  },
  formColumn: {
    gap: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    ...shadow.soft,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  cardTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 17,
    color: colors.charcoal,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.charcoal,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  disabledInput: {
    backgroundColor: '#F5EFE6',
    color: colors.textSecondary,
  },
  deliveryOptions: {
    gap: 10,
  },
  deliveryChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.marketplaceBg,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  deliveryChoiceSelected: {
    borderColor: colors.gold,
    backgroundColor: '#FFFDF9',
  },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  radioDotSelected: {
    borderColor: colors.gold,
    backgroundColor: colors.gold,
  },
  deliveryChoiceTitle: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13.5,
    color: colors.charcoal,
  },
  deliveryChoiceSub: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  paymentMethodsList: {
    gap: 10,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.marketplaceBg,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  paymentOptionSelected: {
    borderColor: colors.gold,
    backgroundColor: '#FFFDF9',
  },
  paymentOptionText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13.5,
    color: colors.charcoal,
  },
  summaryColumn: {
    position: 'relative',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 24,
    ...shadow.medium,
  },
  summaryTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 20,
    color: colors.charcoal,
    marginBottom: 16,
  },
  summaryItemsList: {
    gap: 10,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryItemName: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  summaryItemPrice: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.charcoal,
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 14,
  },
  summaryBreakdown: {
    gap: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  breakdownVal: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.charcoal,
  },
  grandTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  grandTotalLabel: {
    fontFamily: fonts.sans.bold,
    fontSize: 16,
    color: colors.charcoal,
  },
  grandTotalVal: {
    fontFamily: fonts.sans.bold,
    fontSize: 26,
    color: colors.charcoal,
  },
  placeOrderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.charcoal,
    height: 50,
    borderRadius: radius.md,
    ...shadow.soft,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  placeOrderBtnPressed: {
    backgroundColor: colors.gold,
  },
  placeOrderBtnText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  safeNote: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 22, 19, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 32,
    alignItems: 'center',
    ...shadow.card,
  },
  confirmIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  confirmHeading: {
    fontFamily: fonts.serif.bold,
    fontSize: 24,
    color: colors.charcoal,
    marginBottom: 6,
  },
  confirmId: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    color: colors.goldDeep,
    marginBottom: 14,
  },
  confirmBody: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  trackOrderBtn: {
    backgroundColor: colors.charcoal,
    paddingHorizontal: 24,
    height: 46,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  trackOrderBtnText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
