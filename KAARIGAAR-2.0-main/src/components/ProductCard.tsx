import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useMarketplace, type Product } from '../context/MarketplaceContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadow } from '../theme';

interface ProductCardProps {
  product: Product;
  width?: number | string;
}

export function ProductCard({ product, width }: ProductCardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { toggleWishlist, isWishlisted, addToCart } = useMarketplace();

  const wishlisted = isWishlisted(product.id);
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const handleCardPress = () => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const handleAddToCart = (e: any) => {
    e?.stopPropagation?.();
    addToCart(product, 1);
  };

  const handleToggleWishlist = (e: any) => {
    e?.stopPropagation?.();
    toggleWishlist(product.id);
  };

  return (
    <Pressable
      onPress={handleCardPress}
      style={({ pressed }) => [
        styles.card,
        width !== undefined && { width: width as any },
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${product.name} by ${product.creatorName}`}
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Eco or Handmade Badge */}
        {product.isEco ? (
          <View style={styles.ecoBadge}>
            <Ionicons name="leaf-outline" size={11} color={colors.ecoGreen} />
            <Text style={styles.ecoBadgeText}>Eco-Craft</Text>
          </View>
        ) : (
          <View style={styles.handmadeBadge}>
            <Text style={styles.handmadeBadgeText}>Handmade</Text>
          </View>
        )}

        {/* Wishlist Heart */}
        <Pressable
          onPress={handleToggleWishlist}
          style={styles.wishlistButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Wishlist item"
        >
          <Ionicons
            name={wishlisted ? 'heart' : 'heart-outline'}
            size={18}
            color={wishlisted ? colors.terracotta : colors.charcoal}
          />
        </Pressable>

        {/* Discount Badge */}
        {discountPercent !== null && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% OFF</Text>
          </View>
        )}
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.creatorText} numberOfLines={1}>
          by <Text style={styles.creatorBold}>{product.creatorName}</Text>
        </Text>

        <Text style={styles.productTitle} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Rating and Price Row */}
        <View style={styles.ratingRow}>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingNumber}>{product.rating.toFixed(1)}</Text>
            <Ionicons name="star" size={12} color={colors.gold} />
          </View>
          <Text style={styles.reviewCount}>({product.reviewCount})</Text>
          <Text style={styles.dotSeparator}>•</Text>
          <Text style={styles.localityText} numberOfLines={1}>
            {product.creatorLocation.split(',')[0]}
          </Text>
        </View>

        {/* Footer: Price & Add Button */}
        <View style={styles.footerRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>₹{product.price}</Text>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
            )}
          </View>

          <Pressable
            onPress={handleAddToCart}
            style={({ pressed }) => [
              styles.addButton,
              pressed && styles.addButtonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Add ${product.name} to cart`}
          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    ...shadow.soft,
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        } as never)
      : {}),
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.95,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.marketplaceBg,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  ecoBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  ecoBadgeText: {
    fontFamily: fonts.sans.medium,
    fontSize: 10.5,
    color: colors.ecoGreen,
  },
  handmadeBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  handmadeBadgeText: {
    fontFamily: fonts.sans.medium,
    fontSize: 10.5,
    color: colors.textSecondary,
  },
  wishlistButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadow.soft,
  },
  discountBadge: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    backgroundColor: colors.terracotta,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4,
  },
  discountText: {
    fontFamily: fonts.sans.bold,
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  infoContainer: {
    padding: 12,
  },
  creatorText: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  creatorBold: {
    fontFamily: fonts.sans.medium,
    color: colors.charcoal,
  },
  productTitle: {
    fontFamily: fonts.serif.medium,
    fontSize: 15,
    lineHeight: 20,
    color: colors.textPrimary,
    minHeight: 40,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    marginBottom: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingNumber: {
    fontFamily: fonts.sans.semibold,
    fontSize: 12.5,
    color: colors.textPrimary,
  },
  reviewCount: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    color: colors.textMuted,
  },
  dotSeparator: {
    fontSize: 10,
    color: colors.textMuted,
    marginHorizontal: 2,
  },
  localityText: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    color: colors.textMuted,
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorderSubtle,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  currentPrice: {
    fontFamily: fonts.sans.bold,
    fontSize: 17,
    color: colors.textPrimary,
  },
  originalPrice: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.charcoal,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  addButtonPressed: {
    backgroundColor: colors.gold,
  },
  addButtonText: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: '#FFFFFF',
  },
});
