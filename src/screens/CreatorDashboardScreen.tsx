import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, type NavigationProp } from '@react-navigation/native';

import { PRODUCTS } from '../data/products';
import { useMarket } from '../context/MarketContext';
import { Avatar } from '../components/Avatar';
import type { IconName } from '../data/categories';
import { fonts, light } from '../theme';
import type { CreatorStackParamList } from '../navigation/types';

type Nav = NavigationProp<CreatorStackParamList>;

const SECTIONS: { icon: IconName; label: string; route: keyof CreatorStackParamList; prompt?: string }[] = [
  { icon: 'grid-outline', label: 'Products', route: 'Products', prompt: 'Your catalog' },
  { icon: 'receipt-outline', label: 'Orders', route: 'CreatorOrders', prompt: 'Fulfil & ship' },
  { icon: 'color-wand-outline', label: 'Custom Requests', route: 'CustomRequests', prompt: 'Personalised work' },
  { icon: 'chatbubbles-outline', label: 'Messages', route: 'Messages', prompt: 'Customer chats' },
  { icon: 'cube-outline', label: 'Inventory', route: 'Products', prompt: 'Stock levels' },
  { icon: 'wallet-outline', label: 'Earnings', route: 'Analytics', prompt: 'Payouts & sales' },
  { icon: 'analytics-outline', label: 'Analytics', route: 'Analytics', prompt: 'Insights' },
  { icon: 'person-outline', label: 'Creator Profile', route: 'CreatorProfile', prompt: 'Your public page' },
];

export function CreatorDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  const { orders, customRequests } = useMarket();

  const columns = width < 700 ? 2 : width < 1100 ? 3 : 4;
  const gridGap = 12;
  const gridWidth = Math.min(width, 1300) - 32;
  const cardWidth = Math.floor((gridWidth - gridGap * (columns - 1)) / columns);
  const earnings = orders.reduce((sum, o) => sum + o.total, 0) * 0.8;
  const pending = customRequests.filter((r) => r.status === 'Pending').length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandTitle}>KARIGAAR</Text>
            <Text style={styles.brandSub}>Creator Hub</Text>
          </View>
          <Avatar label="K" size={42} onPress={() => navigation.navigate('CreatorProfile')} />
        </View>

        <View style={styles.statGrid}>
          <Stat label="Total Orders" value={String(orders.length)} icon="receipt-outline" />
          <Stat label="Active Products" value={String(PRODUCTS.length)} icon="pricetag-outline" />
          <Stat label="Pending Requests" value={String(pending)} icon="color-wand-outline" />
          <Stat label="Earnings" value={`₹${earnings.toLocaleString('en-IN')}`} icon="wallet-outline" />
          <Stat label="Customer Messages" value="3" icon="chatbubble-outline" />
        </View>

        <Pressable
          onPress={() => navigation.navigate('ProductNew')}
          style={({ pressed }) => [styles.primaryCta, pressed && { opacity: 0.88 }]}
        >
          <Ionicons name="add-circle" size={20} color="#2A1A10" />
          <Text style={styles.primaryCtaText}>Add New Product</Text>
        </Pressable>

        <Text style={styles.sectionTitle}>Creator Hub</Text>
        <View style={[styles.sectionGrid, { gap: gridGap }]}>
          {SECTIONS.map((s) => (
            <Pressable
              key={s.label}
              onPress={() => navigation.navigate(s.route)}
              style={({ pressed }) => [
                styles.sectionInner,
                { width: cardWidth },
                pressed && { opacity: 0.85 },
              ]}
            >
              <View style={styles.sectionIcon}>
                <Ionicons name={s.icon} size={20} color="#A9823A" />
              </View>
              <Text style={styles.sectionLabel}>{s.label}</Text>
              {s.prompt ? <Text style={styles.sectionPrompt}>{s.prompt}</Text> : null}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: IconName }) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={16} color="#A9823A" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  brandBlock: { gap: 2 },
  brandTitle: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 24,
    letterSpacing: 1,
  },
  brandSub: {
    color: '#A9823A',
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flexGrow: 1,
    minWidth: 140,
    backgroundColor: light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: light.line,
    padding: 14,
    gap: 4,
  },
  statIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(212,163,89,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 21,
  },
  statLabel: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12,
  },
  primaryCta: {
    marginTop: 16,
    height: 54,
    borderRadius: 999,
    backgroundColor: '#D9A94A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryCtaText: {
    color: '#2A1A10',
    fontFamily: fonts.sans.bold,
    fontSize: 15.5,
    letterSpacing: 0.3,
  },
  sectionTitle: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 19,
    marginTop: 26,
    marginBottom: 14,
  },
  sectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionInner: {
    backgroundColor: light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: light.line,
    padding: 14,
    gap: 8,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212,163,89,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLabel: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 13.5,
  },
  sectionPrompt: {
    color: light.inkFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
  },
});