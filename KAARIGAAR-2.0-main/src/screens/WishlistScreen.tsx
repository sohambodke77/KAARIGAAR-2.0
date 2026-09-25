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
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton } from '../components/BackButton';
import { BottomNavigation } from '../components/BottomNavigation';
import { MarketplaceHeader } from '../components/MarketplaceHeader';
import { useMarketplace } from '../context/MarketplaceContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadow } from '../theme';

export function WishlistScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { products, wishlist, toggleWishlist, addToCart } = useMarketplace();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <MarketplaceHeader />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Back Row */}
          <View style={styles.backRow}>
            <BackButton label="Back to Marketplace" fallbackRoute="CustomerHome" />
          </View>

          <Text style={styles.pageTitle}>My Wishlist</Text>
          <Text style={styles.pageSubtitle}>
            Save authentic handmade treasures you love and support independent Indian artisans.
          </Text>

          {wishlistedProducts.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="heart-outline" size={42} color={colors.gold} />
              </View>
              <Text style={styles.emptyTitle}>Your handmade collection starts here.</Text>
              <Text style={styles.emptyDesc}>
                Explore unique crafts, pottery, paintings, and bespoke gifts, and tap the heart icon to save them here.
              </Text>
              <Pressable
                onPress={() => navigation.navigate('CustomerHome')}
                style={styles.discoverBtn}
                accessibilityRole="button"
              >
                <Text style={styles.discoverBtnText}>Discover Handmade</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          ) : (
            <View style={styles.grid}>
              {wishlistedProducts.map((p) => (
                <View
                  key={p.id}
                  style={[styles.wishCard, isDesktop && { width: '48.5%' }]}
                >
                  <Pressable
                    onPress={() => navigation.navigate('ProductDetail', { productId: p.id })}
                    style={styles.cardImageWrapper}
                  >
                    <Image source={{ uri: p.images[0] }} style={styles.cardImg} resizeMode="cover" />
                  </Pressable>

                  <View style={styles.cardDetails}>
                    <View style={styles.cardTopRow}>
                      <Text style={styles.cardCategory}>{p.category.toUpperCase()}</Text>
                      <Pressable
                        onPress={() => toggleWishlist(p.id)}
                        hitSlop={8}
                        style={styles.removeWishBtn}
                      >
                        <Ionicons name="heart" size={18} color={colors.terracotta} />
                      </Pressable>
                    </View>

                    <Pressable
                      onPress={() => navigation.navigate('ProductDetail', { productId: p.id })}
                    >
                      <Text style={styles.cardTitle} numberOfLines={2}>
                        {p.name}
                      </Text>
                    </Pressable>

                    <Text style={styles.cardMaker}>
                      by {p.creatorName} ({p.creatorLocation})
                    </Text>

                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={13} color={colors.gold} />
                      <Text style={styles.ratingScore}>{p.rating.toFixed(1)}</Text>
                      <Text style={styles.reviewCount}>({p.reviewCount} reviews)</Text>
                    </View>

                    <View style={styles.cardBottomRow}>
                      <Text style={styles.cardPrice}>₹{p.price}</Text>

                      <Pressable
                        onPress={() => addToCart(p, 1)}
                        style={styles.addToCartBtn}
                        accessibilityRole="button"
                      >
                        <Ionicons name="bag-handle-outline" size={14} color="#FFFFFF" />
                        <Text style={styles.addToCartText}>Add to Cart</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

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
    paddingBottom: 48,
  },
  container: {
    maxWidth: 1040,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backRow: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  pageTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 28,
    color: colors.charcoal,
  },
  pageSubtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 24,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 48,
    alignItems: 'center',
    gap: 12,
    ...shadow.soft,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.marketplaceBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 22,
    color: colors.charcoal,
  },
  emptyDesc: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 420,
    lineHeight: 20,
  },
  discoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.charcoal,
    paddingHorizontal: 22,
    height: 44,
    borderRadius: radius.full,
    marginTop: 8,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  discoverBtnText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  wishCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    flexDirection: 'row',
    gap: 16,
    ...shadow.soft,
  },
  cardImageWrapper: {
    width: 110,
    height: 110,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.marketplaceBg,
  },
  cardImg: {
    width: '100%',
    height: '100%',
  },
  cardDetails: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardCategory: {
    fontFamily: fonts.sans.bold,
    fontSize: 10.5,
    letterSpacing: 1,
    color: colors.goldDeep,
  },
  removeWishBtn: {
    padding: 2,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  cardTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 15,
    lineHeight: 20,
    color: colors.charcoal,
    marginTop: 4,
  },
  cardMaker: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  ratingScore: {
    fontFamily: fonts.sans.bold,
    fontSize: 12,
    color: colors.charcoal,
  },
  reviewCount: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    color: colors.textMuted,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cardPrice: {
    fontFamily: fonts.sans.bold,
    fontSize: 18,
    color: colors.charcoal,
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.charcoal,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: radius.full,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  addToCartText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
});
