import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { CartItem } from '../context/MarketContext';
import { getProduct } from '../data/products';
import { getCreator } from '../data/creators';
import { QtyStepper } from './QtyStepper';
import { ProductCover } from './ProductCover';
import { useMarket } from '../context/MarketContext';
import { fonts, light } from '../theme';

interface CartRowProps {
  item: CartItem;
  onPress?: () => void;
}

export function CartRow({ item, onPress }: CartRowProps) {
  const { updateCartQty, removeFromCart } = useMarket();
  const product = getProduct(item.productId);
  const creator = getCreator(product.creatorId);
  const unitPrice = product.price * (item.customization ? 1.25 : 1);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
      accessibilityRole="button"
    >
      <ProductCover categoryId={product.categoryId} label={product.name} width={78} height={78} />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.creator}>by {creator.name}</Text>
        {item.customization ? (
          <View style={styles.customChip}>
            <Ionicons name="color-wand-outline" size={11} color="#A9823A" />
            <Text style={styles.customText}>
              {item.customization.name || item.customization.size || 'Customised'}
            </Text>
          </View>
        ) : null}
        <View style={styles.bottomRow}>
          <Text style={styles.price}>₹{unitPrice.toLocaleString('en-IN')}</Text>
          <QtyStepper qty={item.qty} onChange={(q) => updateCartQty(item.key, q)} />
        </View>
      </View>
      <Pressable
        onPress={() => removeFromCart(item.key)}
        hitSlop={8}
        style={styles.remove}
        accessibilityRole="button"
        accessibilityLabel="Remove from cart"
      >
        <Ionicons name="trash-outline" size={17} color={light.danger} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: light.line,
    padding: 12,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
    lineHeight: 18,
  },
  creator: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12,
  },
  customChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212, 163, 89, 0.14)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  customText: {
    color: '#A9823A',
    fontFamily: fonts.sans.medium,
    fontSize: 10.5,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  price: {
    color: light.ink,
    fontFamily: fonts.sans.bold,
    fontSize: 15,
  },
  remove: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(192, 82, 56, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});