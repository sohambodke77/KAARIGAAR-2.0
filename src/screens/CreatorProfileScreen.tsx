import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { Avatar } from '../components/Avatar';
import { FormField } from '../components/FormField';
import { colors, fonts, light } from '../theme';

interface Brand {
  name: string;
  tagline: string;
  city: string;
  bio: string;
}

const STORAGE_KEY = '@kaarigaar/creatorProfile';

const DEFAULT_BRAND: Brand = {
  name: 'KARIGAAR Studio',
  tagline: 'Har Haath Ki Kahani, Aap Tak.',
  city: 'Pune, Maharashtra',
  bio: 'A small-batch handmade studio working with natural fibres, clay and gold-leaf detail. Every piece is made slowly, by hand.',
};

export function CreatorProfileScreen() {
  const { user, signOut, chooseRole } = useAuth();
  const { orders, customRequests, wishlist } = useMarket();

  const [brand, setBrand] = useState<Brand>(DEFAULT_BRAND);
  const [editOpen, setEditOpen] = useState(false);
  const [draft, setDraft] = useState<Brand>(brand);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [push, setPush] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => raw && setBrand({ ...DEFAULT_BRAND, ...JSON.parse(raw) }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(brand)).catch(() => {});
  }, [brand]);

  const switchToCustomer = async () => {
    if (switching) return;
    setSwitching(true);
    await chooseRole('customer');
    setSwitching(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.identity}>
          <Avatar label={brand.name} size={84} />
          <Text style={styles.brandName}>{brand.name}</Text>
          <Text style={styles.tagline}>{brand.tagline}</Text>
          <View style={styles.cityRow}>
            <Ionicons name="location-outline" size={13} color={light.inkMuted} />
            <Text style={styles.city}>{brand.city}</Text>
          </View>
          <Pressable
            onPress={() => {
              setDraft(brand);
              setEditOpen(true);
            }}
            style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.85 }]}
          >
            <Ionicons name="create-outline" size={15} color={light.ink} />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </Pressable>
        </View>

        <View style={styles.stats}>
          <Stat value={`₹${(orders.reduce((s, o) => s + o.total, 0) * 0.8).toLocaleString('en-IN')}`} label="Earnings" />
          <Stat value={String(orders.length)} label="Orders" />
          <Stat value={String(customRequests.length)} label="Requests" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bio}>{brand.bio}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Row label="Signed in as" value={user?.method === 'google' ? 'Google account' : (user?.identifier ?? '—')} />
          <Row label="Saved products (wishlist)" value={String(wishlist.length)} />
          <Row label="Notify me about orders" control={
            <Switch
              value={push}
              onValueChange={setPush}
              trackColor={{ true: 'rgba(212,163,89,0.6)', false: light.lineStrong }}
              thumbColor={push ? '#A9823A' : light.surface}
            />
          } />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Role</Text>
          <Pressable
            onPress={() => setSwitchOpen(true)}
            style={({ pressed }) => [styles.menuRow, pressed && { backgroundColor: light.surfaceAlt }]}
            accessibilityRole="button"
          >
            <View style={styles.menuLeft}>
              <Ionicons name="swap-horizontal" size={19} color="#A9823A" />
              <Text style={styles.menuLabel}>Switch to Customer</Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={light.inkFaint} />
          </Pressable>
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

      {/* Edit brand modal */}
      <Modal visible={editOpen} transparent animationType="fade" onRequestClose={() => setEditOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Edit Creator Profile</Text>
            <FormField label="Studio Name" value={draft.name} onChangeText={(v) => setDraft({ ...draft, name: v })} />
            <FormField label="Tagline" value={draft.tagline} onChangeText={(v) => setDraft({ ...draft, tagline: v })} />
            <FormField label="City" value={draft.city} onChangeText={(v) => setDraft({ ...draft, city: v })} />
            <FormField label="About" value={draft.bio} onChangeText={(v) => setDraft({ ...draft, bio: v })} multiline numberOfLines={4} />
            <View style={styles.modalBtns}>
              <Pressable onPress={() => setEditOpen(false)} style={styles.modalGhost}>
                <Text style={styles.modalGhostText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setBrand(draft);
                  setEditOpen(false);
                }}
                style={styles.modalGold}
              >
                <Text style={styles.modalGoldText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Switch role modal */}
      <Modal visible={switchOpen} transparent animationType="fade" onRequestClose={() => setSwitchOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.modal}>
            <View style={styles.switchIcon}>
              <Ionicons name="person-outline" size={26} color="#A9823A" />
            </View>
            <Text style={styles.modalTitle}>Switch to Customer</Text>
            <Text style={styles.modalBody}>
              Browse and shop the marketplace as a customer. Your creator profile, earnings and
              listings stay exactly as they are.
            </Text>
            <View style={styles.modalBtns}>
              <Pressable onPress={() => setSwitchOpen(false)} style={styles.modalGhost}>
                <Text style={styles.modalGhostText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={switchToCustomer}
                disabled={switching}
                style={[styles.modalGold, switching && { opacity: 0.6 }]}
              >
                <Text style={styles.modalGoldText}>{switching ? 'Switching…' : 'Switch Role'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Row({ label, value, control }: { label: string; value?: string; control?: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {control ?? <Text style={styles.rowValue}>{value}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  identity: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  brandName: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 24,
    marginTop: 6,
  },
  tagline: {
    color: '#A9823A',
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    textAlign: 'center',
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  city: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
  },
  editBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: light.lineStrong,
    backgroundColor: light.surface,
  },
  editBtnText: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
  },
  stats: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
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
    fontSize: 18,
  },
  statLabel: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
  },
  section: {
    marginTop: 22,
    backgroundColor: light.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: light.line,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  sectionTitle: {
    color: '#A9823A',
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  bio: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: light.line,
    gap: 16,
  },
  rowLabel: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    flexShrink: 1,
  },
  rowValue: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 13.5,
    textAlign: 'right',
    flexShrink: 1,
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
});