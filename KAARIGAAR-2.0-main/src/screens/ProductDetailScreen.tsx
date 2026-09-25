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
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton } from '../components/BackButton';
import { BottomNavigation } from '../components/BottomNavigation';
import { DigitalPassportModal } from '../components/DigitalPassportModal';
import { MarketplaceHeader } from '../components/MarketplaceHeader';
import { ProductCard } from '../components/ProductCard';
import { useMarketplace } from '../context/MarketplaceContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadow } from '../theme';

type ProductDetailRouteProp = RouteProp<AppStackParamList, 'ProductDetail'>;

export function ProductDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<ProductDetailRouteProp>();
  const { productId } = route.params;

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const {
    products,
    creators,
    addToCart,
    toggleWishlist,
    isWishlisted,
  } = useMarketplace();

  const product = products.find((p) => p.id === productId) || products[0];
  const creator = creators.find((c) => c.id === product.creatorId) || creators[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showPassport, setShowPassport] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);

  const wishlisted = isWishlisted(product.id);
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const relatedProducts = products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2400);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <MarketplaceHeader />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Top Back Navigation Row */}
          <View style={styles.backRow}>
            <BackButton label="Back" fallbackRoute="CustomerHome" />
            <View style={styles.categoryBreadcrumb}>
              <Text style={styles.breadcrumbMuted}>Marketplace / </Text>
              <Text style={styles.breadcrumbActive}>{product.category}</Text>
            </View>
          </View>

          {/* Main Product Layout (2 columns on Desktop, Stack on Mobile) */}
          <View style={[styles.mainLayout, isDesktop && styles.mainLayoutDesktop]}>
            {/* Left Column: Product Gallery */}
            <View style={[styles.galleryColumn, isDesktop && { width: '50%' }]}>
              {/* Main Large Image */}
              <View style={styles.mainImageContainer}>
                <Image
                  source={{ uri: product.images[selectedImageIndex] || product.images[0] }}
                  style={styles.mainImage}
                  resizeMode="cover"
                />

                {/* Eco Badge */}
                {product.isEco && (
                  <View style={styles.imageEcoBadge}>
                    <Ionicons name="leaf" size={13} color={colors.ecoGreen} />
                    <Text style={styles.imageEcoText}>100% Sustainable Craft</Text>
                  </View>
                )}

                {/* Wishlist Button on image */}
                <Pressable
                  onPress={() => toggleWishlist(product.id)}
                  style={styles.imageWishlistBtn}
                  hitSlop={8}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name={wishlisted ? 'heart' : 'heart-outline'}
                    size={22}
                    color={wishlisted ? colors.terracotta : colors.charcoal}
                  />
                </Pressable>
              </View>

              {/* Thumbnails Row */}
              {product.images.length > 1 && (
                <View style={styles.thumbnailsRow}>
                  {product.images.map((img, idx) => {
                    const isSelected = selectedImageIndex === idx;
                    return (
                      <Pressable
                        key={idx}
                        onPress={() => setSelectedImageIndex(idx)}
                        style={[
                          styles.thumbnailWrapper,
                          isSelected && styles.thumbnailWrapperSelected,
                        ]}
                      >
                        <Image source={{ uri: img }} style={styles.thumbnailImg} resizeMode="cover" />
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Right Column: Details & Actions */}
            <View style={[styles.detailsColumn, isDesktop && { width: '47%' }]}>
              {/* Category & Region */}
              <View style={styles.metaBadgeRow}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{product.category.toUpperCase()}</Text>
                </View>
                <Text style={styles.originText}>📍 {product.creatorLocation}</Text>
              </View>

              {/* Product Name */}
              <Text style={styles.productTitle}>{product.name}</Text>

              {/* Creator Byline */}
              <Pressable
                onPress={() => navigation.navigate('CreatorProfile', { creatorId: product.creatorId })}
                style={styles.creatorByline}
              >
                <Text style={styles.creatorBylineText}>
                  Handcrafted by <Text style={styles.creatorBylineName}>{product.creatorName}</Text> ({product.creatorBrand})
                </Text>
                <Ionicons name="chevron-forward" size={14} color={colors.goldDeep} />
              </Pressable>

              {/* Rating and Reviews */}
              <View style={styles.ratingSection}>
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingScore}>{product.rating.toFixed(1)}</Text>
                  <Ionicons name="star" size={14} color={colors.gold} />
                </View>
                <Text style={styles.verifiedReviewsText}>
                  {product.reviewCount} Verified Customer Reviews
                </Text>
                <Text style={styles.bulletSeparator}>•</Text>
                <Text style={styles.prepTimeText}>Made in {product.preparationDays} days</Text>
              </View>

              {/* Pricing Section */}
              <View style={styles.priceContainer}>
                <Text style={styles.mainPrice}>₹{product.price}</Text>
                {product.originalPrice && (
                  <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
                )}
                {discountPercent !== null && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>{discountPercent}% OFF</Text>
                  </View>
                )}
              </View>
              <Text style={styles.taxInclusiveText}>Inclusive of all taxes • Free Pune delivery above ₹499</Text>

              {/* Description */}
              <Text style={styles.descriptionText}>{product.description}</Text>

              {/* Digital Handmade Passport Feature Card */}
              <Pressable
                onPress={() => setShowPassport(true)}
                style={styles.passportCard}
                accessibilityRole="button"
              >
                <View style={styles.passportLeft}>
                  <View style={styles.passportIconCircle}>
                    <MaterialCommunityIcons name="certificate" size={24} color={colors.gold} />
                  </View>
                  <View>
                    <Text style={styles.passportBadge}>AUTHENTICITY & HERITAGE</Text>
                    <Text style={styles.passportTitle}>Digital Handmade Passport</Text>
                    <Text style={styles.passportSub}>{product.passport.hoursToCraft} • Natural Materials</Text>
                  </View>
                </View>
                <View style={styles.passportRightBtn}>
                  <Text style={styles.passportViewText}>View Passport</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.goldDeep} />
                </View>
              </Pressable>

              {/* Quantity Selector & CTAs */}
              <View style={styles.actionSection}>
                <View style={styles.quantityRow}>
                  <Text style={styles.quantityLabel}>Quantity:</Text>
                  <View style={styles.quantityCounter}>
                    <Pressable
                      onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                      style={styles.quantityBtn}
                      hitSlop={8}
                    >
                      <Ionicons name="remove" size={16} color={colors.charcoal} />
                    </Pressable>
                    <Text style={styles.quantityValue}>{quantity}</Text>
                    <Pressable
                      onPress={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      style={styles.quantityBtn}
                      hitSlop={8}
                    >
                      <Ionicons name="add" size={16} color={colors.charcoal} />
                    </Pressable>
                  </View>
                  <Text style={styles.stockNote}>({product.stock} pieces in stock)</Text>
                </View>

                {/* Primary Action Buttons */}
                <View style={styles.buttonGroup}>
                  {/* Customize Button */}
                  <Pressable
                    onPress={() => navigation.navigate('Customize', { productId: product.id })}
                    style={styles.customizeButton}
                    accessibilityRole="button"
                  >
                    <Ionicons name="sparkles" size={18} color={colors.gold} />
                    <Text style={styles.customizeButtonText}>Customize This Creation</Text>
                  </Pressable>

                  {/* Add to Cart Button */}
                  <Pressable
                    onPress={handleAddToCart}
                    style={styles.addToCartButton}
                    accessibilityRole="button"
                  >
                    <Ionicons name="bag-handle-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.addToCartButtonText}>Add to Cart • ₹{product.price * quantity}</Text>
                  </Pressable>
                </View>

                {/* Toast Feedback */}
                {addedToast && (
                  <View style={styles.addedToast}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.ecoGreen} />
                    <Text style={styles.addedToastText}>Added {quantity} to your cart!</Text>
                    <Pressable onPress={() => navigation.navigate('Cart')}>
                      <Text style={styles.toastCartLink}>View Cart →</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* 9. MEET THE MAKER SECTION (Prompt Section 9) */}
          <View style={styles.makerSection}>
            <View style={styles.makerSectionHeader}>
              <Text style={styles.makerSectionEyebrow}>ARTISAN STORY</Text>
              <Text style={styles.makerSectionTitle}>Meet the Maker</Text>
            </View>

            <View style={styles.makerCard}>
              <View style={styles.makerTopRow}>
                <Image source={{ uri: creator.avatar }} style={styles.makerCardAvatar} />
                <View style={styles.makerCardInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.makerCardName}>{creator.name}</Text>
                    {creator.verified && (
                      <Ionicons name="checkmark-circle" size={16} color={colors.gold} />
                    )}
                  </View>
                  <Text style={styles.makerCardBrand}>{creator.brand}</Text>
                  <Text style={styles.makerCardLocation}>📍 {creator.location}</Text>
                  <Text style={styles.makerCardCraft}>{creator.craft}</Text>
                </View>
              </View>

              <Text style={styles.makerStoryBody}>{creator.story}</Text>

              {/* Maker Action Buttons */}
              <View style={styles.makerButtonsRow}>
                <Pressable
                  onPress={() => navigation.navigate('CreatorProfile', { creatorId: creator.id })}
                  style={styles.makerViewProfileBtn}
                >
                  <Text style={styles.makerViewProfileText}>View Profile</Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    navigation.navigate('Category', {
                      categoryId: product.categoryId,
                      categoryName: `${creator.name}’s Creations`,
                    })
                  }
                  style={styles.makerSeeCreationsBtn}
                >
                  <Text style={styles.makerSeeCreationsText}>See More Creations</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.charcoal} />
                </Pressable>
              </View>
            </View>
          </View>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedHeading}>More Handcrafted in {product.category}</Text>
              <View style={styles.relatedGrid}>
                {relatedProducts.map((p) => (
                  <View
                    key={p.id}
                    style={[styles.productGridItem, { width: isDesktop ? '23.5%' : '48%' }]}
                  >
                    <ProductCard product={p} />
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Digital Handmade Passport Modal */}
      <DigitalPassportModal
        visible={showPassport}
        product={product}
        onClose={() => setShowPassport(false)}
      />

      <BottomNavigation activeTab="explore" />
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
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryBreadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbMuted: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  breadcrumbActive: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.goldDeep,
  },
  mainLayout: {
    flexDirection: 'column',
    gap: 24,
  },
  mainLayoutDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 36,
  },
  galleryColumn: {
    width: '100%',
  },
  mainImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    position: 'relative',
    ...shadow.medium,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageEcoBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  imageEcoText: {
    fontFamily: fonts.sans.medium,
    fontSize: 11.5,
    color: colors.ecoGreen,
  },
  imageWishlistBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadow.soft,
  },
  thumbnailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  thumbnailWrapper: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  thumbnailWrapperSelected: {
    borderColor: colors.gold,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  detailsColumn: {
    width: '100%',
  },
  metaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: '#FFF8E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.goldDim,
  },
  categoryBadgeText: {
    fontFamily: fonts.sans.bold,
    fontSize: 10.5,
    color: colors.goldDeep,
    letterSpacing: 1.2,
  },
  originText: {
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    color: colors.textMuted,
  },
  productTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 26,
    lineHeight: 34,
    color: colors.charcoal,
    marginBottom: 8,
  },
  creatorByline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 14,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  creatorBylineText: {
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    color: colors.textSecondary,
  },
  creatorBylineName: {
    fontFamily: fonts.sans.semibold,
    color: colors.charcoal,
    textDecorationLine: 'underline',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  ratingScore: {
    fontFamily: fonts.sans.bold,
    fontSize: 13,
    color: colors.charcoal,
  },
  verifiedReviewsText: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  bulletSeparator: {
    color: colors.textMuted,
  },
  prepTimeText: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.goldDeep,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginTop: 4,
  },
  mainPrice: {
    fontFamily: fonts.sans.bold,
    fontSize: 28,
    color: colors.charcoal,
  },
  originalPrice: {
    fontFamily: fonts.sans.regular,
    fontSize: 18,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: colors.terracotta,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountBadgeText: {
    fontFamily: fonts.sans.bold,
    fontSize: 11,
    color: '#FFFFFF',
  },
  taxInclusiveText: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  descriptionText: {
    fontFamily: fonts.sans.regular,
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  passportCard: {
    backgroundColor: '#FFFDF9',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.goldDim,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  passportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  passportIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF6E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passportBadge: {
    fontFamily: fonts.sans.bold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.goldDeep,
  },
  passportTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 15,
    color: colors.charcoal,
  },
  passportSub: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  passportRightBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  passportViewText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    color: colors.goldDeep,
  },
  actionSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
    ...shadow.soft,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  quantityLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: 13.5,
    color: colors.charcoal,
  },
  quantityCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 4,
  },
  quantityBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityValue: {
    fontFamily: fonts.sans.bold,
    fontSize: 14,
    paddingHorizontal: 8,
    color: colors.charcoal,
  },
  stockNote: {
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    color: colors.textMuted,
  },
  buttonGroup: {
    flexDirection: 'column',
    gap: 10,
  },
  customizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.gold,
    height: 48,
    borderRadius: radius.md,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  customizeButtonText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14.5,
    color: colors.charcoal,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.charcoal,
    height: 50,
    borderRadius: radius.md,
    ...shadow.medium,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  addToCartButtonText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  addedToast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0F9F1',
    borderWidth: 1,
    borderColor: '#C2E5C5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.md,
    marginTop: 12,
  },
  addedToastText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.ecoGreen,
  },
  toastCartLink: {
    fontFamily: fonts.sans.bold,
    fontSize: 13,
    color: colors.charcoal,
  },
  makerSection: {
    marginTop: 48,
  },
  makerSectionHeader: {
    marginBottom: 16,
  },
  makerSectionEyebrow: {
    fontFamily: fonts.sans.bold,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.goldDeep,
  },
  makerSectionTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 24,
    color: colors.charcoal,
  },
  makerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 24,
    ...shadow.soft,
  },
  makerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  makerCardAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  makerCardInfo: {
    flex: 1,
  },
  makerCardName: {
    fontFamily: fonts.serif.bold,
    fontSize: 18,
    color: colors.charcoal,
  },
  makerCardBrand: {
    fontFamily: fonts.sans.medium,
    fontSize: 13.5,
    color: colors.goldDeep,
  },
  makerCardLocation: {
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  makerCardCraft: {
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  makerStoryBody: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  makerButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  makerViewProfileBtn: {
    backgroundColor: colors.charcoal,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  makerViewProfileText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  makerSeeCreationsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.marketplaceBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: radius.full,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  makerSeeCreationsText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.charcoal,
  },
  relatedSection: {
    marginTop: 48,
  },
  relatedHeading: {
    fontFamily: fonts.serif.bold,
    fontSize: 22,
    color: colors.charcoal,
    marginBottom: 16,
  },
  relatedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productGridItem: {
    marginBottom: 8,
  },
});
