import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { getCreator } from '../data/creators';
import type { Product } from '../data/products';
import { RatingStars } from './RatingStars';
import { ProductCover } from './ProductCover';
import { useMarket } from '../context/MarketContext';
import { colors, fonts, light } from '../theme';

interface ProductCardProps {
  product: Product;
  width: number;
  onPress: () => void;
}

function price(value: number): string {
  return `₹${value.toLocaleString('en-IN')}`;
}

export function ProductCard({ product, width, onPress }: ProductCardProps) {
  const { wishlist, toggleWishlist, addToCart } = useMarket();
  const creator = getCreator(product.creatorId);
  const wished = wishlist.includes(product.id);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { width }, pressed && { opacity: 0.88 }]}
      accessibilityRole="button"
      accessibilityLabel={product.name}
    >
      <View>
        <ProductCover
          categoryId={product.categoryId}
          label={product.name}
          height={width * 0.9}
          feature={product.feature}
        />
        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          hitSlop={10}
          style={styles.heart}
          accessibilityRole="button"
          accessibilityLabel={wished ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Ionicons
            name={wished ? 'heart' : 'heart-outline'}
            size={17}
            color={wished ? '#C05238' : light.surface}
          />
        </Pressable>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.creator} numberOfLines={1}>
          by {creator.name}
        </Text>

        <View style={styles.priceRow}>
          <View style={styles.ratingLine}>
            <RatingStars rating={product.rating} reviews={product.reviews} />
          </View>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              addToCart(product.id);
            }}
            hitSlop={8}
            style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.8 }]}
            accessibilityRole="button"
            accessibilityLabel={`Add ${product.name} to cart`}
          >
            <Ionicons name="add" size={18} color={colors.buttonText} />
          </Pressable>
        </View>

        <View style={styles.priceLine}>
          <Text style={styles.price}>{price(product.price)}</Text>
          {product.compareAt ? <Text style={styles.compare}>{price(product.compareAt)}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: light.surface,
    borderWidth: 1,
    borderColor: light.line,
    overflow: 'hidden',
  },
  heart: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(36, 26, 17, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: 10,
    gap: 3,
  },
  name: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    lineHeight: 17,
    minHeight: 34,
  },
  creator: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  ratingLine: {
    flexShrink: 1,
  },
  addBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.goldGradientStart,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  priceLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  price: {
    color: light.ink,
    fontFamily: fonts.sans.bold,
    fontSize: 15,
  },
  compare: {
    color: light.inkFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
});