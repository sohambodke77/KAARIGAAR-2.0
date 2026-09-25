import { useState } from 'react';
import {
  Image,
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
import { BottomNavigation } from '../components/BottomNavigation';
import { MarketplaceHeader } from '../components/MarketplaceHeader';
import { useMarketplace } from '../context/MarketplaceContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadow } from '../theme';

export function CartScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    getCartSubtotal,
    selectedLocation,
  } = useMarketplace();

  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const subtotal = getCartSubtotal();
  const deliveryFee = subtotal >= 499 || cart.length === 0 ? 0 : 49;
  const finalTotal = Math.max(0, subtotal + deliveryFee - appliedDiscount);

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'KARIGAAR100') {
      const discount = Math.min(100, subtotal);
      setAppliedDiscount(discount);
      setCouponMsg({ type: 'success', text: '₹100 artisan discount applied!' });
    } else if (code === 'FIRSTCRAFT') {
      const discount = Math.round(subtotal * 0.1);
      setAppliedDiscount(discount);
      setCouponMsg({ type: 'success', text: '10% welcome craft discount applied!' });
    } else {
      setCouponMsg({ type: 'error', text: 'Invalid code. Try KARIGAAR100' });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <MarketplaceHeader />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Top navigation row with Continue Shopping */}
          <View style={styles.backRow}>
            <BackButton label="Continue Shopping" fallbackRoute="CustomerHome" />
          </View>

          <Text style={styles.pageTitle}>Your Handmade Cart</Text>
          <Text style={styles.pageSubtitle}>
            Every piece is made with human love and dispatched directly from independent workshops in Pune.
          </Text>

          {cart.length === 0 ? (
            <View style={styles.emptyCartCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="bag-handle-outline" size={40} color={colors.gold} />
              </View>
              <Text style={styles.emptyTitle}>Your cart is currently empty</Text>
              <Text style={styles.emptyDesc}>
                Explore authentic handmade ceramics, crochet blooms, folk paintings, and bespoke gifts.
              </Text>
              <Pressable
                onPress={() => navigation.navigate('CustomerHome')}
                style={styles.exploreBtn}
                accessibilityRole="button"
              >
                <Text style={styles.exploreBtnText}>Discover Handmade</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          ) : (
            <View style={[styles.cartLayout, isDesktop && styles.cartLayoutDesktop]}>
              {/* Left Column: Items List */}
              <View style={[styles.itemsColumn, isDesktop && { width: '63%' }]}>
                {cart.map((item) => {
                  const customExtra = item.customization?.extraPrice ?? 0;
                  const itemUnitPrice = item.product.price + customExtra;
                  const itemTotalPrice = itemUnitPrice * item.quantity;

                  return (
                    <View key={item.id} style={styles.itemCard}>
                      <Image source={{ uri: item.product.images[0] }} style={styles.itemImg} />

                      <View style={styles.itemDetails}>
                        <View style={styles.itemHeaderRow}>
                          <Text style={styles.itemName} numberOfLines={1}>
                            {item.product.name}
                          </Text>
                          <Pressable
                            onPress={() => removeFromCart(item.id)}
                            hitSlop={8}
                            style={styles.removeBtn}
                          >
                            <Ionicons name="trash-outline" size={17} color={colors.danger} />
                          </Pressable>
                        </View>

                        <Text style={styles.itemMaker}>
                          by {item.product.creatorName} ({item.product.creatorLocation})
                        </Text>

                        {/* Customization Details if present */}
                        {item.customization && (
                          <View style={styles.customNotesBox}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Ionicons name="sparkles" size={11} color={colors.goldDeep} />
                              <Text style={styles.customNotesTitle}>Bespoke Customization:</Text>
                            </View>
                            {item.customization.customerName && (
                              <Text style={styles.customNoteLine}>
                                • Engraving: “{item.customization.customerName}”
                              </Text>
                            )}
                            {item.customization.color && (
                              <Text style={styles.customNoteLine}>
                                • Color: {item.customization.color}
                              </Text>
                            )}
                            {item.customization.size && (
                              <Text style={styles.customNoteLine}>
                                • Size: {item.customization.size}
                              </Text>
                            )}
                          </View>
                        )}

                        {/* Price and Quantity */}
                        <View style={styles.itemFooterRow}>
                          <View style={styles.itemPriceBlock}>
                            <Text style={styles.itemPrice}>₹{itemTotalPrice}</Text>
                            {item.quantity > 1 && (
                              <Text style={styles.unitPriceText}>₹{itemUnitPrice} each</Text>
                            )}
                          </View>

                          <View style={styles.quantityCounter}>
                            <Pressable
                              onPress={() => updateCartQuantity(item.id, item.quantity - 1)}
                              style={styles.qtyBtn}
                            >
                              <Ionicons name="remove" size={15} color={colors.charcoal} />
                            </Pressable>
                            <Text style={styles.qtyVal}>{item.quantity}</Text>
                            <Pressable
                              onPress={() => updateCartQuantity(item.id, item.quantity + 1)}
                              style={styles.qtyBtn}
                            >
                              <Ionicons name="add" size={15} color={colors.charcoal} />
                            </Pressable>
                          </View>
                        </View>

                        {/* Delivery Estimate */}
                        <Text style={styles.deliveryEstimate}>
                          📦 Delivered to {selectedLocation} in {item.product.preparationDays + 2} days
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* Right Column: Order Summary */}
              <View style={[styles.summaryColumn, isDesktop && { width: '34%' }]}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryHeading}>Order Summary</Text>

                  {/* Coupon Code Input */}
                  <View style={styles.couponContainer}>
                    <View style={styles.couponInputWrapper}>
                      <TextInput
                        style={styles.couponInput}
                        placeholder="Coupon (e.g. KARIGAAR100)"
                        placeholderTextColor={colors.textMuted}
                        value={couponCode}
                        onChangeText={setCouponCode}
                        autoCapitalize="characters"
                      />
                      <Pressable onPress={handleApplyCoupon} style={styles.applyCouponBtn}>
                        <Text style={styles.applyCouponText}>Apply</Text>
                      </Pressable>
                    </View>
                    {couponMsg && (
                      <Text
                        style={[
                          styles.couponFeedback,
                          { color: couponMsg.type === 'success' ? colors.ecoGreen : colors.danger },
                        ]}
                      >
                        {couponMsg.text}
                      </Text>
                    )}
                  </View>

                  {/* Price Breakdown */}
                  <View style={styles.breakdownList}>
                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Subtotal ({cart.length} creations)</Text>
                      <Text style={styles.breakdownVal}>₹{subtotal}</Text>
                    </View>

                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Artisan Delivery</Text>
                      <Text style={styles.breakdownVal}>
                        {deliveryFee === 0 ? (
                          <Text style={{ color: colors.ecoGreen }}>FREE (Above ₹499)</Text>
                        ) : (
                          `₹${deliveryFee}`
                        )}
                      </Text>
                    </View>

                    {appliedDiscount > 0 && (
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Artisan Discount</Text>
                        <Text style={[styles.breakdownVal, { color: colors.ecoGreen }]}>
                          -₹{appliedDiscount}
                        </Text>
                      </View>
                    )}

                    <View style={styles.breakdownRow}>
                      <Text style={styles.breakdownLabel}>Eco Packaging</Text>
                      <Text style={[styles.breakdownVal, { color: colors.ecoGreen }]}>FREE</Text>
                    </View>
                  </View>

                  {/* Total Row */}
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Grand Total</Text>
                    <Text style={styles.totalVal}>₹{finalTotal}</Text>
                  </View>

                  {/* Checkout CTA */}
                  <Pressable
                    onPress={() => navigation.navigate('Checkout')}
                    style={styles.checkoutBtn}
                    accessibilityRole="button"
                  >
                    <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </Pressable>

                  <Text style={styles.trustBadge}>
                    🔒 Safe & encrypted checkout • Direct maker payout
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <BottomNavigation activeTab="home" />
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
  emptyCartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 48,
    alignItems: 'center',
    ...shadow.soft,
    gap: 12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.marketplaceBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 22,
    color: colors.charcoal,
  },
  emptyDesc: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 420,
    lineHeight: 20,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.charcoal,
    paddingHorizontal: 22,
    height: 46,
    borderRadius: radius.full,
    marginTop: 12,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  exploreBtnText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  cartLayout: {
    flexDirection: 'column',
    gap: 24,
  },
  cartLayoutDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 32,
  },
  itemsColumn: {
    gap: 16,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    ...shadow.soft,
  },
  itemImg: {
    width: 90,
    height: 90,
    borderRadius: radius.md,
  },
  itemDetails: {
    flex: 1,
  },
  itemHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  itemName: {
    fontFamily: fonts.serif.bold,
    fontSize: 16,
    color: colors.charcoal,
    flex: 1,
    marginRight: 8,
  },
  removeBtn: {
    padding: 2,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  itemMaker: {
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  customNotesBox: {
    backgroundColor: '#FFFDF9',
    borderRadius: radius.sm,
    borderLeftWidth: 2,
    borderLeftColor: colors.gold,
    padding: 8,
    marginTop: 8,
    marginBottom: 8,
    gap: 2,
  },
  customNotesTitle: {
    fontFamily: fonts.sans.bold,
    fontSize: 11,
    color: colors.goldDeep,
  },
  customNoteLine: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    color: colors.charcoal,
  },
  itemFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  itemPriceBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  itemPrice: {
    fontFamily: fonts.sans.bold,
    fontSize: 17,
    color: colors.charcoal,
  },
  unitPriceText: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    color: colors.textMuted,
  },
  quantityCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyVal: {
    fontFamily: fonts.sans.bold,
    fontSize: 13,
    paddingHorizontal: 6,
    color: colors.charcoal,
  },
  deliveryEstimate: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 8,
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
  summaryHeading: {
    fontFamily: fonts.serif.bold,
    fontSize: 20,
    color: colors.charcoal,
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  couponContainer: {
    marginBottom: 18,
  },
  couponInputWrapper: {
    flexDirection: 'row',
    height: 42,
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  couponInput: {
    flex: 1,
    paddingHorizontal: 14,
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  applyCouponBtn: {
    backgroundColor: colors.charcoal,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  applyCouponText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
  couponFeedback: {
    fontFamily: fonts.sans.medium,
    fontSize: 11.5,
    marginTop: 5,
    marginLeft: 6,
  },
  breakdownList: {
    gap: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: {
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    color: colors.textSecondary,
  },
  breakdownVal: {
    fontFamily: fonts.sans.medium,
    fontSize: 13.5,
    color: colors.charcoal,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  totalLabel: {
    fontFamily: fonts.sans.bold,
    fontSize: 16,
    color: colors.charcoal,
  },
  totalVal: {
    fontFamily: fonts.sans.bold,
    fontSize: 26,
    color: colors.charcoal,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.charcoal,
    height: 48,
    borderRadius: radius.md,
    ...shadow.soft,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  checkoutBtnText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  trustBadge: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
});
