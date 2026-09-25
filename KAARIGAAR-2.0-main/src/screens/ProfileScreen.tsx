import { useState } from 'react';
import {
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

import { BackButton } from '../components/BackButton';
import { BottomNavigation } from '../components/BottomNavigation';
import { MarketplaceHeader } from '../components/MarketplaceHeader';
import { useAuth, type Role } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadow } from '../theme';

const LOCALITIES = [
  'Kothrud',
  'Viman Nagar',
  'Baner',
  'Aundh',
  'Alandi',
  'Koregaon Park',
  'Hadapsar',
  'Hinjawadi',
  'Shivajinagar',
  'Deccan Gymkhana',
];

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { user, activeRole, switchRole, updateProfile, signOut } = useAuth();
  const { wishlist, orders } = useMarketplace();

  // Form State initialized from user profile
  const [name, setName] = useState(user?.profile?.name || 'Sanket Joshi');
  const [email, setEmail] = useState(user?.profile?.email || 'sanket.crafts@gmail.com');
  const [phone, setPhone] = useState(user?.profile?.phone || '+91 98220 45678');
  const [city, setCity] = useState(user?.profile?.city || 'Pune');
  const [locality, setLocality] = useState(user?.profile?.locality || 'Kothrud');
  const [showLocalityDropdown, setShowLocalityDropdown] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  const handleSaveProfile = async () => {
    await updateProfile({
      name,
      email,
      phone,
      city,
      locality,
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  const handleRoleToggle = async (role: Role) => {
    await switchRole(role);
    if (role === 'seller') {
      navigation.navigate('SellerDashboard');
    } else {
      navigation.navigate('CustomerHome');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <MarketplaceHeader />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Back Navigation */}
          <View style={styles.backRow}>
            <BackButton label="Back to Marketplace" fallbackRoute="CustomerHome" />
          </View>

          {/* Page Title & Switch Role Link (Exact match to Reference 1) */}
          <View style={styles.titleRow}>
            <Text style={styles.pageTitle}>My Profile</Text>

            <Pressable
              onPress={() => handleRoleToggle(activeRole === 'seller' ? 'customer' : 'seller')}
              style={styles.switchRoleLink}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Ionicons name="swap-horizontal" size={16} color={colors.charcoal} />
              <Text style={styles.switchRoleText}>Switch role</Text>
            </Pressable>
          </View>

          {/* Segmented Control: Customer | Seller (Exact match to Reference 1) */}
          <View style={styles.segmentedControl}>
            <Pressable
              onPress={() => handleRoleToggle('customer')}
              style={[
                styles.segmentTab,
                activeRole === 'customer' && styles.segmentTabActive,
              ]}
              accessibilityRole="button"
            >
              <Ionicons
                name="bag-handle-outline"
                size={17}
                color={activeRole === 'customer' ? '#FFFFFF' : colors.charcoal}
              />
              <Text
                style={[
                  styles.segmentLabel,
                  activeRole === 'customer' && styles.segmentLabelActive,
                ]}
              >
                Customer
              </Text>
            </Pressable>

            <Pressable
              onPress={() => handleRoleToggle('seller')}
              style={[
                styles.segmentTab,
                activeRole === 'seller' && styles.segmentTabActive,
              ]}
              accessibilityRole="button"
            >
              <Ionicons
                name="storefront-outline"
                size={17}
                color={activeRole === 'seller' ? '#FFFFFF' : colors.charcoal}
              />
              <Text
                style={[
                  styles.segmentLabel,
                  activeRole === 'seller' && styles.segmentLabelActive,
                ]}
              >
                Seller
              </Text>
            </Pressable>
          </View>

          {/* Account Details Card (Exact match to Reference 1) */}
          <View style={styles.accountCard}>
            <Text style={styles.cardHeading}>Account Details</Text>

            <View style={[styles.formRow, isDesktop && styles.formRowDesktop]}>
              <View style={[styles.fieldCol, isDesktop && { width: '48.5%' }]}>
                <Text style={styles.fieldLabel}>Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your full name"
                />
              </View>

              <View style={[styles.fieldCol, isDesktop && { width: '48.5%' }]}>
                <Text style={styles.fieldLabel}>Email</Text>
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Your email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={[styles.formRow, isDesktop && styles.formRowDesktop, { marginTop: 14 }]}>
              <View style={[styles.fieldCol, isDesktop && { width: '48.5%' }]}>
                <Text style={styles.fieldLabel}>Phone</Text>
                <TextInput
                  style={styles.textInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+91 98220 00000"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={[styles.fieldCol, isDesktop && { width: '48.5%' }]}>
                <Text style={styles.fieldLabel}>City</Text>
                <View style={styles.cityDropdownWrapper}>
                  <Text style={styles.cityText}>{city}</Text>
                  <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
                </View>
              </View>
            </View>

            <View style={{ marginTop: 14 }}>
              <Text style={styles.fieldLabel}>Locality</Text>
              <Pressable
                onPress={() => setShowLocalityDropdown((prev) => !prev)}
                style={styles.localityDropdown}
              >
                <Text style={styles.localityText}>{locality || 'Select locality'}</Text>
                <Ionicons
                  name={showLocalityDropdown ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.textSecondary}
                />
              </Pressable>

              {showLocalityDropdown && (
                <View style={styles.localityOptionsList}>
                  {LOCALITIES.map((loc) => (
                    <Pressable
                      key={loc}
                      onPress={() => {
                        setLocality(loc);
                        setShowLocalityDropdown(false);
                      }}
                      style={[
                        styles.localityOptionItem,
                        locality === loc && styles.localityOptionItemSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.localityOptionText,
                          locality === loc && styles.localityOptionTextSelected,
                        ]}
                      >
                        {loc}
                      </Text>
                      {locality === loc && (
                        <Ionicons name="checkmark" size={14} color={colors.goldDeep} />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            {/* Save Profile Button */}
            <View style={styles.saveRow}>
              <Pressable
                onPress={handleSaveProfile}
                style={({ pressed }) => [
                  styles.saveProfileBtn,
                  pressed && styles.saveProfileBtnPressed,
                ]}
                accessibilityRole="button"
              >
                <Text style={styles.saveProfileText}>Save profile</Text>
              </Pressable>

              {saveToast && (
                <View style={styles.saveToast}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.ecoGreen} />
                  <Text style={styles.saveToastText}>Profile updated successfully!</Text>
                </View>
              )}
            </View>
          </View>

          {/* Bottom 3 Stat Cards (Exact match to Reference 1) */}
          <View style={styles.statsRow}>
            {/* Wishlist Stat */}
            <Pressable
              onPress={() => navigation.navigate('Wishlist')}
              style={styles.statCard}
            >
              <Ionicons name="heart-outline" size={24} color={colors.gold} />
              <Text style={styles.statNumber}>{wishlist.length}</Text>
              <Text style={styles.statLabel}>Wishlist</Text>
            </Pressable>

            {/* Orders Stat */}
            <Pressable
              onPress={() => navigation.navigate('Orders')}
              style={styles.statCard}
            >
              <MaterialCommunityIcons name="currency-inr" size={24} color={colors.gold} />
              <Text style={styles.statNumber}>{orders.length}</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </Pressable>

            {/* City Stat */}
            <View style={styles.statCard}>
              <Ionicons name="location-outline" size={24} color={colors.gold} />
              <Text style={styles.statNumber}>{city}</Text>
              <Text style={styles.statLabel}>City</Text>
            </View>
          </View>

          {/* Quick Links Menu */}
          <View style={styles.menuCard}>
            <Pressable
              onPress={() => navigation.navigate('Orders')}
              style={styles.menuItem}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="receipt-outline" size={19} color={colors.charcoal} />
                <Text style={styles.menuItemText}>My Orders & Tracking</Text>
              </View>
              <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('Wishlist')}
              style={[styles.menuItem, styles.menuDivider]}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="heart-outline" size={19} color={colors.charcoal} />
                <Text style={styles.menuItemText}>Saved Creations (Wishlist)</Text>
              </View>
              <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate('FindMyMaker')}
              style={[styles.menuItem, styles.menuDivider]}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="sparkles-outline" size={19} color={colors.charcoal} />
                <Text style={styles.menuItemText}>My Custom Commissions</Text>
              </View>
              <Ionicons name="chevron-forward" size={17} color={colors.textMuted} />
            </Pressable>

            <Pressable
              onPress={signOut}
              style={[styles.menuItem, styles.menuDivider]}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="log-out-outline" size={19} color={colors.danger} />
                <Text style={[styles.menuItemText, { color: colors.danger }]}>Sign Out</Text>
              </View>
            </Pressable>
          </View>

          <Text style={styles.versionNote}>KARIGAAR Marketplace · v2.0</Text>
        </View>
      </ScrollView>

      <BottomNavigation activeTab="profile" />
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
    maxWidth: 820,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backRow: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pageTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 26,
    color: colors.charcoal,
  },
  switchRoleLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  switchRoleText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13.5,
    color: colors.charcoal,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 24,
    ...shadow.soft,
  },
  segmentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: radius.sm,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  segmentTabActive: {
    backgroundColor: colors.charcoal,
    ...shadow.soft,
  },
  segmentLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: 14,
    color: colors.charcoal,
  },
  segmentLabelActive: {
    color: '#FFFFFF',
    fontFamily: fonts.sans.semibold,
  },
  accountCard: {
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
    marginBottom: 18,
  },
  formRow: {
    flexDirection: 'column',
    gap: 12,
  },
  formRowDesktop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fieldCol: {
    width: '100%',
  },
  fieldLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.charcoal,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.inputBorderLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  cityDropdownWrapper: {
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.inputBorderLight,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cityText: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  localityDropdown: {
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.inputBorderLight,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  localityText: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  localityOptionsList: {
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadow.medium,
    overflow: 'hidden',
  },
  localityOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorderSubtle,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  localityOptionItemSelected: {
    backgroundColor: '#FFFDF9',
  },
  localityOptionText: {
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  localityOptionTextSelected: {
    fontFamily: fonts.sans.semibold,
    color: colors.goldDeep,
  },
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 22,
  },
  saveProfileBtn: {
    backgroundColor: colors.charcoal,
    paddingHorizontal: 22,
    height: 42,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  saveProfileBtnPressed: {
    backgroundColor: colors.gold,
  },
  saveProfileText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  saveToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  saveToastText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.ecoGreen,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
    gap: 4,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  statNumber: {
    fontFamily: fonts.sans.bold,
    fontSize: 22,
    color: colors.charcoal,
  },
  statLabel: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    marginBottom: 28,
    ...shadow.soft,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  menuDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.cardBorderSubtle,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontFamily: fonts.sans.medium,
    fontSize: 14,
    color: colors.charcoal,
  },
  versionNote: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
});