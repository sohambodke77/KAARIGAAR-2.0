import { useState } from 'react';
import {
  FlatList,
  Image,
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
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BottomNavigation } from '../components/BottomNavigation';
import { CategoryCard } from '../components/CategoryCard';
import { MarketplaceHeader } from '../components/MarketplaceHeader';
import { ProductCard } from '../components/ProductCard';
import { useMarketplace } from '../context/MarketplaceContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadow } from '../theme';

export function CustomerHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    categories,
    products,
    creators,
    stories,
    selectedLocation,
    activeSearchQuery,
    setActiveSearchQuery,
  } = useMarketplace();

  const [heroSearch, setHeroSearch] = useState('');

  // Filter products for various sections
  const filteredProducts = activeSearchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
          p.creatorName.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(activeSearchQuery.toLowerCase())),
      )
    : products;

  const trendingProducts = filteredProducts.filter((p) => p.isTrending);
  const pocketFriendlyProducts = filteredProducts.filter((p) => p.isPocketFriendly || p.price <= 499);
  const highlyRatedProducts = filteredProducts.filter((p) => p.rating >= 4.8);
  const giftProducts = filteredProducts.filter((p) => p.isGift);
  const localPuneProducts = filteredProducts.filter((p) => p.isNearYou);

  const handleHeroSearchSubmit = () => {
    if (heroSearch.trim()) {
      setActiveSearchQuery(heroSearch.trim());
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Top Header */}
      <MarketplaceHeader onSearchSubmit={(q) => setActiveSearchQuery(q)} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.innerContainer}>
          {/* Active Search Filter Notice */}
          {activeSearchQuery.trim() !== '' && (
            <View style={styles.searchBanner}>
              <Text style={styles.searchBannerText}>
                Showing results for “<Text style={{ fontFamily: fonts.sans.semibold }}>{activeSearchQuery}</Text>” ({filteredProducts.length} found)
              </Text>
              <Pressable
                onPress={() => {
                  setActiveSearchQuery('');
                  setHeroSearch('');
                }}
                hitSlop={8}
                style={styles.clearSearchBtn}
              >
                <Text style={styles.clearSearchText}>Clear Search</Text>
              </Pressable>
            </View>
          )}

          {/* 1. HERO SECTION (Reference Image 3) */}
          <LinearGradient
            colors={['#1F1611', '#2C1D15', '#3E281C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            {/* Sparkle badge */}
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles" size={13} color={colors.goldBright} />
              <Text style={styles.heroBadgeText}>Hyperlocal Handmade Marketplace</Text>
            </View>

            {/* Main Editorial Heading */}
            <Text style={styles.heroTitle}>
              Discover Handmade.{'\n'}
              <Text style={{ color: colors.goldLight }}>Carry the Story.</Text>
            </Text>

            {/* Subtitle */}
            <Text style={styles.heroSubtitle}>
              Unique creations made by real people, discovered in one place around {selectedLocation} & beyond.
            </Text>

            {/* Search Box in Hero */}
            <View style={styles.heroSearchWrapper}>
              <View style={styles.heroSearchContainer}>
                <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginLeft: 14 }} />
                <TextInput
                  style={styles.heroSearchInput}
                  placeholder="What are you looking for?"
                  placeholderTextColor={colors.textMuted}
                  value={heroSearch}
                  onChangeText={setHeroSearch}
                  onSubmitEditing={handleHeroSearchSubmit}
                  returnKeyType="search"
                />
                <Pressable
                  onPress={handleHeroSearchSubmit}
                  style={({ pressed }) => [
                    styles.heroSearchBtn,
                    pressed && styles.heroSearchBtnPressed,
                  ]}
                  accessibilityRole="button"
                >
                  <Text style={styles.heroSearchBtnText}>Search</Text>
                </Pressable>
              </View>
            </View>

            {/* Hero CTAs & Location Row */}
            <View style={styles.heroMetaRow}>
              <View style={styles.heroCtas}>
                <Pressable
                  onPress={() =>
                    navigation.navigate('Category', {
                      categoryId: 'crochet',
                      categoryName: 'All Handmade',
                    })
                  }
                  style={styles.primaryCta}
                  accessibilityRole="button"
                >
                  <Text style={styles.primaryCtaText}>Explore Handmade</Text>
                  <Ionicons name="arrow-forward" size={15} color={colors.charcoal} />
                </Pressable>

                <Pressable
                  onPress={() => navigation.navigate('FindMyMaker')}
                  style={styles.secondaryCta}
                  accessibilityRole="button"
                >
                  <Ionicons name="sparkles-outline" size={15} color={colors.cream} />
                  <Text style={styles.secondaryCtaText}>Find My Maker</Text>
                </Pressable>
              </View>

              <View style={styles.heroLocationPill}>
                <Ionicons name="location" size={14} color={colors.goldBright} />
                <Text style={styles.heroLocationText}>Delivering to {selectedLocation}</Text>
              </View>
            </View>
          </LinearGradient>

          {/* 2. BROWSE CATEGORIES (Reference Image 2 & 3) */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Browse Categories</Text>
            <Pressable
              onPress={() =>
                navigation.navigate('Category', {
                  categoryId: 'all',
                  categoryName: 'All Categories',
                })
              }
              hitSlop={8}
            >
              <Text style={styles.viewAllText}>View all</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </ScrollView>

          {/* 3. TRENDING HANDMADE PRODUCTS (Reference Image 2) */}
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Trending Handmade Products</Text>
              <Text style={styles.sectionSubtitle}>Popular picks from Pune makers</Text>
            </View>
            <Pressable
              onPress={() =>
                navigation.navigate('Category', {
                  categoryId: 'trending',
                  categoryName: 'Trending Creations',
                })
              }
              hitSlop={8}
            >
              <Text style={styles.viewAllText}>View all</Text>
            </Pressable>
          </View>

          <View style={styles.productGrid}>
            {trendingProducts.slice(0, isDesktop ? 4 : 4).map((item) => (
              <View
                key={item.id}
                style={[styles.productGridItem, { width: isDesktop ? '23.5%' : '48%' }]}
              >
                <ProductCard product={item} />
              </View>
            ))}
          </View>

          {/* 4. HIGHLY RATED CRAFTSMANSHIP (Reference Image 2) */}
          <View style={[styles.sectionHeaderRow, { marginTop: 36 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="star" size={20} color={colors.gold} />
              <Text style={styles.sectionTitle}>Highly Rated Craftsmanship</Text>
            </View>
            <Pressable
              onPress={() =>
                navigation.navigate('Category', {
                  categoryId: 'highly-rated',
                  categoryName: 'Highly Rated Craftsmanship',
                })
              }
              hitSlop={8}
            >
              <Text style={styles.viewAllText}>View all</Text>
            </Pressable>
          </View>

          <View style={styles.productGrid}>
            {highlyRatedProducts.slice(0, isDesktop ? 4 : 4).map((item) => (
              <View
                key={item.id}
                style={[styles.productGridItem, { width: isDesktop ? '23.5%' : '48%' }]}
              >
                <ProductCard product={item} />
              </View>
            ))}
          </View>

          {/* 5. LOCAL MAKERS IN PUNE (Reference Image 2) */}
          <View style={[styles.sectionHeaderRow, { marginTop: 36 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="storefront-outline" size={20} color={colors.ecoGreen} />
              <Text style={styles.sectionTitle}>Local Makers in Pune</Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('FindMyMaker')}
              hitSlop={8}
            >
              <Text style={styles.viewAllText}>View all makers</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.makersScroll}
          >
            {creators.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => navigation.navigate('CreatorProfile', { creatorId: c.id })}
                style={({ pressed }) => [
                  styles.makerCard,
                  pressed && styles.makerCardPressed,
                ]}
              >
                <Image source={{ uri: c.avatar }} style={styles.makerAvatar} />
                <View style={styles.makerInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={styles.makerName}>{c.name}</Text>
                    {c.verified && (
                      <Ionicons name="checkmark-circle" size={14} color={colors.gold} />
                    )}
                  </View>
                  <Text style={styles.makerCraft} numberOfLines={1}>{c.craft}</Text>
                  <Text style={styles.makerLoc}>📍 {c.locality}, Pune</Text>
                  <View style={styles.makerRatingRow}>
                    <Ionicons name="star" size={13} color={colors.gold} />
                    <Text style={styles.makerRatingText}>{c.rating.toFixed(1)}</Text>
                    <Text style={styles.makerCreationCount}>• {c.completedCreations}+ creations</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>

          {/* 6. POCKET-FRIENDLY TREASURES */}
          <View style={[styles.sectionHeaderRow, { marginTop: 36 }]}>
            <View>
              <Text style={styles.sectionTitle}>Pocket-Friendly Treasures</Text>
              <Text style={styles.sectionSubtitle}>Handmade wonders under ₹499</Text>
            </View>
            <Pressable
              onPress={() =>
                navigation.navigate('Category', {
                  categoryId: 'pocket-friendly',
                  categoryName: 'Pocket-Friendly Treasures',
                })
              }
              hitSlop={8}
            >
              <Text style={styles.viewAllText}>View all</Text>
            </Pressable>
          </View>

          <View style={styles.productGrid}>
            {pocketFriendlyProducts.slice(0, isDesktop ? 4 : 4).map((item) => (
              <View
                key={item.id}
                style={[styles.productGridItem, { width: isDesktop ? '23.5%' : '48%' }]}
              >
                <ProductCard product={item} />
              </View>
            ))}
          </View>

          {/* 7. PERFECT GIFTS */}
          <View style={[styles.sectionHeaderRow, { marginTop: 36 }]}>
            <View>
              <Text style={styles.sectionTitle}>Perfect Gifts with a Soul</Text>
              <Text style={styles.sectionSubtitle}>Heartfelt creations made for celebrations</Text>
            </View>
            <Pressable
              onPress={() =>
                navigation.navigate('Category', {
                  categoryId: 'gifts',
                  categoryName: 'Handcrafted Gifts',
                })
              }
              hitSlop={8}
            >
              <Text style={styles.viewAllText}>View all</Text>
            </Pressable>
          </View>

          <View style={styles.productGrid}>
            {giftProducts.slice(0, isDesktop ? 4 : 4).map((item) => (
              <View
                key={item.id}
                style={[styles.productGridItem, { width: isDesktop ? '23.5%' : '48%' }]}
              >
                <ProductCard product={item} />
              </View>
            ))}
          </View>

          {/* 8. WHY CHOOSE KARIGAAR? (Reference Image 2) */}
          <View style={styles.whyChooseBanner}>
            <Text style={styles.whyChooseHeading}>Why Choose KARIGAAR?</Text>
            <View style={styles.whyChooseGrid}>
              {/* Feature 1: Compare Products */}
              <View style={styles.whyFeatureCol}>
                <View style={styles.whyIconCircle}>
                  <Ionicons name="search-outline" size={22} color={colors.goldDeep} />
                </View>
                <Text style={styles.whyFeatureTitle}>Compare Products</Text>
                <Text style={styles.whyFeatureDesc}>
                  Compare products from multiple local makers side by side.
                </Text>
              </View>

              {/* Feature 2: Genuine Craftsmanship */}
              <View style={styles.whyFeatureCol}>
                <View style={styles.whyIconCircle}>
                  <Ionicons name="sparkles-outline" size={22} color={colors.goldDeep} />
                </View>
                <Text style={styles.whyFeatureTitle}>Genuine Craftsmanship</Text>
                <Text style={styles.whyFeatureDesc}>
                  Discover authentic handmade work with craftsmanship ratings.
                </Text>
              </View>

              {/* Feature 3: Support Small Businesses */}
              <View style={styles.whyFeatureCol}>
                <View style={styles.whyIconCircle}>
                  <Ionicons name="heart-outline" size={22} color={colors.goldDeep} />
                </View>
                <Text style={styles.whyFeatureTitle}>Support Small Businesses</Text>
                <Text style={styles.whyFeatureDesc}>
                  Every purchase supports a local artisan directly.
                </Text>
              </View>

              {/* Feature 4: Shop Locally */}
              <View style={styles.whyFeatureCol}>
                <View style={styles.whyIconCircle}>
                  <Ionicons name="shield-checkmark-outline" size={22} color={colors.goldDeep} />
                </View>
                <Text style={styles.whyFeatureTitle}>Shop Locally</Text>
                <Text style={styles.whyFeatureDesc}>
                  Handpicked makers from Pune & Alandi, near you.
                </Text>
              </View>
            </View>
          </View>

          {/* 9. STORIES CARVED IN HAND & HEART (Section 12) */}
          <View style={[styles.sectionHeaderRow, { marginTop: 42 }]}>
            <View>
              <Text style={styles.sectionTitle}>Stories Carved in Hand & Heart</Text>
              <Text style={styles.sectionSubtitle}>Meet the people behind the creations.</Text>
            </View>
            <Pressable onPress={() => navigation.navigate('Stories')} hitSlop={8}>
              <Text style={styles.viewAllText}>Explore Stories →</Text>
            </Pressable>
          </View>

          <View style={styles.storiesGrid}>
            {stories.slice(0, isDesktop ? 3 : 2).map((s) => (
              <Pressable
                key={s.id}
                onPress={() => navigation.navigate('Stories')}
                style={({ pressed }) => [
                  styles.storyCard,
                  { width: isDesktop ? '31.5%' : '100%' },
                  pressed && styles.storyCardPressed,
                ]}
              >
                <Image source={{ uri: s.image }} style={styles.storyImage} />
                <View style={styles.storyCardContent}>
                  <Text style={styles.storyCraftBadge}>{s.craft.toUpperCase()}</Text>
                  <Text style={styles.storyTitle}>{s.title}</Text>
                  <Text style={styles.storySubtitle} numberOfLines={2}>
                    {s.subtitle}
                  </Text>
                  <View style={styles.storyFooter}>
                    <Text style={styles.storyAuthor}>by {s.creatorName}</Text>
                    <Text style={styles.storyReadMore}>Read Story →</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>

          {/* 10. FIND MY MAKER CALLOUT BANNER */}
          <View style={styles.makerBanner}>
            <View style={styles.makerBannerContent}>
              <View style={styles.makerBadge}>
                <Ionicons name="sparkles" size={13} color={colors.goldBright} />
                <Text style={styles.makerBadgeText}>BESPOKE COMMISSIONS</Text>
              </View>
              <Text style={styles.makerBannerHeading}>Have a Custom Design in Mind?</Text>
              <Text style={styles.makerBannerText}>
                Connect directly with master karigaars in Pune. From custom wedding nameplates to bespoke crochet bouquets, bring your vision to life.
              </Text>
              <Pressable
                onPress={() => navigation.navigate('FindMyMaker')}
                style={styles.makerBannerBtn}
                accessibilityRole="button"
              >
                <Text style={styles.makerBannerBtnText}>Find My Maker Now</Text>
                <Ionicons name="arrow-forward" size={16} color={colors.charcoal} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>KARIGAAR · कारीGaar</Text>
          <Text style={styles.footerTagline}>“Har Haath Ki Kahani”</Text>
          <Text style={styles.footerCopyright}>
            © 2026 KARIGAAR Handmade Marketplace. Celebrating authentic Indian artisans.
          </Text>
        </View>
      </ScrollView>

      {/* Mobile Bottom Navigation */}
      <BottomNavigation activeTab="home" />
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
    paddingBottom: 24,
  },
  innerContainer: {
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  searchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFDF9',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.goldDim,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchBannerText: {
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  clearSearchBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearSearchText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    color: colors.terracotta,
  },
  heroCard: {
    borderRadius: radius.xl,
    paddingHorizontal: 24,
    paddingVertical: 32,
    marginBottom: 32,
    ...shadow.card,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 163, 89, 0.20)',
    borderWidth: 1,
    borderColor: colors.goldBorder,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    marginBottom: 16,
  },
  heroBadgeText: {
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    color: colors.goldBright,
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 34,
    lineHeight: 42,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  heroSubtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.beige,
    marginTop: 10,
    maxWidth: 620,
    opacity: 0.95,
  },
  heroSearchWrapper: {
    marginTop: 22,
    maxWidth: 600,
  },
  heroSearchContainer: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    ...shadow.medium,
  },
  heroSearchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  heroSearchBtn: {
    backgroundColor: colors.charcoal,
    paddingHorizontal: 20,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  heroSearchBtnPressed: {
    backgroundColor: colors.gold,
  },
  heroSearchBtnText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  heroMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 22,
    gap: 14,
  },
  heroCtas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.gold,
    paddingHorizontal: 18,
    height: 42,
    borderRadius: radius.full,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  primaryCtaText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13.5,
    color: colors.charcoal,
  },
  secondaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    height: 42,
    borderRadius: radius.full,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  secondaryCtaText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  heroLocationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroLocationText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.beige,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 22,
    color: colors.charcoal,
  },
  sectionSubtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  viewAllText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13.5,
    color: colors.goldDeep,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  categoryScroll: {
    gap: 12,
    paddingBottom: 24,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productGridItem: {
    marginBottom: 8,
  },
  makersScroll: {
    gap: 14,
    paddingBottom: 16,
  },
  makerCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    alignItems: 'center',
    ...shadow.soft,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  makerCardPressed: {
    transform: [{ scale: 0.98 }],
  },
  makerAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    marginBottom: 10,
  },
  makerInfo: {
    alignItems: 'center',
    width: '100%',
  },
  makerName: {
    fontFamily: fonts.serif.bold,
    fontSize: 15,
    color: colors.charcoal,
  },
  makerCraft: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  makerLoc: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 4,
  },
  makerRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: colors.marketplaceBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  makerRatingText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    color: colors.charcoal,
  },
  makerCreationCount: {
    fontFamily: fonts.sans.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  whyChooseBanner: {
    marginTop: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 36,
    paddingHorizontal: 20,
    ...shadow.soft,
  },
  whyChooseHeading: {
    fontFamily: fonts.serif.bold,
    fontSize: 24,
    color: colors.charcoal,
    textAlign: 'center',
    marginBottom: 28,
  },
  whyChooseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  whyFeatureCol: {
    width: Platform.OS === 'web' ? '22%' : '46%',
    flexGrow: 1,
    alignItems: 'center',
    textAlign: 'center',
    padding: 8,
  },
  whyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: '#FFF8E8',
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 89, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  whyFeatureTitle: {
    fontFamily: fonts.sans.bold,
    fontSize: 14.5,
    color: colors.charcoal,
    textAlign: 'center',
    marginBottom: 6,
  },
  whyFeatureDesc: {
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  storiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  storyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    ...shadow.soft,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  storyCardPressed: {
    transform: [{ scale: 0.99 }],
  },
  storyImage: {
    width: '100%',
    height: 180,
  },
  storyCardContent: {
    padding: 16,
  },
  storyCraftBadge: {
    fontFamily: fonts.sans.bold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.goldDeep,
    marginBottom: 6,
  },
  storyTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 17,
    color: colors.charcoal,
    marginBottom: 6,
  },
  storySubtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  storyFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorderSubtle,
  },
  storyAuthor: {
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    color: colors.textMuted,
  },
  storyReadMore: {
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    color: colors.goldDeep,
  },
  makerBanner: {
    marginTop: 40,
    borderRadius: radius.xl,
    backgroundColor: '#FFFDF9',
    borderWidth: 1.5,
    borderColor: colors.goldDim,
    padding: 28,
  },
  makerBannerContent: {
    maxWidth: 640,
  },
  makerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  makerBadgeText: {
    fontFamily: fonts.sans.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.goldDeep,
  },
  makerBannerHeading: {
    fontFamily: fonts.serif.bold,
    fontSize: 24,
    color: colors.charcoal,
    marginBottom: 8,
  },
  makerBannerText: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  makerBannerBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.gold,
    paddingHorizontal: 20,
    height: 44,
    borderRadius: radius.full,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  makerBannerBtnText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13.5,
    color: colors.charcoal,
  },
  footer: {
    marginTop: 50,
    paddingVertical: 32,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    alignItems: 'center',
  },
  footerBrand: {
    fontFamily: fonts.serif.bold,
    fontSize: 18,
    color: colors.charcoal,
    letterSpacing: 1.5,
  },
  footerTagline: {
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    color: colors.goldDeep,
    letterSpacing: 1,
    marginTop: 4,
  },
  footerCopyright: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 10,
    textAlign: 'center',
  },
});