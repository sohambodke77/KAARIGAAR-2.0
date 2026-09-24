import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { Order } from '../context/MarketContext';
import { useMarket } from '../context/MarketContext';
import { OrderRow } from '../components/OrderRow';
import { EmptyState } from '../components/EmptyState';
import { fonts, light } from '../theme';
import type { CustomerStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;

const TABS: (Order['status'] | 'All')[] = ['All', 'Processing', 'Ready to Ship', 'Shipped', 'Delivered'];

export function OrdersScreen() {
  const navigation = useNavigation<Nav>();
  const { orders } = useMarket();
  const [tab, setTab] = useState<Order['status'] | 'All'>('All');

  const filtered = useMemo(
    () => (tab === 'All' ? orders : orders.filter((o) => o.status === tab)),
    [orders, tab],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.subtitle}>{orders.length} orders so far</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
        {TABS.map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: tab === t }}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
        {filtered.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title={tab === 'All' ? 'No orders yet' : `No ${tab.toLowerCase()} orders`}
            subtitle="Your handmade orders will appear here with live status."
            ctaLabel="Discover Handmade"
            onCta={() => navigation.navigate('Tabs', { screen: 'HomeTab' })}
          />
        ) : (
          filtered.map((o) => (
            <OrderRow key={o.id} order={o} onPress={() => navigation.navigate('OrderDetail', { orderId: o.id })} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 24,
  },
  subtitle: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    marginTop: 2,
  },
  tabs: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 4,
  },
  tab: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: light.lineStrong,
    backgroundColor: light.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#2E1B10',
    borderColor: '#2E1B10',
  },
  tabText: {
    color: light.inkMuted,
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
  },
  tabTextActive: {
    color: '#FFF8EC',
    fontFamily: fonts.sans.semibold,
  },
  list: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
});