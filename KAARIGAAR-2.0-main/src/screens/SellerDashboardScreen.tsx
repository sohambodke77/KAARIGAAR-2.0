import { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadow } from '../theme';

type CreatorTab = 'overview' | 'products' | 'orders' | 'custom' | 'messages';

export function SellerDashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { switchRole } = useAuth();
  const { products, orders, customBriefs, updateOrderStatus } = useMarketplace();

  const [activeTab, setActiveTab] = useState<CreatorTab>('overview');

  // Stats
  const activeProductsCount = products.length;
  const pendingRequestsCount = customBriefs.length || 3;
  const totalOrdersCount = orders.length;
  const totalEarnings = orders.reduce((sum, o) => sum + o.totalAmount, 0) + 12450;

  const handleSwitchToCustomer = async () => {
    await switchRole('customer');
    navigation.navigate('CustomerHome');
  };

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
              onPress={handleSwitchToCustomer}
              style={styles.switchModeBtn}
              accessibilityRole="button"
            >
              <Ionicons name="bag-handle-outline" size={15} color={colors.charcoal} />
              <Text style={styles.switchModeText}>Customer Mode</Text>
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
                <Text style={styles.sectionTitle}>Order Fulfillment Queue</Text>
                <Text style={styles.sectionSub}>Update the status as you craft, finish, and package orders:</Text>

                <View style={styles.ordersQueueList}>
                  {orders.map((ord) => (
                    <View key={ord.id} style={styles.queueCard}>
                      <View style={styles.queueCardTop}>
                        <View>
                          <Text style={styles.queueOrderTitle}>Order #{ord.id}</Text>
                          <Text style={styles.queueCust}>
                            Recipient: {ord.deliveryAddress.name} ({ord.deliveryAddress.locality})
                          </Text>
                        </View>
                        <Text style={styles.queuePrice}>₹{ord.totalAmount}</Text>
                      </View>

                      <View style={styles.queueActionsRow}>
                        <Text style={styles.queueStatusLabel}>Current: <Text style={{ fontFamily: fonts.sans.bold }}>{ord.status}</Text></Text>
                        <View style={styles.queueStatusBtns}>
                          {ord.status === 'Processing' && (
                            <Pressable
                              onPress={() => updateOrderStatus(ord.id, 'Ready to Ship')}
                              style={styles.markReadyBtn}
                            >
                              <Text style={styles.markReadyText}>Mark Ready to Ship</Text>
                            </Pressable>
                          )}
                          {ord.status === 'Ready to Ship' && (
                            <Pressable
                              onPress={() => updateOrderStatus(ord.id, 'Shipped')}
                              style={styles.markShippedBtn}
                            >
                              <Text style={styles.markShippedText}>Dispatch / Ship</Text>
                            </Pressable>
                          )}
                          {ord.status === 'Shipped' && (
                            <Pressable
                              onPress={() => updateOrderStatus(ord.id, 'Delivered')}
                              style={styles.markDeliveredBtn}
                            >
                              <Text style={styles.markDeliveredText}>Confirm Delivered</Text>
                            </Pressable>
                          )}
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
});