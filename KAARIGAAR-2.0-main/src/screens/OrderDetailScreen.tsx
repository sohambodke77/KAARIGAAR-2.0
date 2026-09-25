import { useState } from 'react';
import {
  Image,
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
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton } from '../components/BackButton';
import { BottomNavigation } from '../components/BottomNavigation';
import { MarketplaceHeader } from '../components/MarketplaceHeader';
import { useMarketplace } from '../context/MarketplaceContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadow } from '../theme';

type OrderDetailRouteProp = RouteProp<AppStackParamList, 'OrderDetail'>;

export function OrderDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<OrderDetailRouteProp>();
  const { orderId } = route.params;

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { orders } = useMarketplace();
  const order = orders.find((o) => o.id === orderId) || orders[0];

  const [showContactModal, setShowContactModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [msgSent, setMsgSent] = useState(false);

  const handleSendMessage = () => {
    setMsgSent(true);
    setTimeout(() => {
      setShowContactModal(false);
      setMsgSent(false);
      setMessageText('');
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <MarketplaceHeader />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Back Row */}
          <View style={styles.backRow}>
            <BackButton label="Back to Orders" fallbackRoute="Orders" />
          </View>

          {/* Header Banner */}
          <View style={styles.headerCard}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.orderTitle}>Order #{order.id}</Text>
                <Text style={styles.orderDate}>Placed on {order.date} • Courier: {order.trackingNumber}</Text>
              </View>
              <View style={styles.statusPill}>
                <Ionicons name="sparkles" size={14} color={colors.goldDeep} />
                <Text style={styles.statusPillText}>{order.status}</Text>
              </View>
            </View>
          </View>

          {/* Timeline Tracker */}
          <View style={styles.timelineCard}>
            <Text style={styles.cardHeading}>Artisan Progress & Workshop Tracking</Text>
            <View style={styles.timelineList}>
              {order.timeline.map((step, idx) => {
                const isLast = idx === order.timeline.length - 1;
                return (
                  <View key={step.title} style={styles.timelineStepRow}>
                    <View style={styles.timelineIndicatorCol}>
                      <View
                        style={[
                          styles.timelineDot,
                          step.completed && styles.timelineDotCompleted,
                          step.current && styles.timelineDotCurrent,
                        ]}
                      >
                        {step.completed && (
                          <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                        )}
                      </View>
                      {!isLast && (
                        <View
                          style={[
                            styles.timelineLine,
                            step.completed && styles.timelineLineCompleted,
                          ]}
                        />
                      )}
                    </View>

                    <View style={styles.timelineContent}>
                      <View style={styles.stepHeader}>
                        <Text style={[styles.stepTitle, step.current && styles.stepTitleCurrent]}>
                          {step.title}
                        </Text>
                        <Text style={styles.stepDate}>{step.date}</Text>
                      </View>
                      <Text style={styles.stepDesc}>{step.description}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Items & Address Grid */}
          <View style={[styles.detailsGrid, isDesktop && styles.detailsGridDesktop]}>
            {/* Ordered Items */}
            <View style={[styles.sectionBox, isDesktop && { width: '58%' }]}>
              <Text style={styles.cardHeading}>Creations in This Order</Text>
              <View style={styles.itemsList}>
                {order.items.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <Image source={{ uri: item.product.images[0] }} style={styles.itemImg} />
                    <View style={styles.itemMeta}>
                      <Text style={styles.itemName}>{item.product.name}</Text>
                      <Text style={styles.itemMaker}>Maker: {item.product.creatorName}</Text>
                      {item.customization && (
                        <View style={styles.customBadge}>
                          <Text style={styles.customBadgeText}>
                            Bespoke: {item.customization.customerName || item.customization.color || 'Customized'}
                          </Text>
                        </View>
                      )}
                      <Text style={styles.itemQtyPrice}>
                        {item.quantity} × ₹{item.product.price + (item.customization?.extraPrice || 0)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Total breakdown */}
              <View style={styles.priceBreakdown}>
                <View style={styles.breakRow}>
                  <Text style={styles.breakLabel}>Subtotal</Text>
                  <Text style={styles.breakVal}>₹{order.subtotal}</Text>
                </View>
                <View style={styles.breakRow}>
                  <Text style={styles.breakLabel}>Artisan Delivery</Text>
                  <Text style={styles.breakVal}>{order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}</Text>
                </View>
                <View style={styles.breakRow}>
                  <Text style={styles.breakLabel}>Payment Method</Text>
                  <Text style={styles.breakVal}>{order.paymentMethod}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Paid</Text>
                  <Text style={styles.totalVal}>₹{order.totalAmount}</Text>
                </View>
              </View>
            </View>

            {/* Delivery Address & Maker Contact */}
            <View style={[styles.sectionBox, isDesktop && { width: '39%' }]}>
              <Text style={styles.cardHeading}>Delivery Destination</Text>
              <View style={styles.addressBox}>
                <Text style={styles.addressName}>{order.deliveryAddress.name}</Text>
                <Text style={styles.addressLine}>{order.deliveryAddress.address}</Text>
                <Text style={styles.addressLine}>
                  {order.deliveryAddress.locality}, {order.deliveryAddress.city} - {order.deliveryAddress.pincode}
                </Text>
                <Text style={styles.addressPhone}>📞 {order.deliveryAddress.phone}</Text>
              </View>

              <View style={{ marginTop: 24 }}>
                <Text style={styles.cardHeading}>Artisan Communication</Text>
                <Text style={styles.contactHint}>
                  Have a question about the preparation or custom dimensions? Connect directly with the maker:
                </Text>
                <Pressable
                  onPress={() => setShowContactModal(true)}
                  style={styles.contactMakerBtn}
                  accessibilityRole="button"
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={17} color={colors.charcoal} />
                  <Text style={styles.contactMakerBtnText}>Message Artisan</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Message Modal */}
      <Modal
        visible={showContactModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowContactModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Message Your Maker</Text>
              <Pressable onPress={() => setShowContactModal(false)} hitSlop={8}>
                <Ionicons name="close" size={20} color={colors.charcoal} />
              </Pressable>
            </View>

            {msgSent ? (
              <View style={styles.msgSentBox}>
                <Ionicons name="checkmark-circle" size={44} color={colors.ecoGreen} />
                <Text style={styles.msgSentTitle}>Message Dispatched!</Text>
                <Text style={styles.msgSentBody}>
                  Your message regarding order #{order.id} has been delivered to the maker’s studio.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.modalSub}>
                  Send a direct question or delivery instruction to {order.items[0]?.product.creatorName}:
                </Text>
                <TextInput
                  style={styles.modalMsgInput}
                  placeholder="Type your message to the maker…"
                  placeholderTextColor={colors.textMuted}
                  value={messageText}
                  onChangeText={setMessageText}
                  multiline
                />
                <Pressable
                  onPress={handleSendMessage}
                  style={styles.modalSendBtn}
                >
                  <Text style={styles.modalSendBtnText}>Send Message</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      <BottomNavigation activeTab="orders" />
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
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backRow: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    marginBottom: 20,
    ...shadow.soft,
  },
  headerTop: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  orderTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 24,
    color: colors.charcoal,
  },
  orderDate: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8E8',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.goldDim,
  },
  statusPillText: {
    fontFamily: fonts.sans.bold,
    fontSize: 12.5,
    color: colors.goldDeep,
  },
  timelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 24,
    marginBottom: 24,
    ...shadow.soft,
  },
  cardHeading: {
    fontFamily: fonts.serif.bold,
    fontSize: 18,
    color: colors.charcoal,
    marginBottom: 16,
  },
  timelineList: {
    marginTop: 8,
  },
  timelineStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineIndicatorCol: {
    alignItems: 'center',
    width: 28,
  },
  timelineDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    backgroundColor: colors.marketplaceBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: colors.ecoGreen,
    borderColor: colors.ecoGreen,
  },
  timelineDotCurrent: {
    borderColor: colors.gold,
    backgroundColor: colors.gold,
  },
  timelineLine: {
    width: 2,
    minHeight: 48,
    backgroundColor: colors.cardBorder,
    marginVertical: 4,
  },
  timelineLineCompleted: {
    backgroundColor: colors.ecoGreen,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 12,
    paddingBottom: 24,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  stepTitle: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
    color: colors.textPrimary,
  },
  stepTitleCurrent: {
    color: colors.goldDeep,
  },
  stepDate: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  stepDesc: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 3,
  },
  detailsGrid: {
    flexDirection: 'column',
    gap: 20,
  },
  detailsGridDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  sectionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 22,
    ...shadow.soft,
  },
  itemsList: {
    gap: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  itemImg: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
  },
  itemMeta: {
    flex: 1,
  },
  itemName: {
    fontFamily: fonts.serif.bold,
    fontSize: 15,
    color: colors.charcoal,
  },
  itemMaker: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  customBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFDF9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.goldDim,
    marginTop: 3,
  },
  customBadgeText: {
    fontFamily: fonts.sans.medium,
    fontSize: 10.5,
    color: colors.goldDeep,
  },
  itemQtyPrice: {
    fontFamily: fonts.sans.bold,
    fontSize: 13,
    color: colors.charcoal,
    marginTop: 4,
  },
  priceBreakdown: {
    marginTop: 14,
    gap: 8,
  },
  breakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakLabel: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  breakVal: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.charcoal,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    marginTop: 4,
  },
  totalLabel: {
    fontFamily: fonts.sans.bold,
    fontSize: 15,
    color: colors.charcoal,
  },
  totalVal: {
    fontFamily: fonts.sans.bold,
    fontSize: 20,
    color: colors.charcoal,
  },
  addressBox: {
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.md,
    padding: 14,
    gap: 4,
  },
  addressName: {
    fontFamily: fonts.sans.bold,
    fontSize: 14,
    color: colors.charcoal,
  },
  addressLine: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  addressPhone: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.charcoal,
    marginTop: 4,
  },
  contactHint: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  contactMakerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.marketplaceBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    height: 42,
    borderRadius: radius.md,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  contactMakerBtnText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13.5,
    color: colors.charcoal,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 22, 19, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 24,
    ...shadow.card,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 18,
    color: colors.charcoal,
  },
  modalSub: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  modalMsgInput: {
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 12,
    height: 100,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  modalSendBtn: {
    backgroundColor: colors.charcoal,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSendBtnText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  msgSentBox: {
    alignItems: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  msgSentTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 18,
    color: colors.charcoal,
  },
  msgSentBody: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
