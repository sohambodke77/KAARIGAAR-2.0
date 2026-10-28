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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ArtisanOnboardingModal } from '../components/ArtisanOnboardingModal';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { api } from '../services/apiClient';
import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadow } from '../theme';

type CreatorTab = 'overview' | 'products' | 'orders' | 'earnings' | 'custom' | 'messages';

export function SellerDashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { switchRole, canAccessSellerFeatures, signOut } = useAuth();
  const { products, orders, customBriefs, updateOrderStatus } = useMarketplace();

  const [activeTab, setActiveTab] = useState<CreatorTab>('overview');
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  // Financial State
  const [financials, setFinancials] = useState<any>({
    grossOrderValue: 24850,
    totalSalesCount: 14,
    platformCommission: 2485,
    gatewayFees: 497,
    refundAdjustments: 0,
    totalNetEarnings: 21868,
    paidOutEarnings: 15400,
    availableBalance: 3268,
    pendingSettlement: 3200,
  });

  const [payoutAccount, setPayoutAccount] = useState<any>({
    accountHolderName: 'Sanket Joshi',
    accountNumberMasked: '•••• •••• •••• 2910',
    ifscCode: 'ICIC0000341',
    bankName: 'ICICI Bank, Deccan Gymkhana Pune',
    upiVpa: 'sanket.craft@okicici',
    verificationStatus: 'verified',
  });

  const [sellerOrdersWithComm, setSellerOrdersWithComm] = useState<any[]>([]);
  const [settlements, setSettlements] = useState<any[]>([
    {
      id: 'set_ref_98012',
      settlementReference: 'SETTL-PUN-20261011-001',
      sellerName: 'You (Karigaar)',
      amount: 15400,
      payoutStatus: 'completed',
      utrNumber: 'HDFCR202610119821034',
      bankName: 'ICICI Bank',
      bankAccountMasked: '•••• •••• •••• 2910',
      processedAt: '11 Oct 2026',
    },
  ]);
  const [isSettling, setIsSettling] = useState(false);
  const [settleResultMsg, setSettleResultMsg] = useState<string | null>(null);

  // Bank Onboarding / Edit Modal state
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankHolder, setBankHolder] = useState('Sanket Joshi');
  const [bankAccNum, setBankAccNum] = useState('');
  const [bankIfsc, setBankIfsc] = useState('ICIC0000341');
  const [bankName, setBankName] = useState('ICICI Bank, Deccan Gymkhana Pune');
  const [bankUpi, setBankUpi] = useState('sanket.craft@okicici');
  const [bankError, setBankError] = useState('');
  const [savingBank, setSavingBank] = useState(false);

  // Courier Dispatch Modal
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [dispatchOrderId, setDispatchOrderId] = useState<string | null>(null);
  const [dispatchCourier, setDispatchCourier] = useState('Pune Artisan Priority Express');
  const [dispatchTracking, setDispatchTracking] = useState('');

  // Fetch live metrics on load
  useEffect(() => {
    (async () => {
      try {
        const sellerId = 'creator_me';
        const [dash, ords, setts] = await Promise.all([
          api.getSellerDashboard(sellerId),
          api.getSellerOrders(sellerId),
          api.getSellerSettlements(sellerId),
        ]);
        if (dash?.metrics) setFinancials(dash.metrics);
        if (dash?.payoutAccount) setPayoutAccount(dash.payoutAccount);
        if (ords && ords.length > 0) setSellerOrdersWithComm(ords);
        if (setts && setts.length > 0) setSettlements(setts);
      } catch {}
    })();
  }, [orders]);

  // Request Payout
  const handleRequestPayout = async () => {
    if (financials.availableBalance <= 0) return;
    setIsSettling(true);
    setSettleResultMsg(null);
    try {
      const res = await api.requestSellerPayout('creator_me');
      setIsSettling(false);
      if (res.success) {
        setSettleResultMsg(
          `Payout of ₹${res.settlement.amount} initiated to ${payoutAccount.bankName}! Bank UTR: ${res.settlement.utrNumber}`
        );
        setFinancials((prev: any) => ({
          ...prev,
          paidOutEarnings: prev.paidOutEarnings + res.settlement.amount,
          availableBalance: 0,
        }));
        setSettlements((prev) => [res.settlement, ...prev]);
      }
    } catch (err: any) {
      setIsSettling(false);
      alert(err.message || 'Settlement failed');
    }
  };

  // Save Bank Details
  const handleSaveBank = async () => {
    if (!bankHolder.trim() || !bankAccNum.trim() || !bankIfsc.trim()) {
      setBankError('Please fill in Account Holder Name, Account Number, and IFSC Code');
      return;
    }
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(bankIfsc.trim().toUpperCase())) {
      setBankError('Invalid IFSC format. Example: HDFC0001822 or ICIC0000341');
      return;
    }

    setSavingBank(true);
    setBankError('');
    try {
      const res = await api.saveSellerPayoutAccount('creator_me', {
        accountHolderName: bankHolder,
        accountNumber: bankAccNum,
        ifscCode: bankIfsc.trim().toUpperCase(),
        bankName: bankName || 'Bank of Maharashtra',
        upiVpa: bankUpi,
      });
      setSavingBank(false);
      if (res.success) {
        setPayoutAccount(res.account);
        setShowBankModal(false);
      }
    } catch (err: any) {
      setSavingBank(false);
      setBankError(err.message || 'Failed to save bank account');
    }
  };

  const openDispatchDialog = (orderId: string) => {
    setDispatchOrderId(orderId);
    setDispatchTracking(`DEL-PUN-${Math.floor(100000 + Math.random() * 900000)}`);
    setShowDispatchModal(true);
  };

  const handleConfirmDispatch = () => {
    if (dispatchOrderId) {
      updateOrderStatus(dispatchOrderId, 'Shipped', dispatchTracking, dispatchCourier);
      setShowDispatchModal(false);
      setDispatchOrderId(null);
    }
  };

  // Stats
  const activeProductsCount = products.length;
  const pendingRequestsCount = customBriefs.length || 3;
  const totalOrdersCount = orders.length;
  const totalEarnings = financials.grossOrderValue || orders.reduce((sum, o) => sum + o.totalAmount, 0) + 12450;

  const handleSwitchToCustomer = async () => {
    await switchRole('customer');
    navigation.navigate('CustomerHome');
  };

  if (!canAccessSellerFeatures) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.restrictedCenter}>
          <View style={styles.restrictedIconWrap}>
            <Ionicons name="lock-closed-outline" size={38} color={colors.goldBright} />
          </View>
          <Text style={styles.restrictedTitle}>Artisan Studio Access Required</Text>
          <Text style={styles.restrictedDesc}>
            You are currently signed in as a Customer. To list handmade creations, receive custom briefs, and manage earnings, please complete your Artisan Studio profile.
          </Text>

          <Pressable
            onPress={() => setShowOnboardingModal(true)}
            style={styles.restrictedPrimaryBtn}
            accessibilityRole="button"
          >
            <Ionicons name="sparkles" size={16} color={colors.charcoal} />
            <Text style={styles.restrictedPrimaryBtnText}>Complete Artisan Setup</Text>
          </Pressable>

          <Pressable
            onPress={handleSwitchToCustomer}
            style={styles.restrictedSecondaryBtn}
            accessibilityRole="button"
          >
            <Text style={styles.restrictedSecondaryBtnText}>← Return to Customer Marketplace</Text>
          </Pressable>
        </View>

        <ArtisanOnboardingModal
          visible={showOnboardingModal}
          onClose={() => setShowOnboardingModal(false)}
          onSuccess={() => {
            setShowOnboardingModal(false);
          }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Creator Hub Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerInner}>
          <View style={styles.headerLeft}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoBadgeText}>का</Text>
            </View>
            <View>
              <Text style={styles.brandTitle}>KARIGAAR</Text>
              <Text style={styles.hubSubtitle}>Creator & Artisan Hub</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => navigation.navigate('AdminDashboard')}
              style={styles.adminPortalBtn}
              accessibilityRole="button"
            >
              <Ionicons name="shield-checkmark" size={15} color={colors.goldBright} />
              <Text style={styles.adminPortalText}>Admin Portal</Text>
            </Pressable>

            <Pressable
              onPress={handleSwitchToCustomer}
              style={styles.switchModeBtn}
              accessibilityRole="button"
            >
              <Ionicons name="bag-handle-outline" size={15} color={colors.charcoal} />
              <Text style={styles.switchModeText}>Customer Mode</Text>
            </Pressable>

            <Pressable
              onPress={signOut}
              style={styles.switchModeBtn}
              accessibilityRole="button"
            >
              <Ionicons name="log-out-outline" size={15} color={colors.danger} />
              <Text style={[styles.switchModeText, { color: colors.danger }]}>Sign Out</Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('AddProduct')}
              style={styles.addProductBtn}
              accessibilityRole="button"
            >
              <Ionicons name="add" size={18} color="#FFFFFF" />
              <Text style={styles.addProductBtnText}>+ Add New Product</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Welcome Banner */}
          <View style={styles.welcomeBanner}>
            <View>
              <Text style={styles.welcomeTitle}>Welcome back, Karigaar</Text>
              <Text style={styles.welcomeSub}>
                Your handmade workshop is live in Pune. You have 2 new custom requests to review!
              </Text>
            </View>
          </View>

          {/* Quick Metrics Bar (5 Stat Cards) */}
          <View style={styles.statsGrid}>
            <View style={styles.statTile}>
              <View style={styles.statIconCircle}>
                <Ionicons name="receipt-outline" size={20} color={colors.goldDeep} />
              </View>
              <Text style={styles.statValue}>{totalOrdersCount}</Text>
              <Text style={styles.statLabel}>Total Orders</Text>
            </View>

            <View style={styles.statTile}>
              <View style={styles.statIconCircle}>
                <Ionicons name="cube-outline" size={20} color={colors.goldDeep} />
              </View>
              <Text style={styles.statValue}>{activeProductsCount}</Text>
              <Text style={styles.statLabel}>Active Products</Text>
            </View>

            <View style={styles.statTile}>
              <View style={styles.statIconCircle}>
                <Ionicons name="sparkles-outline" size={20} color={colors.goldDeep} />
              </View>
              <Text style={styles.statValue}>{pendingRequestsCount}</Text>
              <Text style={styles.statLabel}>Pending Requests</Text>
            </View>

            <View style={styles.statTile}>
              <View style={styles.statIconCircle}>
                <MaterialCommunityIcons name="currency-inr" size={20} color={colors.goldDeep} />
              </View>
              <Text style={styles.statValue}>₹{totalEarnings.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Earnings</Text>
            </View>

            <View style={styles.statTile}>
              <View style={styles.statIconCircle}>
                <Ionicons name="chatbubbles-outline" size={20} color={colors.goldDeep} />
              </View>
              <Text style={styles.statValue}>4</Text>
              <Text style={styles.statLabel}>Customer Messages</Text>
            </View>
          </View>

          {/* Nav Tabs */}
          <View style={styles.tabsRow}>
            <Pressable
              onPress={() => setActiveTab('overview')}
              style={[styles.tabBtn, activeTab === 'overview' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabBtnText, activeTab === 'overview' && styles.tabBtnTextActive]}>
                Dashboard
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('products')}
              style={[styles.tabBtn, activeTab === 'products' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabBtnText, activeTab === 'products' && styles.tabBtnTextActive]}>
                Products ({products.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('orders')}
              style={[styles.tabBtn, activeTab === 'orders' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabBtnText, activeTab === 'orders' && styles.tabBtnTextActive]}>
                Orders ({orders.length})
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('earnings')}
              style={[styles.tabBtn, activeTab === 'earnings' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabBtnText, activeTab === 'earnings' && styles.tabBtnTextActive]}>
                Earnings & Payouts
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('custom')}
              style={[styles.tabBtn, activeTab === 'custom' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabBtnText, activeTab === 'custom' && styles.tabBtnTextActive]}>
                Custom Requests
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setActiveTab('messages')}
              style={[styles.tabBtn, activeTab === 'messages' && styles.tabBtnActive]}
            >
              <Text style={[styles.tabBtnText, activeTab === 'messages' && styles.tabBtnTextActive]}>
                Messages
              </Text>
            </Pressable>
          </View>

          {/* Tab Content: OVERVIEW */}
          {activeTab === 'overview' && (
            <View style={styles.tabContentBlock}>
              {/* Recent Orders Queue */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Recent Orders To Fulfill</Text>
                  <Pressable onPress={() => setActiveTab('orders')}>
                    <Text style={styles.linkText}>View All Orders →</Text>
                  </Pressable>
                </View>

                {orders.slice(0, 3).map((ord) => (
                  <View key={ord.id} style={styles.recentOrderRow}>
                    <Image source={{ uri: ord.items[0]?.product.images[0] }} style={styles.orderThumb} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.orderProdTitle}>{ord.items[0]?.product.name}</Text>
                      <Text style={styles.orderMeta}>
                        Order #{ord.id} • {ord.deliveryAddress.locality}, Pune • ₹{ord.totalAmount}
                      </Text>
                    </View>
                    <View style={styles.orderStatusPill}>
                      <Text style={styles.orderStatusText}>{ord.status}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Incoming Custom Requests Preview */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Custom Commission Briefs</Text>
                  <Pressable onPress={() => setActiveTab('custom')}>
                    <Text style={styles.linkText}>Review All Briefs →</Text>
                  </Pressable>
                </View>

                <View style={styles.briefPreviewCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <Ionicons name="sparkles" size={14} color={colors.goldDeep} />
                    <Text style={styles.briefClient}>Customer Brief: Personalized Wedding Sunflower Bouquet</Text>
                  </View>
                  <Text style={styles.briefDesc}>
                    “We would love 7 pastel crochet stems with customized wooden tags inscribed with our wedding date.”
                  </Text>
                  <View style={styles.briefFooter}>
                    <Text style={styles.briefBudget}>Budget: ₹1,500 - ₹2,000</Text>
                    <View style={styles.briefActions}>
                      <Pressable style={styles.acceptBriefBtn}>
                        <Text style={styles.acceptBriefText}>Accept & Send Quote</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Tab Content: PRODUCTS */}
          {activeTab === 'products' && (
            <View style={styles.tabContentBlock}>
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Your Active Marketplace Creations</Text>
                  <Pressable
                    onPress={() => navigation.navigate('AddProduct')}
                    style={styles.addProductBtnSmall}
                  >
                    <Ionicons name="add" size={16} color="#FFFFFF" />
                    <Text style={styles.addProductBtnSmallText}>List Creation</Text>
                  </Pressable>
                </View>

                <View style={styles.productsTable}>
                  {products.map((p) => (
                    <View key={p.id} style={styles.productTableRow}>
                      <Image source={{ uri: p.images[0] }} style={styles.tableThumb} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.tableTitle}>{p.name}</Text>
                        <Text style={styles.tableCat}>{p.category} • In Stock: {p.stock} units</Text>
                      </View>
                      <Text style={styles.tablePrice}>₹{p.price}</Text>
                      <Pressable
                        onPress={() => navigation.navigate('ProductDetail', { productId: p.id })}
                        style={styles.previewBtn}
                      >
                        <Text style={styles.previewBtnText}>View</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Tab Content: ORDERS */}
          {activeTab === 'orders' && (
            <View style={styles.tabContentBlock}>
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>Order Fulfillment Queue</Text>
                    <Text style={styles.sectionSub}>Manage handmade production, packaging, courier dispatch, and delivery:</Text>
                  </View>
                </View>

                <View style={styles.ordersQueueList}>
                  {orders.map((ord) => (
                    <View key={ord.id} style={styles.queueCard}>
                      <View style={styles.queueCardTop}>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <Text style={styles.queueOrderTitle}>Order #{ord.orderNumber || ord.id}</Text>
                            <View
                              style={[
                                styles.paymentBadge,
                                ord.paymentStatus === 'Paid'
                                  ? styles.paymentBadgePaid
                                  : ord.paymentStatus === 'Refunded'
                                  ? styles.paymentBadgeRefunded
                                  : styles.paymentBadgePending,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.paymentBadgeText,
                                  ord.paymentStatus === 'Paid'
                                    ? styles.paymentBadgeTextPaid
                                    : ord.paymentStatus === 'Refunded'
                                    ? styles.paymentBadgeTextRefunded
                                    : styles.paymentBadgeTextPending,
                                ]}
                              >
                                {ord.paymentStatus === 'Paid'
                                  ? 'PAID'
                                  : ord.paymentStatus === 'Refunded'
                                  ? 'REFUNDED'
                                  : 'PAYMENT PENDING'}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.queueCust}>
                            Recipient: {ord.deliveryAddress.name} • {ord.deliveryAddress.locality}, {ord.deliveryAddress.city} ({ord.deliveryAddress.pincode})
                          </Text>
                          <Text style={styles.queueDate}>Placed: {(ord as any).createdAt || ord.date}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.queuePrice}>₹{ord.totalAmount.toLocaleString()}</Text>
                          <Text style={styles.paymentMethodLabel}>
                            {ord.paymentMethod?.toUpperCase()} • {ord.deliveryType === 'express' ? 'Express Courier' : 'Standard Delivery'}
                          </Text>
                        </View>
                      </View>

                      {/* Items Preview */}
                      <View style={styles.queueItemsList}>
                        {ord.items.map((item, idx) => (
                          <View key={idx} style={styles.queueItemRow}>
                            <Image source={{ uri: item.product.images[0] }} style={styles.queueItemThumb} />
                            <View style={{ flex: 1 }}>
                              <Text style={styles.queueItemName}>{item.product.name}</Text>
                              <Text style={styles.queueItemMeta}>
                                Qty: {item.quantity} • ₹{item.product.price} each
                                {item.customization?.message ? ` • Note: "${item.customization.message}"` : ''}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>

                      {/* Shipping Info if Available */}
                      {ord.trackingNumber && (
                        <View style={styles.trackingInfoBox}>
                          <Ionicons name="airplane-outline" size={16} color={colors.goldDeep} />
                          <Text style={styles.trackingInfoText}>
                            Dispatched via <Text style={{ fontFamily: fonts.sans.bold }}>{ord.courierPartner || 'Artisan Priority Courier'}</Text> • AWB Tracking #{ord.trackingNumber}
                          </Text>
                        </View>
                      )}

                      <View style={styles.queueActionsRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.queueStatusLabel}>Current State:</Text>
                          <View style={styles.currentStatusPill}>
                            <Text style={styles.currentStatusPillText}>{ord.status}</Text>
                          </View>
                        </View>

                        <View style={styles.queueStatusBtns}>
                          {ord.status === 'Processing' && (
                            <Pressable
                              onPress={() => updateOrderStatus(ord.id, 'In Studio')}
                              style={styles.markStudioBtn}
                            >
                              <Text style={styles.markStudioText}>Move to Studio</Text>
                            </Pressable>
                          )}
                          {(ord.status === 'Processing' || ord.status === 'In Studio') && (
                            <Pressable
                              onPress={() => updateOrderStatus(ord.id, 'Ready to Ship')}
                              style={styles.markReadyBtn}
                            >
                              <Text style={styles.markReadyText}>Mark Ready to Ship</Text>
                            </Pressable>
                          )}
                          {ord.status === 'Ready to Ship' && (
                            <Pressable
                              onPress={() => openDispatchDialog(ord.id)}
                              style={styles.markShippedBtn}
                            >
                              <Ionicons name="paper-plane-outline" size={13} color="#FFFFFF" />
                              <Text style={styles.markShippedText}>Dispatch Courier</Text>
                            </Pressable>
                          )}
                          {ord.status === 'Shipped' && (
                            <Pressable
                              onPress={() => updateOrderStatus(ord.id, 'Delivered')}
                              style={styles.markDeliveredBtn}
                            >
                              <Ionicons name="checkmark-done" size={13} color="#FFFFFF" />
                              <Text style={styles.markDeliveredText}>Confirm Delivered</Text>
                            </Pressable>
                          )}
                          {ord.status === 'Delivered' && (
                            <View style={styles.deliveredCompleteBadge}>
                              <Ionicons name="checkmark-circle" size={14} color={colors.ecoGreen} />
                              <Text style={styles.deliveredCompleteText}>Delivered (Settlement Unlocked)</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Tab Content: EARNINGS & PAYOUTS */}
          {activeTab === 'earnings' && (
            <View style={styles.tabContentBlock}>
              {/* Notification Banner */}
              {settleResultMsg && (
                <View style={styles.settleSuccessBanner}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.ecoGreen} />
                  <Text style={styles.settleSuccessText}>{settleResultMsg}</Text>
                  <Pressable onPress={() => setSettleResultMsg(null)}>
                    <Ionicons name="close" size={18} color={colors.charcoal} />
                  </Pressable>
                </View>
              )}

              {/* Financial Metrics Summary */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>Artisan Financial Overview</Text>
                    <Text style={styles.sectionSub}>
                      Itemized breakdown of your marketplace revenue, platform fees, taxes, and bank settlements:
                    </Text>
                  </View>
                </View>

                <View style={styles.financialMetricsGrid}>
                  <View style={styles.financialTile}>
                    <Text style={styles.financialTileLabel}>Gross Order Value</Text>
                    <Text style={styles.financialTileVal}>₹{financials.grossOrderValue?.toLocaleString()}</Text>
                    <Text style={styles.financialTileSub}>{financials.totalSalesCount || orders.length} total customer orders</Text>
                  </View>

                  <View style={styles.financialTile}>
                    <Text style={styles.financialTileLabel}>Platform Commission</Text>
                    <Text style={[styles.financialTileVal, { color: colors.terracotta }]}>
                      -₹{financials.platformCommission?.toLocaleString()}
                    </Text>
                    <Text style={styles.financialTileSub}>Category commission rules</Text>
                  </View>

                  <View style={styles.financialTile}>
                    <Text style={styles.financialTileLabel}>Gateway & Handling (2%)</Text>
                    <Text style={[styles.financialTileVal, { color: colors.textSecondary }]}>
                      -₹{financials.gatewayFees?.toLocaleString()}
                    </Text>
                    <Text style={styles.financialTileSub}>Online PG processing fees</Text>
                  </View>

                  <View style={[styles.financialTile, { backgroundColor: '#F9F6F0', borderColor: colors.goldDim }]}>
                    <Text style={[styles.financialTileLabel, { color: colors.charcoal }]}>Net Artisan Realized</Text>
                    <Text style={[styles.financialTileVal, { color: colors.goldDeep }]}>
                      ₹{financials.totalNetEarnings?.toLocaleString()}
                    </Text>
                    <Text style={styles.financialTileSub}>Total accrued earnings</Text>
                  </View>

                  <View style={[styles.financialTile, { backgroundColor: '#F0F9F4', borderColor: '#C8E6D3' }]}>
                    <Text style={[styles.financialTileLabel, { color: colors.ecoGreen }]}>Paid Out to Bank</Text>
                    <Text style={[styles.financialTileVal, { color: colors.ecoGreen }]}>
                      ₹{financials.paidOutEarnings?.toLocaleString()}
                    </Text>
                    <Text style={styles.financialTileSub}>Settled via NEFT/IMPS</Text>
                  </View>

                  <View style={[styles.financialTile, { backgroundColor: '#FFFBF0', borderColor: colors.goldBright }]}>
                    <Text style={[styles.financialTileLabel, { color: colors.goldDeep }]}>Available for Payout</Text>
                    <Text style={[styles.financialTileVal, { color: colors.charcoal }]}>
                      ₹{financials.availableBalance?.toLocaleString()}
                    </Text>
                    <Text style={styles.financialTileSub}>Delivered & verified orders</Text>
                  </View>

                  <View style={styles.financialTile}>
                    <Text style={styles.financialTileLabel}>Pending Delivery Escrow</Text>
                    <Text style={[styles.financialTileVal, { color: colors.textSecondary }]}>
                      ₹{financials.pendingSettlement?.toLocaleString()}
                    </Text>
                    <Text style={styles.financialTileSub}>Unlocks upon delivery</Text>
                  </View>
                </View>
              </View>

              {/* Linked Bank Account & Payout Action */}
              <View style={styles.sectionCard}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>Bank Account & Automated Settlement</Text>
                    <Text style={styles.sectionSub}>
                      Your verified linked account for marketplace earnings payouts:
                    </Text>
                  </View>
                  <Pressable onPress={() => setShowBankModal(true)} style={styles.updateBankBtn}>
                    <Ionicons name="create-outline" size={15} color={colors.goldDeep} />
                    <Text style={styles.updateBankBtnText}>Update Bank Account</Text>
                  </Pressable>
                </View>

                <View style={styles.bankCardWrapper}>
                  <View style={styles.bankCardInner}>
                    <View style={styles.bankHeaderRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={styles.bankIconCircle}>
                          <Ionicons name="business" size={20} color={colors.goldDeep} />
                        </View>
                        <View>
                          <Text style={styles.bankNameText}>{payoutAccount.bankName}</Text>
                          <Text style={styles.bankHolderText}>Account Holder: {payoutAccount.accountHolderName}</Text>
                        </View>
                      </View>
                      <View style={styles.verifiedKycBadge}>
                        <Ionicons name="shield-checkmark" size={13} color={colors.ecoGreen} />
                        <Text style={styles.verifiedKycText}>RBI KYC VERIFIED</Text>
                      </View>
                    </View>

                    <View style={styles.bankDetailsGrid}>
                      <View>
                        <Text style={styles.bankFieldLabel}>Account Number</Text>
                        <Text style={styles.bankFieldVal}>{payoutAccount.accountNumberMasked}</Text>
                      </View>
                      <View>
                        <Text style={styles.bankFieldLabel}>IFSC Code</Text>
                        <Text style={styles.bankFieldVal}>{payoutAccount.ifscCode}</Text>
                      </View>
                      <View>
                        <Text style={styles.bankFieldLabel}>Linked UPI ID</Text>
                        <Text style={styles.bankFieldVal}>{payoutAccount.upiVpa || 'None'}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.payoutActionSection}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.payoutActionHeading}>
                        Available Balance: ₹{financials.availableBalance?.toLocaleString()}
                      </Text>
                      <Text style={styles.payoutActionSub}>
                        {financials.availableBalance > 0
                          ? 'Earnings from all delivered orders are eligible for immediate transfer.'
                          : 'No un-settled balance available right now. Orders unlock upon customer delivery confirmation.'}
                      </Text>
                    </View>

                    <Pressable
                      onPress={handleRequestPayout}
                      disabled={financials.availableBalance <= 0 || isSettling}
                      style={[
                        styles.requestPayoutBtn,
                        (financials.availableBalance <= 0 || isSettling) && styles.requestPayoutBtnDisabled,
                      ]}
                    >
                      {isSettling ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <Ionicons name="wallet-outline" size={16} color="#FFFFFF" />
                          <Text style={styles.requestPayoutBtnText}>
                            {financials.availableBalance > 0
                              ? `Transfer ₹${financials.availableBalance?.toLocaleString()} to Bank`
                              : 'No Balance to Payout'}
                          </Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                </View>
              </View>

              {/* Order-wise Commission Breakdown */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Order-wise Commission & Earnings Ledger</Text>
                <Text style={styles.sectionSub}>
                  Commission rate applied per order, delivery fee pass-through, and net artisan settlement:
                </Text>

                <View style={styles.commissionTable}>
                  <View style={styles.tableHeaderRow}>
                    <Text style={[styles.colHeader, { flex: 1.2 }]}>Order Details</Text>
                    <Text style={[styles.colHeader, { flex: 1 }]}>Customer</Text>
                    <Text style={[styles.colHeader, { flex: 1, textAlign: 'right' }]}>Order Value</Text>
                    <Text style={[styles.colHeader, { flex: 1, textAlign: 'right' }]}>Commission</Text>
                    <Text style={[styles.colHeader, { flex: 1, textAlign: 'right' }]}>Net Payout</Text>
                    <Text style={[styles.colHeader, { flex: 1, textAlign: 'center' }]}>Settlement</Text>
                  </View>

                  {(sellerOrdersWithComm.length > 0 ? sellerOrdersWithComm : orders).map((ord) => {
                    const gross = ord.totalAmount || 0;
                    const commPct = 10;
                    const comm = ord.platformCommission || Math.round(gross * 0.1);
                    const net = ord.sellerNetEarnings || (gross - comm);
                    const isSettled = ord.status === 'Delivered';

                    return (
                      <View key={ord.id} style={styles.commissionTableRow}>
                        <View style={{ flex: 1.2 }}>
                          <Text style={styles.rowOrderNum}>#{ord.orderNumber || ord.id}</Text>
                          <Text style={styles.rowOrderMeta}>
                            {ord.items?.[0]?.product?.category || 'Handmade'} • {(ord as any).createdAt || ord.date}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.rowCustomerName}>{ord.deliveryAddress?.name}</Text>
                          <Text style={styles.rowCustomerCity}>{ord.deliveryAddress?.city || 'Pune'}</Text>
                        </View>
                        <Text style={[styles.rowCellVal, { flex: 1, textAlign: 'right' }]}>
                          ₹{gross.toLocaleString()}
                        </Text>
                        <Text style={[styles.rowCellComm, { flex: 1, textAlign: 'right' }]}>
                          -₹{comm.toLocaleString()} ({commPct}%)
                        </Text>
                        <Text style={[styles.rowCellNet, { flex: 1, textAlign: 'right' }]}>
                          ₹{net.toLocaleString()}
                        </Text>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                          <View
                            style={[
                              styles.settlementBadge,
                              isSettled ? styles.settlementBadgeDone : styles.settlementBadgePending,
                            ]}
                          >
                            <Text
                              style={[
                                styles.settlementBadgeText,
                                isSettled ? styles.settlementBadgeTextDone : styles.settlementBadgeTextPending,
                              ]}
                            >
                              {isSettled ? 'Settled' : 'Pending'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Settlement History Log */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Settlement Payout History</Text>
                <Text style={styles.sectionSub}>Official banking transactions settled to your linked account:</Text>

                <View style={styles.settlementsList}>
                  {settlements.map((setRecord) => (
                    <View key={setRecord.id || setRecord.settlementReference} style={styles.settlementCard}>
                      <View style={styles.settlementCardLeft}>
                        <View style={styles.settleIcon}>
                          <Ionicons name="checkmark-circle" size={24} color={colors.ecoGreen} />
                        </View>
                        <View>
                          <Text style={styles.settleRefText}>{setRecord.settlementReference}</Text>
                          <Text style={styles.settleSubText}>
                            Bank UTR: <Text style={{ fontFamily: fonts.sans.bold }}>{setRecord.utrNumber}</Text> • {setRecord.bankName} ({setRecord.bankAccountMasked})
                          </Text>
                          <Text style={styles.settleDateText}>Processed on: {setRecord.processedAt}</Text>
                        </View>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.settleAmountText}>+₹{setRecord.amount.toLocaleString()}</Text>
                        <View style={styles.settleCompletedBadge}>
                          <Text style={styles.settleCompletedBadgeText}>COMPLETED</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Tab Content: CUSTOM */}
          {activeTab === 'custom' && (
            <View style={styles.tabContentBlock}>
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Bespoke Customer Briefs</Text>
                <Text style={styles.sectionSub}>Custom requests received from “Find My Maker” and product customizations:</Text>

                <View style={styles.briefsList}>
                  <View style={styles.fullBriefCard}>
                    <View style={styles.briefTopRow}>
                      <Text style={styles.briefSubject}>Custom Wooden & Resin House Nameplate</Text>
                      <View style={styles.urgentBadge}>
                        <Text style={styles.urgentBadgeText}>New Request</Text>
                      </View>
                    </View>
                    <Text style={styles.briefClientName}>From: Priya Kulkarni (Viman Nagar, Pune)</Text>
                    <Text style={styles.briefText}>
                      “Looking for a 16x8 inch live-edge teak wood nameplate with deep emerald resin pour and gold calligraphy for family surname ‘Kulkarni’. Delivery needed by next weekend.”
                    </Text>
                    <View style={styles.briefPricingRow}>
                      <Text style={styles.briefBudgetTag}>Client Budget: ₹2,000 - ₹2,500</Text>
                      <Pressable style={styles.acceptBriefBtn}>
                        <Text style={styles.acceptBriefText}>Accept Request & Quote</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Tab Content: MESSAGES */}
          {activeTab === 'messages' && (
            <View style={styles.tabContentBlock}>
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Direct Customer Conversations</Text>
                <View style={styles.msgList}>
                  <View style={styles.msgItem}>
                    <View style={styles.msgAvatar}>
                      <Text style={styles.msgAvatarText}>S</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.msgHeader}>
                        <Text style={styles.msgName}>Sanket Joshi</Text>
                        <Text style={styles.msgTime}>10:30 AM</Text>
                      </View>
                      <Text style={styles.msgPreview}>
                        “Hi Ananya, will the sunflower pot fit a standard 4-inch study desk corner?”
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.msgItem, { borderTopWidth: 1, borderTopColor: colors.cardBorderSubtle }]}>
                    <View style={[styles.msgAvatar, { backgroundColor: colors.goldDeep }]}>
                      <Text style={styles.msgAvatarText}>P</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.msgHeader}>
                        <Text style={styles.msgName}>Priya Kulkarni</Text>
                        <Text style={styles.msgTime}>Yesterday</Text>
                      </View>
                      <Text style={styles.msgPreview}>
                        “Thank you so much! The custom wedding nameplate arrived beautifully packaged!”
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Courier Dispatch Modal */}
      <Modal visible={showDispatchModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dispatch Courier</Text>
              <Pressable onPress={() => setShowDispatchModal(false)}>
                <Ionicons name="close" size={20} color={colors.charcoal} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>
                Enter the courier service partner and package consignment AWB tracking number:
              </Text>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Courier Partner</Text>
                <TextInput
                  value={dispatchCourier}
                  onChangeText={setDispatchCourier}
                  style={styles.inputField}
                  placeholder="e.g. Delhivery, Blue Dart, Speed Post"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>AWB Tracking Number</Text>
                <TextInput
                  value={dispatchTracking}
                  onChangeText={setDispatchTracking}
                  style={styles.inputField}
                  placeholder="e.g. DEL-PUN-849201"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.modalActions}>
                <Pressable onPress={() => setShowDispatchModal(false)} style={styles.modalCancelBtn}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>
                <Pressable onPress={handleConfirmDispatch} style={styles.modalSaveBtn}>
                  <Text style={styles.modalSaveText}>Confirm & Mark Shipped</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bank Account Onboarding / Edit Modal */}
      <Modal visible={showBankModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Artisan Payout Bank Account</Text>
                <Text style={styles.modalSubtitle}>Direct bank transfer for your marketplace earnings</Text>
              </View>
              <Pressable onPress={() => setShowBankModal(false)}>
                <Ionicons name="close" size={20} color={colors.charcoal} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              {bankError ? (
                <View style={styles.errorBanner}>
                  <Ionicons name="alert-circle" size={16} color={colors.danger} />
                  <Text style={styles.errorBannerText}>{bankError}</Text>
                </View>
              ) : null}

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Account Holder Name (as per Bank / PAN)</Text>
                <TextInput
                  value={bankHolder}
                  onChangeText={setBankHolder}
                  style={styles.inputField}
                  placeholder="e.g. Sanket Joshi"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Bank Account Number</Text>
                <TextInput
                  value={bankAccNum}
                  onChangeText={setBankAccNum}
                  style={styles.inputField}
                  placeholder="Enter full 9-18 digit account number"
                  keyboardType="numeric"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>IFSC Code (11 characters)</Text>
                <TextInput
                  value={bankIfsc}
                  onChangeText={(val) => setBankIfsc(val.toUpperCase())}
                  style={styles.inputField}
                  placeholder="e.g. ICIC0000341"
                  autoCapitalize="characters"
                  maxLength={11}
                  placeholderTextColor={colors.textMuted}
                />
                <Text style={styles.inputHelpText}>Format: 4 letters, 0, then 6 alphanumeric characters</Text>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Bank Name & Branch</Text>
                <TextInput
                  value={bankName}
                  onChangeText={setBankName}
                  style={styles.inputField}
                  placeholder="e.g. ICICI Bank, Deccan Gymkhana Pune"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.inputLabel}>Linked UPI ID / VPA (Optional)</Text>
                <TextInput
                  value={bankUpi}
                  onChangeText={setBankUpi}
                  style={styles.inputField}
                  placeholder="e.g. sanket@okicici"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.modalActions}>
                <Pressable onPress={() => setShowBankModal(false)} style={styles.modalCancelBtn}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSaveBank}
                  disabled={savingBank}
                  style={[styles.modalSaveBtn, savingBank && { opacity: 0.6 }]}
                >
                  {savingBank ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSaveText}>Verify & Save Account</Text>
                  )}
                </Pressable>
              </View>
            </View>
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
  topHeader: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    ...shadow.soft,
    zIndex: 10,
  },
  headerInner: {
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadgeText: {
    fontFamily: fonts.sans.bold,
    fontSize: 16,
    color: colors.goldBright,
  },
  brandTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 17,
    letterSpacing: 1.5,
    color: colors.charcoal,
  },
  hubSubtitle: {
    fontFamily: fonts.sans.medium,
    fontSize: 11,
    color: colors.goldDeep,
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  switchModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.marketplaceBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: radius.full,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  switchModeText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.charcoal,
  },
  addProductBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.charcoal,
    paddingHorizontal: 16,
    height: 38,
    borderRadius: radius.full,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  addProductBtnText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    color: '#FFFFFF',
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
    paddingTop: 20,
  },
  welcomeBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    marginBottom: 20,
    ...shadow.soft,
  },
  welcomeTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 24,
    color: colors.charcoal,
  },
  welcomeSub: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statTile: {
    flex: 1,
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    gap: 6,
    ...shadow.soft,
  },
  statIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF8E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontFamily: fonts.sans.bold,
    fontSize: 22,
    color: colors.charcoal,
  },
  statLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: 11.5,
    color: colors.textMuted,
  },
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  tabBtnActive: {
    backgroundColor: colors.charcoal,
    borderColor: colors.charcoal,
  },
  tabBtnText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontFamily: fonts.sans.semibold,
  },
  tabContentBlock: {
    gap: 20,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 24,
    ...shadow.soft,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 18,
    color: colors.charcoal,
  },
  sectionSub: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  linkText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    color: colors.goldDeep,
  },
  recentOrderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorderSubtle,
  },
  orderThumb: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
  },
  orderProdTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 14.5,
    color: colors.charcoal,
  },
  orderMeta: {
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  orderStatusPill: {
    backgroundColor: '#FFF8E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.goldDim,
  },
  orderStatusText: {
    fontFamily: fonts.sans.medium,
    fontSize: 11.5,
    color: colors.goldDeep,
  },
  briefPreviewCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.goldDim,
    padding: 16,
  },
  briefClient: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13.5,
    color: colors.charcoal,
  },
  briefDesc: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  briefFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 163, 89, 0.20)',
  },
  briefBudget: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.goldDeep,
  },
  briefActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptBriefBtn: {
    backgroundColor: colors.charcoal,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  acceptBriefText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  addProductBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.charcoal,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  addProductBtnSmallText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  productsTable: {
    gap: 12,
  },
  productTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorderSubtle,
  },
  tableThumb: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
  },
  tableTitle: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
    color: colors.charcoal,
  },
  tableCat: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  tablePrice: {
    fontFamily: fonts.sans.bold,
    fontSize: 15,
    color: colors.charcoal,
  },
  previewBtn: {
    backgroundColor: colors.marketplaceBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  previewBtnText: {
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    color: colors.charcoal,
  },
  ordersQueueList: {
    gap: 14,
  },
  queueCard: {
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
  },
  queueCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  queueOrderTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 15,
    color: colors.charcoal,
  },
  queueCust: {
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  queuePrice: {
    fontFamily: fonts.sans.bold,
    fontSize: 16,
    color: colors.charcoal,
  },
  queueActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
  },
  queueStatusLabel: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  queueStatusBtns: {
    flexDirection: 'row',
    gap: 8,
  },
  markReadyBtn: {
    backgroundColor: colors.goldDeep,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  markReadyText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  markShippedBtn: {
    backgroundColor: '#2E5B82',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  markShippedText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  markDeliveredBtn: {
    backgroundColor: colors.ecoGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  markDeliveredText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  briefsList: {
    gap: 14,
  },
  fullBriefCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.goldDim,
    padding: 18,
  },
  briefTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  briefSubject: {
    fontFamily: fonts.serif.bold,
    fontSize: 16,
    color: colors.charcoal,
  },
  urgentBadge: {
    backgroundColor: colors.terracotta,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  urgentBadgeText: {
    fontFamily: fonts.sans.bold,
    fontSize: 10,
    color: '#FFFFFF',
  },
  briefClientName: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.goldDeep,
    marginBottom: 8,
  },
  briefText: {
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  briefPricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 163, 89, 0.20)',
  },
  briefBudgetTag: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    color: colors.charcoal,
  },
  msgList: {
    marginTop: 8,
  },
  msgItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  msgAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgAvatarText: {
    fontFamily: fonts.sans.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
  msgHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  msgName: {
    fontFamily: fonts.sans.bold,
    fontSize: 14,
    color: colors.charcoal,
  },
  msgTime: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    color: colors.textMuted,
  },
  msgPreview: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  restrictedCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    maxWidth: 480,
    alignSelf: 'center',
  },
  restrictedIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1E140E',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(220, 175, 95, 0.40)',
    ...shadow.medium,
  },
  restrictedTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 10,
  },
  restrictedDesc: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  restrictedPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.gold,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: radius.md,
    marginBottom: 14,
    ...shadow.soft,
  },
  restrictedPrimaryBtnText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
    color: colors.charcoal,
  },
  restrictedSecondaryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  restrictedSecondaryBtnText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13.5,
    color: colors.textSecondary,
  },
  adminPortalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E140E',
    borderWidth: 1,
    borderColor: colors.goldDim,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: radius.full,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  adminPortalText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 12.5,
    color: colors.goldBright,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  paymentBadgePaid: {
    backgroundColor: '#F0F9F4',
    borderColor: '#C8E6D3',
  },
  paymentBadgeRefunded: {
    backgroundColor: '#FDF2F2',
    borderColor: '#F8B4B4',
  },
  paymentBadgePending: {
    backgroundColor: '#FFF8E8',
    borderColor: colors.goldDim,
  },
  paymentBadgeText: {
    fontFamily: fonts.sans.bold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  paymentBadgeTextPaid: {
    color: colors.ecoGreen,
  },
  paymentBadgeTextRefunded: {
    color: colors.danger,
  },
  paymentBadgeTextPending: {
    color: colors.goldDeep,
  },
  queueDate: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  paymentMethodLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  queueItemsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorderSubtle,
    padding: 10,
    gap: 8,
    marginBottom: 10,
  },
  queueItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  queueItemThumb: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
  },
  queueItemName: {
    fontFamily: fonts.serif.bold,
    fontSize: 13,
    color: colors.charcoal,
  },
  queueItemMeta: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  trackingInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFBF0',
    borderWidth: 1,
    borderColor: colors.goldDim,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    marginBottom: 10,
  },
  trackingInfoText: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.charcoal,
    flex: 1,
  },
  currentStatusPill: {
    backgroundColor: '#FFF8E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.goldDim,
  },
  currentStatusPillText: {
    fontFamily: fonts.sans.bold,
    fontSize: 11.5,
    color: colors.goldDeep,
  },
  markStudioBtn: {
    backgroundColor: '#372317',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  markStudioText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  deliveredCompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9F4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#C8E6D3',
  },
  deliveredCompleteText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 11.5,
    color: colors.ecoGreen,
  },
  settleSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9F4',
    borderWidth: 1,
    borderColor: '#C8E6D3',
    padding: 14,
    borderRadius: radius.lg,
    gap: 10,
  },
  settleSuccessText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.ecoGreen,
    flex: 1,
  },
  financialMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  financialTile: {
    flex: 1,
    minWidth: 160,
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    gap: 4,
  },
  financialTileLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  financialTileVal: {
    fontFamily: fonts.sans.bold,
    fontSize: 22,
    color: colors.charcoal,
  },
  financialTileSub: {
    fontFamily: fonts.sans.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  updateBankBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.goldDim,
    backgroundColor: '#FFFBF0',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  updateBankBtnText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    color: colors.goldDeep,
  },
  bankCardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  bankCardInner: {
    padding: 18,
    backgroundColor: '#FFFDF9',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorderSubtle,
    gap: 14,
  },
  bankHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bankIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF8E8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.goldDim,
  },
  bankNameText: {
    fontFamily: fonts.serif.bold,
    fontSize: 15,
    color: colors.charcoal,
  },
  bankHolderText: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  verifiedKycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F9F4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#C8E6D3',
  },
  verifiedKycText: {
    fontFamily: fonts.sans.bold,
    fontSize: 10,
    color: colors.ecoGreen,
  },
  bankDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  bankFieldLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: 11,
    color: colors.textMuted,
  },
  bankFieldVal: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    color: colors.charcoal,
    marginTop: 2,
  },
  payoutActionSection: {
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
    backgroundColor: '#FFFFFF',
  },
  payoutActionHeading: {
    fontFamily: fonts.serif.bold,
    fontSize: 16,
    color: colors.charcoal,
  },
  payoutActionSub: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    maxWidth: 480,
  },
  requestPayoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.charcoal,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.md,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  requestPayoutBtnDisabled: {
    opacity: 0.5,
  },
  requestPayoutBtnText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  commissionTable: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F5EFE6',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  colHeader: {
    fontFamily: fonts.sans.bold,
    fontSize: 11.5,
    color: colors.charcoal,
    letterSpacing: 0.5,
  },
  commissionTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorderSubtle,
    backgroundColor: '#FFFFFF',
  },
  rowOrderNum: {
    fontFamily: fonts.sans.bold,
    fontSize: 13,
    color: colors.charcoal,
  },
  rowOrderMeta: {
    fontFamily: fonts.sans.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  rowCustomerName: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.charcoal,
  },
  rowCustomerCity: {
    fontFamily: fonts.sans.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  rowCellVal: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.charcoal,
  },
  rowCellComm: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.terracotta,
  },
  rowCellNet: {
    fontFamily: fonts.sans.bold,
    fontSize: 12.5,
    color: colors.ecoGreen,
  },
  settlementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  settlementBadgeDone: {
    backgroundColor: '#F0F9F4',
    borderColor: '#C8E6D3',
  },
  settlementBadgePending: {
    backgroundColor: '#FFF8E8',
    borderColor: colors.goldDim,
  },
  settlementBadgeText: {
    fontFamily: fonts.sans.bold,
    fontSize: 10,
  },
  settlementBadgeTextDone: {
    color: colors.ecoGreen,
  },
  settlementBadgeTextPending: {
    color: colors.goldDeep,
  },
  settlementsList: {
    gap: 12,
  },
  settlementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    gap: 12,
  },
  settlementCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settleIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0F9F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settleRefText: {
    fontFamily: fonts.sans.bold,
    fontSize: 13,
    color: colors.charcoal,
  },
  settleSubText: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  settleDateText: {
    fontFamily: fonts.sans.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  settleAmountText: {
    fontFamily: fonts.sans.bold,
    fontSize: 16,
    color: colors.ecoGreen,
  },
  settleCompletedBadge: {
    backgroundColor: '#F0F9F4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  settleCompletedBadgeText: {
    fontFamily: fonts.sans.bold,
    fontSize: 9.5,
    color: colors.ecoGreen,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 22, 19, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...shadow.medium,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: '#FFFDF9',
  },
  modalTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 17,
    color: colors.charcoal,
  },
  modalSubtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalBody: {
    padding: 20,
    gap: 14,
  },
  formGroup: {
    gap: 4,
  },
  inputLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    color: colors.charcoal,
  },
  inputField: {
    height: 42,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    color: colors.charcoal,
    backgroundColor: '#FFFFFF',
  },
  inputHelpText: {
    fontFamily: fonts.sans.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  modalCancelText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  modalSaveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.charcoal,
    minWidth: 140,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  modalSaveText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDF2F2',
    borderWidth: 1,
    borderColor: '#F8B4B4',
    padding: 10,
    borderRadius: radius.md,
  },
  errorBannerText: {
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    color: colors.danger,
    flex: 1,
  },
});