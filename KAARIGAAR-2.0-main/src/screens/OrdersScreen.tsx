import { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton } from '../components/BackButton';
import { BottomNavigation } from '../components/BottomNavigation';
import { MarketplaceHeader } from '../components/MarketplaceHeader';
import { useMarketplace, type Order } from '../context/MarketplaceContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadow } from '../theme';

type OrderTab = 'All' | 'Processing' | 'Ready to Ship' | 'Shipped' | 'Delivered';

const TABS: OrderTab[] = ['All', 'Processing', 'Ready to Ship', 'Shipped', 'Delivered'];

export function OrdersScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { orders } = useMarketplace();

  const [activeTab, setActiveTab] = useState<OrderTab>('All');

  const filteredOrders =
    activeTab === 'All' ? orders : orders.filter((o) => o.status === activeTab);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered':
        return colors.ecoGreen;
      case 'Shipped':
        return '#2E5B82';
      case 'Ready to Ship':
        return colors.goldDeep;
      default:
        return colors.terracotta;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <MarketplaceHeader />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Back Row */}
          <View style={styles.backRow}>
            <BackButton label="Back to Marketplace" fallbackRoute="CustomerHome" />
          </View>

          <Text style={styles.title}>My Orders</Text>
          <Text style={styles.subtitle}>
            Track the status of your handcrafted creations from maker workshops to your doorstep.
          </Text>

          {/* Filter Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScroll}
          >
            {TABS.map((tab) => {
              const isSelected = activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[styles.tabChip, isSelected && styles.tabChipActive]}
                >
                  <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>{tab}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={42} color={colors.gold} />
              <Text style={styles.emptyTitle}>No orders in {activeTab}</Text>
              <Text style={styles.emptySubtitle}>
                When you support an artisan, your order status and workshop craft tracking will appear here.
              </Text>
              <Pressable
                onPress={() => navigation.navigate('CustomerHome')}
                style={styles.exploreBtn}
              >
                <Text style={styles.exploreBtnText}>Discover Handmade</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {filteredOrders.map((order) => {
                const firstItem = order.items[0];
                const statusColor = getStatusColor(order.status);

                return (
                  <View key={order.id} style={styles.orderCard}>
                    {/* Header */}
                    <View style={styles.orderCardHeader}>
                      <View>
                        <Text style={styles.orderIdText}>Order #{order.id}</Text>
                        <Text style={styles.orderDateText}>Placed on {order.date}</Text>
                      </View>

                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: `${statusColor}18`, borderColor: `${statusColor}44` },
                        ]}
                      >
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusText, { color: statusColor }]}>{order.status}</Text>
                      </View>
                    </View>

                    {/* Product Summary */}
                    {firstItem && (
                      <View style={styles.productRow}>
                        <Image
                          source={{ uri: firstItem.product.images[0] }}
                          style={styles.productThumb}
                        />
                        <View style={styles.productInfo}>
                          <Text style={styles.productName} numberOfLines={1}>
                            {firstItem.product.name}
                          </Text>
                          <Text style={styles.creatorName}>
                            Maker: {firstItem.product.creatorName} ({firstItem.product.creatorLocation})
                          </Text>
                          {order.items.length > 1 && (
                            <Text style={styles.moreItemsText}>
                              + {order.items.length - 1} more handcrafted items
                            </Text>
                          )}
                          <Text style={styles.trackingHint}>
                            📍 Est. delivery to {order.deliveryAddress.locality}, Pune: {order.estimatedDelivery}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Footer */}
                    <View style={styles.orderFooter}>
                      <View>
                        <Text style={styles.totalPriceLabel}>Total Amount</Text>
                        <Text style={styles.totalPriceVal}>₹{order.totalAmount}</Text>
                      </View>

                      <Pressable
                        onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
                        style={styles.trackBtn}
                        accessibilityRole="button"
                      >
                        <Text style={styles.trackBtnText}>Track Order</Text>
                        <Ionicons name="arrow-forward" size={14} color={colors.charcoal} />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

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
    maxWidth: 960,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backRow: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontFamily: fonts.serif.bold,
    fontSize: 28,
    color: colors.charcoal,
  },
  subtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  tabsScroll: {
    gap: 8,
    paddingBottom: 16,
    marginBottom: 12,
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  tabChipActive: {
    backgroundColor: colors.charcoal,
    borderColor: colors.charcoal,
  },
  tabText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  ordersList: {
    gap: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    ...shadow.soft,
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  orderIdText: {
    fontFamily: fonts.sans.bold,
    fontSize: 15,
    color: colors.charcoal,
  },
  orderDateText: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
  },
  productRow: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorderSubtle,
  },
  productThumb: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontFamily: fonts.serif.bold,
    fontSize: 15,
    color: colors.charcoal,
  },
  creatorName: {
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  moreItemsText: {
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    color: colors.goldDeep,
    marginTop: 2,
  },
  trackingHint: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
  },
  totalPriceLabel: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    color: colors.textMuted,
  },
  totalPriceVal: {
    fontFamily: fonts.sans.bold,
    fontSize: 18,
    color: colors.charcoal,
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.marketplaceBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: radius.full,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  trackBtnText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    color: colors.charcoal,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 40,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadow.soft,
  },
  emptyTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 20,
    color: colors.charcoal,
  },
  emptySubtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 360,
  },
  exploreBtn: {
    backgroundColor: colors.charcoal,
    paddingHorizontal: 20,
    height: 42,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  exploreBtnText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
});
