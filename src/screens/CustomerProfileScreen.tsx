import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { getProduct } from '../data/products';
import { FormField } from '../components/FormField';
import { Avatar } from '../components/Avatar';
import { colors, fonts, light } from '../theme';
import type { CustomerStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;

interface Account {
  name: string;
  phone: string;
  city: string;
  locality: string;
}

const STORAGE_KEY = '@kaarigaar/profile';

export function CustomerProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, signOut, chooseRole } = useAuth();
  const { wishlist, orders, savedCreators, customRequests } = useMarket();

  const [account, setAccount] = useState<Account>({ name: '', phone: '', city: 'Pune', locality: '' });
  const [editOpen, setEditOpen] = useState(false);
  const [editDraft, setEditDraft] = useState<Account>(account);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => raw && setAccount(JSON.parse(raw)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(account)).catch(() => {});
  }, [account]);

  const displayName = account.name || (user?.identifier ?? 'KARIGAAR Customer');

  const openEdit = () => {
    setEditDraft(account);
    setEditOpen(true);
  };

  const saveEdit = () => {
    setAccount(editDraft);
    setEditOpen(false);
  };

  const switchToSeller = async () => {
    if (switching) return;
    setSwitching(true);
    await chooseRole('seller');
    setSwitching(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <Pressable onPress={openEdit} style={styles.editIcon} accessibilityRole="button" accessibilityLabel="Edit profile">
          <Ionicons name="create-outline" size={19} color={light.ink} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.identity}>
          <Avatar label={displayName} size={72} />
          <View style={styles.identityInfo}>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{user?.method === 'google' ? 'Google account' : user?.identifier}</Text>
          </View>
        </View>

        <View style={styles.stats}>
          <Stat value={wishlist.length} label="Wishlist" onPress={() => navigation.navigate('Wishlist')} />
          <Stat value={orders.length} label="Orders" onPress={() => navigation.navigate('Tabs', { screen: 'OrdersTab' })} />
          <Stat
            value={savedCreators.length}
            label="Saved Creators"
            onPress={() => navigation.navigate('FindMyMaker')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>
          <DetailRow label="Name" value={displayName} />
          <DetailRow label="Email" value={user?.method === 'google' ? 'Google account' : (user?.identifier ?? '—')} />
          <DetailRow label="Phone" value={account.phone || '—'} />
          <DetailRow label="City" value={account.city || 'Pune'} />
          <DetailRow label="Locality" value={account.locality || '—'} last />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <MenuRow icon="create-outline" label="Edit Profile" onPress={openEdit} />
          <MenuRow icon="heart-outline" label="Saved Products" onPress={() => navigation.navigate('Wishlist')} />
          <MenuRow icon="receipt-outline" label="My Orders" onPress={() => navigation.navigate('Tabs', { screen: 'OrdersTab' })} />
          <MenuRow
            icon="color-wand-outline"
            label="My Custom Requests"
            badge={customRequests.length}
            onPress={() => setRequestsOpen(true)}
          />
          <MenuRow icon="settings-outline" label="Settings" onPress={() => navigation.navigate('Settings')} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Role</Text>
          <MenuRow icon="swap-horizontal" label="Switch to Creator" prompt="Turn your craft into a business" onPress={() => setSwitchOpen(true)} />
        </View>

        <Pressable
          onPress={signOut}
          style={({ pressed }) => [styles.logout, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={18} color={light.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editOpen} transparent animationType="fade" onRequestClose={() => setEditOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <FormField label="Name" value={editDraft.name} onChangeText={(v) => setEditDraft({ ...editDraft, name: v })} />
            <FormField label="Phone" value={editDraft.phone} onChangeText={(v) => setEditDraft({ ...editDraft, phone: v })} keyboardType="phone-pad" maxLength={10} />
            <FormField label="City" value={editDraft.city} onChangeText={(v) => setEditDraft({ ...editDraft, city: v })} />
            <FormField label="Locality" value={editDraft.locality} onChangeText={(v) => setEditDraft({ ...editDraft, locality: v })} />
            <View style={styles.modalBtns}>
              <Pressable onPress={() => setEditOpen(false)} style={styles.modalGhost}>
                <Text style={styles.modalGhostText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={saveEdit} style={styles.modalGold}>
                <Text style={styles.modalGoldText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Requests Modal */}
      <Modal visible={requestsOpen} transparent animationType="fade" onRequestClose={() => setRequestsOpen(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.modal, { maxHeight: 460 }]}>
            <Text style={styles.modalTitle}>My Custom Requests</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {customRequests.length === 0 ? (
                <Text style={styles.emptyText}>
                  No requests yet. Use “Customize This Creation” on any product to start one.
                </Text>
              ) : (
                customRequests.map((r) => (
                  <View key={r.id} style={styles.requestCard}>
                    <Text style={styles.requestName}>{getProduct(r.productId).name}</Text>
                    <Text style={styles.requestMeta}>
                      {r.customization.name || r.customization.size || r.customization.color} · × {r.qty} · budget ₹{r.budget}
                    </Text>
                    <Text style={styles.requestId}>{r.id} · {r.status}</Text>
                  </View>
                ))
              )}
            </ScrollView>
            <Pressable onPress={() => setRequestsOpen(false)} style={styles.modalGold}>
              <Text style={styles.modalGoldText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Switch Role Modal */}
      <Modal visible={switchOpen} transparent animationType="fade" onRequestClose={() => setSwitchOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            <View style={styles.switchIcon}>
              <Ionicons name="storefront-outline" size={26} color="#A9823A" />
            </View>
            <Text style={styles.modalTitle}>Switch to Creator</Text>
            <Text style={styles.modalBody}>
              Showcase your craft, receive orders and grow your handmade business. Your account,
              wishlist and orders are kept safe — you can switch back anytime from your profile.
            </Text>
            <View style={styles.modalBtns}>
              <Pressable onPress={() => setSwitchOpen(false)} style={styles.modalGhost}>
                <Text style={styles.modalGhostText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={switchToSeller} disabled={switching} style={[styles.modalGold, switching && { opacity: 0.6 }]}>
                <Text style={styles.modalGoldText}>{switching ? 'Switching…' : 'Switch Role'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Stat({ value, label, onPress }: { value: number; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.stat, pressed && { opacity: 0.85 }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Pressable>
  );
}

function DetailRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.detailRow, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  prompt,
  badge,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  prompt?: string;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: light.surfaceAlt }]}
      accessibilityRole="button"
    >
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={19} color="#A9823A" />
        <View>
          <Text style={styles.menuLabel}>{label}</Text>
          {prompt ? <Text style={styles.menuPrompt}>{prompt}</Text> : null}
        </View>
      </View>
      {badge !== undefined && badge > 0 ? (
        <View style={styles.menuBadge}><Text style={styles.menuBadgeText}>{badge}</Text></View>
      ) : null}
      <Ionicons name="chevron-forward" size={17} color={light.inkFaint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  headerTitle: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 24,
  },
  editIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: light.lineStrong,
    backgroundColor: light.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { padding: 16, paddingBottom: 40 },
  identity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  identityInfo: { flex: 1, gap: 2 },
  name: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 21,
  },
  email: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13,
  },
  stats: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 10,
  },
  stat: {
    flex: 1,
    backgroundColor: light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: light.line,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 22,
  },
  statLabel: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    textAlign: 'center',
  },
  section: {
    marginTop: 22,
    backgroundColor: light.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: light.line,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  sectionTitle: {
    color: '#A9823A',
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: light.line,
    gap: 16,
  },
  detailLabel: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
  },
  detailValue: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 13.5,
    flexShrink: 1,
    textAlign: 'right',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: light.line,
    borderRadius: 8,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    color: light.ink,
    fontFamily: fonts.sans.medium,
    fontSize: 14,
  },
  menuPrompt: {
    color: light.inkFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    marginTop: 1,
  },
  menuBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(212,163,89,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  menuBadgeText: {
    color: '#A9823A',
    fontFamily: fonts.sans.bold,
    fontSize: 11,
  },
  logout: {
    marginTop: 24,
    height: 50,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(192,82,56,0.4)',
    backgroundColor: 'rgba(192,82,56,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutText: {
    color: light.danger,
    fontFamily: fonts.sans.semibold,
    fontSize: 14.5,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 12, 6, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: light.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: light.line,
    padding: 22,
  },
  modalTitle: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalBody: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalGhost: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: light.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalGhostText: { color: light.ink, fontFamily: fonts.sans.semibold, fontSize: 14 },
  modalGold: {
    flex: 1,
    height: 46,
    borderRadius: 999,
    backgroundColor: colors.goldGradientStart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalGoldText: { color: colors.buttonText, fontFamily: fonts.sans.bold, fontSize: 14 },
  switchIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(212,163,89,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 10,
  },
  emptyText: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: 'center',
    paddingVertical: 20,
  },
  requestCard: {
    borderBottomWidth: 1,
    borderBottomColor: light.line,
    paddingVertical: 12,
    gap: 3,
  },
  requestName: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
  },
  requestMeta: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12,
  },
  requestId: {
    color: light.inkFaint,
    fontFamily: fonts.sans.medium,
    fontSize: 11,
    letterSpacing: 0.4,
  },
});