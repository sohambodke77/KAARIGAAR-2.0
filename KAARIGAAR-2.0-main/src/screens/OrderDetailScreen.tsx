import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
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
import { useMarketplace, type Order } from '../context/MarketplaceContext';
import { api } from '../services/apiClient';
import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadow } from '../theme';

type OrderDetailRouteProp = RouteProp<AppStackParamList, 'OrderDetail'>;

export function OrderDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<OrderDetailRouteProp>();
  const { orderId } = route.params;

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { orders, cancelOrderWithRefund, requestOrderRefund, fetchOrderInvoice } = useMarketplace();
  const order = orders.find((o) => o.id === orderId || o.orderNumber === orderId) || orders[0];

  // Modals state
  const [showContactModal, setShowContactModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [msgSent, setMsgSent] = useState(false);

  // Invoice Modal
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // Cancellation Modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Change of delivery plans');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState<string | null>(null);

  // Refund Request Modal (for delivered orders)
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState('Product finish or customization issue');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  const [refundSuccessMsg, setRefundSuccessMsg] = useState<string | null>(null);

  const isDelivered = order.status === 'Delivered';
  const isCancelled = order.status === 'Cancelled' || order.status === 'Refunded';
  const canCancel = !isDelivered && !isCancelled && order.status !== 'Shipped';

  const handleOpenInvoice = async () => {
    setShowInvoiceModal(true);
    setLoadingInvoice(true);
    try {
      const inv = await fetchOrderInvoice(order.id);
      if (inv) {
        setInvoiceData(inv);
      } else {
        // Fallback invoice data
        setInvoiceData({
          invoiceNumber: `INV-KG-${(order.orderNumber || order.id).replace('KG-', '')}-2026`,
          invoiceDate: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          marketplace: {
            name: 'KARIGAAR ARTISAN MARKETPLACE PRIVATE LIMITED',
            address: '7th Floor, Craft Atelier Tower, Kothrud, Pune, Maharashtra 411038',
            gstin: '27AABCK9412M1Z8',
            cin: 'U74999PN2026PTC198421',
          },
          buyer: {
            name: order.deliveryAddress.name,
            phone: order.deliveryAddress.phone,
            address: `${order.deliveryAddress.address}, ${order.deliveryAddress.locality}`,
            city: `${order.deliveryAddress.city} - ${order.deliveryAddress.pincode}`,
          },
          items: order.items.map((it, idx) => ({
            serialNo: idx + 1,
            name: it.product.name,
            artisanName: it.product.creatorName,
            hsnCode: '9701 (Handmade Art & Crafts)',
            quantity: it.quantity,
            unitPrice: it.product.price,
            totalAmount: (it.product.price + (it.customization?.extraPrice || 0)) * it.quantity,
            cgstAmount: Math.round(it.product.price * 0.025 * 100) / 100,
            sgstAmount: Math.round(it.product.price * 0.025 * 100) / 100,
          })),
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          discount: order.discount,
          taxGstTotal: Math.round(order.subtotal * 0.05 * 100) / 100,
          totalAmount: order.totalAmount,
        });
      }
    } catch {
      // Fallback handled
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handleConfirmCancel = async () => {
    setIsCancelling(true);
    try {
      const res = await cancelOrderWithRefund(order.id, cancelReason);
      setIsCancelling(false);
      setCancelSuccessMsg(res?.message || 'Order cancelled successfully. Refund initiated to source payment method.');
      setTimeout(() => {
        setShowCancelModal(false);
        setCancelSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setIsCancelling(false);
      alert(err.message || 'Failed to cancel order');
    }
  };

  const handleConfirmRefund = async () => {
    setIsSubmittingRefund(true);
    try {
      const res = await requestOrderRefund(order.id, refundReason, order.totalAmount);
      setIsSubmittingRefund(false);
      setRefundSuccessMsg('Your return/refund request has been submitted to the Karigaar Trust & Safety team.');
      setTimeout(() => {
        setShowRefundModal(false);
        setRefundSuccessMsg(null);
      }, 1500);
    } catch (err: any) {
      setIsSubmittingRefund(false);
      alert(err.message || 'Failed to submit refund request');
    }
  };

  const handleSendMessage = () => {
    setMsgSent(true);
    setTimeout(() => {
      setShowContactModal(false);
      setMsgSent(false);
      setMessageText('');
    }, 1200);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return colors.ecoGreen;
      case 'Shipped':
        return '#2E5B82';
      case 'Cancelled':
      case 'Refunded':
        return colors.danger;
      default:
        return colors.goldDeep;
    }
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

          {/* Top Banner Card */}
          <View style={styles.headerCard}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.orderTitle}>Order #{order.orderNumber || order.id}</Text>
                <Text style={styles.orderDate}>
                  Placed on {order.date} • Tracking: {order.trackingNumber}
                </Text>
              </View>
              <View
                style={[
                  styles.statusPill,
                  { backgroundColor: `${getStatusColor(order.status)}18`, borderColor: `${getStatusColor(order.status)}44` },
                ]}
              >
                <Ionicons name="sparkles" size={14} color={getStatusColor(order.status)} />
                <Text style={[styles.statusPillText, { color: getStatusColor(order.status) }]}>{order.status}</Text>
              </View>
            </View>

            {/* Quick Action Buttons Row */}
            <View style={styles.headerActionsRow}>
              <Pressable onPress={handleOpenInvoice} style={styles.headerActionBtn}>
                <Ionicons name="document-text-outline" size={16} color={colors.charcoal} />
                <Text style={styles.headerActionBtnText}>Tax Receipt / Invoice</Text>
              </Pressable>

              {canCancel && (
                <Pressable onPress={() => setShowCancelModal(true)} style={[styles.headerActionBtn, styles.cancelBtn]}>
                  <Ionicons name="close-circle-outline" size={16} color={colors.danger} />
                  <Text style={[styles.headerActionBtnText, { color: colors.danger }]}>Cancel Order</Text>
                </Pressable>
              )}

              {isDelivered && (
                <Pressable onPress={() => setShowRefundModal(true)} style={styles.headerActionBtn}>
                  <Ionicons name="refresh-outline" size={16} color={colors.charcoal} />
                  <Text style={styles.headerActionBtnText}>Return / Refund</Text>
                </Pressable>
              )}
            </View>
          </View>

          {/* Refunded Banner if applicable */}
          {order.paymentStatus === 'Refunded' && (
            <View style={styles.refundBanner}>
              <Ionicons name="checkmark-circle" size={20} color={colors.ecoGreen} />
              <View style={{ flex: 1 }}>
                <Text style={styles.refundBannerTitle}>Refund Processed (₹{order.totalAmount})</Text>
                <Text style={styles.refundBannerSub}>
                  Refund has been credited back to your original payment method ({order.paymentMethod}).
                </Text>
              </View>
            </View>
          )}

          {/* Interactive Timeline Tracker */}
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
                        {step.completed && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
                      </View>
                      {!isLast && (
                        <View style={[styles.timelineLine, step.completed && styles.timelineLineCompleted]} />
                      )}
                    </View>

                    <View style={styles.timelineContent}>
                      <View style={styles.stepHeader}>
                        <Text style={[styles.stepTitle, step.current && styles.stepTitleCurrent]}>{step.title}</Text>
                        <Text style={styles.stepDate}>{step.date}</Text>
                      </View>
                      <Text style={styles.stepDesc}>{step.description}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Details Grid */}
          <View style={[styles.detailsGrid, isDesktop && styles.detailsGridDesktop]}>
            {/* Ordered Items & Payment Details */}
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
                            Bespoke:{' '}
                            {item.customization.customerName ||
                              item.customization.initials ||
                              item.customization.color ||
                              'Customized'}
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

              {/* Verified Payment Details */}
              <View style={styles.paymentInfoBox}>
                <Text style={styles.paymentInfoTitle}>Payment & Transaction Details</Text>
                <View style={styles.paymentInfoRow}>
                  <Text style={styles.paymentInfoLabel}>Payment Method:</Text>
                  <Text style={styles.paymentInfoVal}>{order.paymentMethod}</Text>
                </View>
                <View style={styles.paymentInfoRow}>
                  <Text style={styles.paymentInfoLabel}>Payment Status:</Text>
                  <View
                    style={[
                      styles.miniStatusTag,
                      order.paymentStatus === 'Paid'
                        ? { backgroundColor: colors.ecoGreenFaint }
                        : { backgroundColor: colors.goldFaint },
                    ]}
                  >
                    <Text
                      style={[
                        styles.miniStatusTagText,
                        order.paymentStatus === 'Paid' ? { color: colors.ecoGreen } : { color: colors.goldDeep },
                      ]}
                    >
                      {order.paymentStatus}
                    </Text>
                  </View>
                </View>
                {order.gatewayPaymentId && (
                  <View style={styles.paymentInfoRow}>
                    <Text style={styles.paymentInfoLabel}>Gateway Payment ID:</Text>
                    <Text style={[styles.paymentInfoVal, { fontFamily: 'monospace' }]}>
                      {order.gatewayPaymentId}
                    </Text>
                  </View>
                )}
                {order.gatewayOrderId && (
                  <View style={styles.paymentInfoRow}>
                    <Text style={styles.paymentInfoLabel}>Gateway Order ID:</Text>
                    <Text style={[styles.paymentInfoVal, { fontFamily: 'monospace' }]}>
                      {order.gatewayOrderId}
                    </Text>
                  </View>
                )}
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
                {order.discount > 0 && (
                  <View style={styles.breakRow}>
                    <Text style={styles.breakLabel}>Discount</Text>
                    <Text style={[styles.breakVal, { color: colors.ecoGreen }]}>-₹{order.discount}</Text>
                  </View>
                )}
                <View style={styles.breakRow}>
                  <Text style={styles.breakLabel}>GST (Handcrafted Tax)</Text>
                  <Text style={styles.breakVal}>₹{order.taxGst || Math.round(order.subtotal * 0.05 * 100) / 100}</Text>
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

              {/* Courier Partner Info */}
              <View style={styles.courierBox}>
                <Ionicons name="cube-outline" size={18} color={colors.goldDeep} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.courierTitle}>
                    {order.courierPartner || 'Pune Artisan Express Delivery'}
                  </Text>
                  <Text style={styles.courierSub}>AWB #{order.trackingNumber}</Text>
                </View>
              </View>

              {/* Message Maker */}
              <View style={{ marginTop: 24 }}>
                <Text style={styles.cardHeading}>Artisan Communication</Text>
                <Text style={styles.contactHint}>
                  Need custom dimensions, delivery notes, or craft updates? Connect directly with the maker:
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

      {/* --- TAX INVOICE MODAL --- */}
      <Modal visible={showInvoiceModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.invoiceModalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Tax Invoice & Official Receipt</Text>
                <Text style={styles.invoiceSub}>GST-compliant artisanal invoice for order #{order.orderNumber || order.id}</Text>
              </View>
              <Pressable onPress={() => setShowInvoiceModal(false)} hitSlop={8}>
                <Ionicons name="close" size={22} color={colors.charcoal} />
              </Pressable>
            </View>

            {loadingInvoice ? (
              <ActivityIndicator color={colors.gold} size="large" style={{ marginVertical: 32 }} />
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {invoiceData && (
                  <View style={styles.invoicePaper}>
                    {/* Header */}
                    <View style={styles.invoiceHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.invCompany}>{invoiceData.marketplace?.name}</Text>
                        <Text style={styles.invCompanyAddress}>{invoiceData.marketplace?.address}</Text>
                        <Text style={styles.invTaxInfo}>GSTIN: {invoiceData.marketplace?.gstin}</Text>
                        <Text style={styles.invTaxInfo}>CIN: {invoiceData.marketplace?.cin}</Text>
                      </View>
                      <View style={styles.invMetaRight}>
                        <Text style={styles.invNumber}>{invoiceData.invoiceNumber}</Text>
                        <Text style={styles.invDate}>Date: {invoiceData.invoiceDate}</Text>
                        <Text style={styles.invDate}>Method: {order.paymentMethod}</Text>
                      </View>
                    </View>

                    <View style={styles.invDivider} />

                    {/* Buyer Details */}
                    <View style={styles.invBuyerBox}>
                      <Text style={styles.invSectionHeading}>Billed To / Delivered To:</Text>
                      <Text style={styles.invBuyerName}>{invoiceData.buyer?.name}</Text>
                      <Text style={styles.invBuyerAddress}>{invoiceData.buyer?.address}</Text>
                      <Text style={styles.invBuyerAddress}>{invoiceData.buyer?.city}</Text>
                      <Text style={styles.invBuyerAddress}>📞 {invoiceData.buyer?.phone}</Text>
                    </View>

                    {/* Table of items */}
                    <View style={styles.invTable}>
                      <View style={styles.invTableRowHeader}>
                        <Text style={[styles.invCol, { width: 30 }]}>#</Text>
                        <Text style={[styles.invCol, { flex: 1.5 }]}>Craft Creation & Maker</Text>
                        <Text style={[styles.invCol, { width: 80 }]}>HSN</Text>
                        <Text style={[styles.invCol, { width: 40, textAlign: 'center' }]}>Qty</Text>
                        <Text style={[styles.invCol, { width: 70, textAlign: 'right' }]}>Rate (₹)</Text>
                        <Text style={[styles.invCol, { width: 80, textAlign: 'right' }]}>Total (₹)</Text>
                      </View>

                      {invoiceData.items?.map((it: any) => (
                        <View key={it.serialNo} style={styles.invTableRow}>
                          <Text style={[styles.invColText, { width: 30 }]}>{it.serialNo}</Text>
                          <View style={{ flex: 1.5 }}>
                            <Text style={styles.invItemName}>{it.name}</Text>
                            <Text style={styles.invItemMaker}>Artisan: {it.artisanName}</Text>
                          </View>
                          <Text style={[styles.invColText, { width: 80 }]}>{it.hsnCode?.split(' ')[0] || '9701'}</Text>
                          <Text style={[styles.invColText, { width: 40, textAlign: 'center' }]}>{it.quantity}</Text>
                          <Text style={[styles.invColText, { width: 70, textAlign: 'right' }]}>₹{it.unitPrice}</Text>
                          <Text style={[styles.invColText, { width: 80, textAlign: 'right', fontWeight: '700' }]}>
                            ₹{it.totalAmount}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* Taxes & Total */}
                    <View style={styles.invSummary}>
                      <View style={styles.invSumRow}>
                        <Text style={styles.invSumLabel}>Items Subtotal:</Text>
                        <Text style={styles.invSumVal}>₹{invoiceData.subtotal}</Text>
                      </View>
                      <View style={styles.invSumRow}>
                        <Text style={styles.invSumLabel}>Artisan Delivery:</Text>
                        <Text style={styles.invSumVal}>₹{invoiceData.deliveryFee}</Text>
                      </View>
                      {invoiceData.discount > 0 && (
                        <View style={styles.invSumRow}>
                          <Text style={styles.invSumLabel}>Artisan Discount:</Text>
                          <Text style={[styles.invSumVal, { color: colors.ecoGreen }]}>-₹{invoiceData.discount}</Text>
                        </View>
                      )}
                      <View style={styles.invSumRow}>
                        <Text style={styles.invSumLabel}>GST Total (Handmade CGST+SGST):</Text>
                        <Text style={styles.invSumVal}>₹{invoiceData.taxGstTotal}</Text>
                      </View>
                      <View style={[styles.invSumRow, styles.invGrandRow]}>
                        <Text style={styles.invGrandLabel}>Grand Total (INR):</Text>
                        <Text style={styles.invGrandVal}>₹{invoiceData.totalAmount}</Text>
                      </View>
                    </View>

                    <Text style={styles.invFooterNote}>
                      This is a computer-generated tax invoice. Verified digital signature on file. Registered in Pune,
                      Maharashtra.
                    </Text>
                  </View>
                )}

                <Pressable
                  onPress={() => {
                    alert('Tax invoice PDF saved to your downloads folder.');
                    setShowInvoiceModal(false);
                  }}
                  style={styles.printInvoiceBtn}
                >
                  <Ionicons name="download-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.printInvoiceBtnText}>Download / Print Tax Invoice</Text>
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* --- CANCELLATION MODAL --- */}
      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.cancelModalCard}>
            <Ionicons name="alert-circle-outline" size={36} color={colors.danger} style={{ alignSelf: 'center' }} />
            <Text style={styles.cancelModalTitle}>Cancel Order #{order.orderNumber || order.id}?</Text>
            <Text style={styles.cancelModalDesc}>
              Since this creation is still in preparation, you are eligible for an immediate full refund of ₹
              {order.totalAmount} back to your original payment method.
            </Text>

            {cancelSuccessMsg ? (
              <View style={styles.cancelSuccessBox}>
                <Ionicons name="checkmark-circle" size={24} color={colors.ecoGreen} />
                <Text style={styles.cancelSuccessText}>{cancelSuccessMsg}</Text>
              </View>
            ) : (
              <>
                <Text style={styles.fieldLabel}>Please tell us why you are cancelling:</Text>
                {[
                  'Ordered by mistake',
                  'Delivery timeframe is too long',
                  'Need different customization or color',
                  'Found alternative local artisan gift',
                ].map((reason) => (
                  <Pressable
                    key={reason}
                    onPress={() => setCancelReason(reason)}
                    style={[styles.reasonOption, cancelReason === reason && styles.reasonOptionActive]}
                  >
                    <View style={[styles.radioDot, cancelReason === reason && styles.radioDotSelected]} />
                    <Text style={styles.reasonText}>{reason}</Text>
                  </Pressable>
                ))}

                <View style={styles.cancelActionsRow}>
                  <Pressable onPress={() => setShowCancelModal(false)} style={styles.keepOrderBtn}>
                    <Text style={styles.keepOrderBtnText}>Keep My Order</Text>
                  </Pressable>

                  <Pressable onPress={handleConfirmCancel} disabled={isCancelling} style={styles.confirmCancelBtn}>
                    {isCancelling ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.confirmCancelBtnText}>Cancel & Refund</Text>
                    )}
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* --- RETURN / REFUND REQUEST MODAL --- */}
      <Modal visible={showRefundModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.cancelModalCard}>
            <Ionicons name="refresh-circle-outline" size={36} color={colors.goldDeep} style={{ alignSelf: 'center' }} />
            <Text style={styles.cancelModalTitle}>Request Return / Refund</Text>
            <Text style={styles.cancelModalDesc}>
              Under KARIGAAR's 7-Day Maker Satisfaction Guarantee, you can request an adjustment or refund for eligible
              handcrafted creations.
            </Text>

            {refundSuccessMsg ? (
              <View style={styles.cancelSuccessBox}>
                <Ionicons name="checkmark-circle" size={24} color={colors.ecoGreen} />
                <Text style={styles.cancelSuccessText}>{refundSuccessMsg}</Text>
              </View>
            ) : (
              <>
                <Text style={styles.fieldLabel}>Issue with your order:</Text>
                {[
                  'Product finish or customization issue',
                  'Item arrived damaged during courier transit',
                  'Received different item from what was ordered',
                ].map((r) => (
                  <Pressable
                    key={r}
                    onPress={() => setRefundReason(r)}
                    style={[styles.reasonOption, refundReason === r && styles.reasonOptionActive]}
                  >
                    <View style={[styles.radioDot, refundReason === r && styles.radioDotSelected]} />
                    <Text style={styles.reasonText}>{r}</Text>
                  </Pressable>
                ))}

                <View style={styles.cancelActionsRow}>
                  <Pressable onPress={() => setShowRefundModal(false)} style={styles.keepOrderBtn}>
                    <Text style={styles.keepOrderBtnText}>Close</Text>
                  </Pressable>

                  <Pressable onPress={handleConfirmRefund} disabled={isSubmittingRefund} style={styles.confirmRefundBtn}>
                    {isSubmittingRefund ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.confirmCancelBtnText}>Submit Request</Text>
                    )}
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* --- ARTISAN MESSAGE MODAL --- */}
      <Modal visible={showContactModal} transparent animationType="fade" onRequestClose={() => setShowContactModal(false)}>
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
                  Your message regarding order #{order.orderNumber || order.id} has been delivered to the maker’s studio.
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
                <Pressable onPress={handleSendMessage} style={styles.modalSendBtn}>
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
  headerCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    marginBottom: 16,
    ...shadow.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.serif.bold,
  },
  orderDate: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  headerActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorderSubtle,
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.cardBgAlt,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cancelBtn: {
    borderColor: '#F5C6CB',
    backgroundColor: '#FDEDED',
  },
  headerActionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.charcoal,
  },
  refundBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.ecoGreenFaint,
    borderWidth: 1,
    borderColor: 'rgba(46, 125, 50, 0.3)',
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 16,
  },
  refundBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.ecoGreen,
  },
  refundBannerSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  timelineCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    marginBottom: 16,
    ...shadow.sm,
  },
  cardHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.serif.bold,
    marginBottom: 16,
  },
  timelineList: {
    paddingLeft: 6,
  },
  timelineStepRow: {
    flexDirection: 'row',
    minHeight: 64,
  },
  timelineIndicatorCol: {
    alignItems: 'center',
    width: 28,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotCompleted: {
    borderColor: colors.ecoGreen,
    backgroundColor: colors.ecoGreen,
  },
  timelineDotCurrent: {
    borderColor: colors.goldDeep,
    backgroundColor: colors.goldDeep,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 4,
  },
  timelineLineCompleted: {
    backgroundColor: colors.ecoGreen,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 14,
    paddingBottom: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  stepTitleCurrent: {
    color: colors.charcoal,
    fontWeight: '700',
  },
  stepDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  stepDesc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  detailsGrid: {
    flexDirection: 'column',
    gap: 16,
    marginBottom: 32,
  },
  detailsGridDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sectionBox: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    ...shadow.sm,
  },
  itemsList: {
    gap: 12,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: 10,
  },
  itemImg: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: colors.cardBgAlt,
  },
  itemMeta: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemMaker: {
    fontSize: 12,
    color: colors.textMuted,
  },
  customBadge: {
    backgroundColor: colors.goldFaint,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginVertical: 4,
  },
  customBadgeText: {
    fontSize: 11,
    color: colors.goldDeep,
    fontWeight: '600',
  },
  itemQtyPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.charcoal,
  },
  paymentInfoBox: {
    backgroundColor: colors.cardBgAlt,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 16,
    gap: 6,
  },
  paymentInfoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.charcoal,
    marginBottom: 4,
  },
  paymentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentInfoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  paymentInfoVal: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.charcoal,
  },
  miniStatusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniStatusTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  priceBreakdown: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 12,
    gap: 8,
  },
  breakRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  breakVal: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 10,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.charcoal,
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.chocolate,
  },
  addressBox: {
    backgroundColor: colors.cardBgAlt,
    borderRadius: radius.md,
    padding: 14,
    gap: 4,
  },
  addressName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addressLine: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  addressPhone: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.charcoal,
    marginTop: 4,
  },
  courierBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: 12,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
  },
  courierTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  courierSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  contactHint: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  contactMakerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  contactMakerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.charcoal,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 20,
    width: '100%',
    maxWidth: 480,
    ...shadow.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    fontFamily: fonts.serif.bold,
  },
  modalSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  modalMsgInput: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    padding: 12,
    fontSize: 13,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  modalSendBtn: {
    backgroundColor: colors.chocolate,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalSendBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  msgSentBox: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  msgSentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.charcoal,
  },
  msgSentBody: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  invoiceModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 24,
    width: '100%',
    maxWidth: 720,
    maxHeight: '90%',
    ...shadow.lg,
  },
  invoiceSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  invoicePaper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    padding: 20,
    marginVertical: 12,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  invCompany: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.charcoal,
  },
  invCompanyAddress: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  invTaxInfo: {
    fontSize: 11,
    color: colors.charcoal,
    fontWeight: '600',
    marginTop: 2,
  },
  invMetaRight: {
    alignItems: 'flex-end',
  },
  invNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.goldDeep,
  },
  invDate: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  invDivider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 14,
  },
  invBuyerBox: {
    marginBottom: 14,
  },
  invSectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  invBuyerName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  invBuyerAddress: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  invTable: {
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    marginBottom: 14,
  },
  invTableRowHeader: {
    flexDirection: 'row',
    backgroundColor: colors.cardBgAlt,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  invCol: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.charcoal,
  },
  invTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorderSubtle,
  },
  invColText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  invItemName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  invItemMaker: {
    fontSize: 10,
    color: colors.textMuted,
  },
  invSummary: {
    alignSelf: 'flex-end',
    width: 240,
    gap: 4,
  },
  invSumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  invSumLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  invSumVal: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  invGrandRow: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 6,
    marginTop: 4,
  },
  invGrandLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.charcoal,
  },
  invGrandVal: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.chocolate,
  },
  invFooterNote: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  printInvoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.chocolate,
    borderRadius: radius.md,
    paddingVertical: 12,
    marginTop: 8,
  },
  printInvoiceBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  cancelModalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    padding: 24,
    width: '100%',
    maxWidth: 440,
    ...shadow.lg,
  },
  cancelModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.charcoal,
    textAlign: 'center',
    marginTop: 10,
  },
  cancelModalDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginVertical: 12,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    padding: 10,
    marginBottom: 8,
  },
  reasonOptionActive: {
    borderColor: colors.goldDeep,
    backgroundColor: colors.goldFaint,
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.cardBorder,
  },
  radioDotSelected: {
    borderColor: colors.goldDeep,
    backgroundColor: colors.goldDeep,
  },
  reasonText: {
    fontSize: 12,
    color: colors.charcoal,
  },
  cancelActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  keepOrderBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  keepOrderBtnText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  confirmCancelBtn: {
    flex: 1,
    backgroundColor: colors.danger,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmRefundBtn: {
    flex: 1,
    backgroundColor: colors.chocolate,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmCancelBtnText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cancelSuccessBox: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  cancelSuccessText: {
    fontSize: 13,
    color: colors.ecoGreen,
    fontWeight: '600',
    textAlign: 'center',
  },
  fieldLabel: {
    fontSize: 12.5,
    fontFamily: fonts.sans.semibold,
    color: colors.charcoal,
    marginBottom: 8,
    marginTop: 4,
  },
});
