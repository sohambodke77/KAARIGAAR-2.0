import { useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useMarketplace } from '../context/MarketplaceContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadow } from '../theme';
import { BackButton } from './BackButton';

const logoAsset = require('../../assets/kaarigaar_logo.png');

const PUNE_LOCALITIES = [
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

interface MarketplaceHeaderProps {
  showBack?: boolean;
  backFallback?: keyof AppStackParamList;
  title?: string;
  onSearchSubmit?: (query: string) => void;
}

export function MarketplaceHeader({
  showBack = false,
  backFallback = 'CustomerHome',
  title,
  onSearchSubmit,
}: MarketplaceHeaderProps) {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    selectedLocation,
    setSelectedLocation,
    wishlist,
    getCartCount,
    activeSearchQuery,
    setActiveSearchQuery,
  } = useMarketplace();

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchInput, setSearchInput] = useState(activeSearchQuery);

  const cartCount = getCartCount();
  const wishlistCount = wishlist.length;

  const handleSearchSubmit = () => {
    setActiveSearchQuery(searchInput);
    if (onSearchSubmit) {
      onSearchSubmit(searchInput);
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.innerContainer}>
        {/* Left Section: Back Button or Logo */}
        <View style={styles.leftSection}>
          {showBack && (
            <View style={styles.backButtonContainer}>
              <BackButton fallbackRoute={backFallback} />
            </View>
          )}

          <Pressable
            onPress={() => navigation.navigate('CustomerHome')}
            style={styles.logoPressable}
            accessibilityRole="link"
            accessibilityLabel="KARIGAAR Home"
          >
            <View style={styles.logoEmblemContainer}>
              <Image
                source={logoAsset}
                style={styles.logoEmblem}
                resizeMode="contain"
              />
            </View>
            <View style={styles.brandTitleBlock}>
              <Text style={styles.brandName}>KARIGAAR</Text>
              <Text style={styles.brandDevanagari}>कारीGaar</Text>
            </View>
          </Pressable>
        </View>

        {/* Center Section (Desktop Search Bar) */}
        {isDesktop && (
          <View style={styles.desktopSearchContainer}>
            <Ionicons name="search" size={17} color={colors.textSecondary} style={{ marginLeft: 14 }} />
            <TextInput
              style={styles.desktopSearchInput}
              placeholder="Search handmade products, gifts & creators…"
              placeholderTextColor={colors.textMuted}
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchInput.length > 0 && (
              <Pressable
                onPress={() => {
                  setSearchInput('');
                  setActiveSearchQuery('');
                }}
                hitSlop={8}
                style={{ marginRight: 8 }}
              >
                <Ionicons name="close-circle" size={16} color={colors.textMuted} />
              </Pressable>
            )}
            <Pressable onPress={handleSearchSubmit} style={styles.searchSubmitPill}>
              <Text style={styles.searchSubmitText}>Search</Text>
            </Pressable>
          </View>
        )}

        {/* Desktop Quick Nav Links */}
        {isDesktop && (
          <View style={styles.desktopNavLinks}>
            <Pressable
              onPress={() => navigation.navigate('Stories')}
              style={styles.navLinkItem}
            >
              <Text style={styles.navLinkText}>Stories</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('FindMyMaker')}
              style={styles.navLinkItem}
            >
              <Text style={styles.navLinkText}>Find My Maker</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('Orders')}
              style={styles.navLinkItem}
            >
              <Text style={styles.navLinkText}>Orders</Text>
            </Pressable>
          </View>
        )}

        {/* Right Section: Location Pill, Wishlist, Cart, Profile */}
        <View style={styles.rightSection}>
          {/* Location Selector */}
          <Pressable
            onPress={() => setShowLocationModal(true)}
            style={styles.locationPill}
            accessibilityRole="button"
            accessibilityLabel={`Delivering to ${selectedLocation}`}
          >
            <Ionicons name="location-sharp" size={14} color={colors.gold} />
            <Text style={styles.locationText} numberOfLines={1}>
              {selectedLocation}
            </Text>
            <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
          </Pressable>

          {/* Wishlist Icon */}
          <Pressable
            onPress={() => navigation.navigate('Wishlist')}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Wishlist"
          >
            <Ionicons
              name={wishlistCount > 0 ? 'heart' : 'heart-outline'}
              size={22}
              color={wishlistCount > 0 ? colors.terracotta : colors.charcoal}
            />
            {wishlistCount > 0 && (
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>{wishlistCount}</Text>
              </View>
            )}
          </Pressable>

          {/* Cart Icon */}
          <Pressable
            onPress={() => navigation.navigate('Cart')}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Shopping Cart"
          >
            <Ionicons name="bag-handle-outline" size={21} color={colors.charcoal} />
            {cartCount > 0 && (
              <View style={[styles.badgePill, { backgroundColor: colors.gold }]}>
                <Text style={[styles.badgeText, { color: colors.charcoal }]}>{cartCount}</Text>
              </View>
            )}
          </Pressable>

          {/* Profile Avatar Icon */}
          <Pressable
            onPress={() => navigation.navigate('Profile')}
            style={styles.profileButton}
            accessibilityRole="button"
            accessibilityLabel="My Profile"
          >
            <Ionicons name="person-outline" size={18} color={colors.charcoal} />
          </Pressable>
        </View>
      </View>

      {/* Mobile Search Row */}
      {!isDesktop && (
        <View style={styles.mobileSearchRow}>
          <View style={styles.mobileSearchContainer}>
            <Ionicons name="search" size={16} color={colors.textSecondary} style={{ marginLeft: 12 }} />
            <TextInput
              style={styles.mobileSearchInput}
              placeholder="Search handmade products & creators…"
              placeholderTextColor={colors.textMuted}
              value={searchInput}
              onChangeText={setSearchInput}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            {searchInput.length > 0 && (
              <Pressable
                onPress={() => {
                  setSearchInput('');
                  setActiveSearchQuery('');
                }}
                hitSlop={6}
                style={{ marginRight: 6 }}
              >
                <Ionicons name="close-circle" size={15} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Title Subheader if provided */}
      {title && (
        <View style={styles.titleRow}>
          <Text style={styles.pageTitleText}>{title}</Text>
        </View>
      )}

      {/* Location Selection Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="location" size={20} color={colors.gold} />
                <Text style={styles.modalTitle}>Select Delivery Locality</Text>
              </View>
              <Pressable
                onPress={() => setShowLocationModal(false)}
                hitSlop={8}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={20} color={colors.charcoal} />
              </Pressable>
            </View>

            <Text style={styles.modalSubtitle}>
              KARIGAAR connects you with verified makers in and around Pune. Select your area for fastest artisan delivery:
            </Text>

            <View style={styles.localityGrid}>
              {PUNE_LOCALITIES.map((loc) => {
                const isSelected = selectedLocation === loc || selectedLocation === `Pune, ${loc}`;
                return (
                  <Pressable
                    key={loc}
                    onPress={() => {
                      setSelectedLocation(loc);
                      setShowLocationModal(false);
                    }}
                    style={[
                      styles.localityChip,
                      isSelected && styles.localityChipSelected,
                    ]}
                  >
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color={isSelected ? '#FFFFFF' : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.localityChipText,
                        isSelected && styles.localityChipTextSelected,
                      ]}
                    >
                      {loc}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    zIndex: 100,
    ...shadow.soft,
  },
  innerContainer: {
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButtonContainer: {
    marginRight: 4,
  },
  logoPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  logoEmblemContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmblem: {
    width: 26,
    height: 26,
  },
  brandTitleBlock: {
    justifyContent: 'center',
  },
  brandName: {
    fontFamily: fonts.serif.bold,
    fontSize: 18,
    letterSpacing: 1.5,
    color: colors.charcoal,
    lineHeight: 20,
  },
  brandDevanagari: {
    fontFamily: fonts.sans.medium,
    fontSize: 10.5,
    letterSpacing: 1,
    color: colors.gold,
    marginTop: -1,
  },
  desktopSearchContainer: {
    flex: 1,
    maxWidth: 480,
    height: 42,
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  desktopSearchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  searchSubmitPill: {
    backgroundColor: colors.charcoal,
    paddingHorizontal: 14,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  searchSubmitText: {
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    color: '#FFFFFF',
  },
  desktopNavLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  navLinkItem: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  navLinkText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13.5,
    color: colors.textSecondary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.marketplaceBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  locationText: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.textPrimary,
    maxWidth: 90,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.marketplaceBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 2,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  badgePill: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontFamily: fonts.sans.bold,
    fontSize: 9.5,
    color: '#FFFFFF',
    lineHeight: 12,
  },
  mobileSearchRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  mobileSearchContainer: {
    height: 40,
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileSearchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  titleRow: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 8,
  },
  pageTitleText: {
    fontFamily: fonts.serif.bold,
    fontSize: 20,
    color: colors.charcoal,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 22, 19, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 24,
    ...shadow.card,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 18,
    color: colors.charcoal,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.marketplaceBg,
  },
  modalSubtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 18,
  },
  localityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  localityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.marketplaceBg,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  localityChipSelected: {
    backgroundColor: colors.charcoal,
    borderColor: colors.charcoal,
  },
  localityChipText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  localityChipTextSelected: {
    color: '#FFFFFF',
  },
});
