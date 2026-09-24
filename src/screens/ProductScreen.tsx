import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getProduct } from '../data/products';
import { getCreator } from '../data/creators';
import { getCategory } from '../data/categories';
import { PageHeader } from '../components/PageHeader';
import { ProductCover } from '../components/ProductCover';
import { RatingStars } from '../components/RatingStars';
import { Badge } from '../components/Badge';
import { QtyStepper } from '../components/QtyStepper';
import { Avatar } from '../components/Avatar';
import { useMarket } from '../context/MarketContext';
import { colors, fonts, light } from '../theme';
import type { CustomerStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;
type Route = RouteProp<CustomerStackParamList, 'Product'>;

export function ProductScreen() {
  const navigation = useNavigation<Nav>();
  const { id } = useRoute<Route>().params;
  const { addToCart, wishlist, toggleWishlist } = useMarket();

  const product = getProduct(id);
  const creator = getCreator(product.creatorId);
  const category = getCategory(product.categoryId);
  const wished = wishlist.includes(product.id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const discount = product.compareAt
    ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
    : null;

  const handleAdd = () => {
    addToCart(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PageHeader
        title=""
        fallback={() => navigation.navigate('Tabs', { screen: 'HomeTab' })}
        right={
          <Pressable
            onPress={() => toggleWishlist(product.id)}
            style={[styles.heartBtn, wished && styles.heartBtnActive]}
            accessibilityRole="button"
            accessibilityLabel={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Ionicons name={wished ? 'heart' : 'heart-outline'} size={19} color={wished ? light.danger : light.ink} />
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.gallery}>
          <ProductCover categoryId={product.categoryId} label={product.name} height={300} feature={product.feature} />
        </View>

        {/* Title block */}
        <View style={styles.block}>
          <View style={styles.badgeRow}>
            <Badge text={category.name} />
            <Text style={styles.creatorLinkText}>by {creator.name}</Text>
          </View>
          <Text style={styles.name}>{product.name}</Text>
          <RatingStars rating={product.rating} reviews={product.reviews} />
        </View>

        {/* Price */}
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{product.price.toLocaleString('en-IN')}</Text>
          {product.compareAt ? <Text style={styles.compare}>₹{product.compareAt.toLocaleString('en-IN')}</Text> : null}
          {discount ? <Badge text={`${discount}% OFF`} tone="eco" /> : null}
        </View>

        <View style={styles.block}>
          <Text style={styles.h2}>About this creation</Text>
          <Text style={styles.body}>{product.description}</Text>
        </View>

        {/* Digital Handmade Passport */}
        <View style={styles.passport}>
          <View style={styles.passportHead}>
            <Ionicons name="id-card-outline" size={18} color="#A9823A" />
            <Text style={styles.passportTitle}>Digital Handmade Passport</Text>
          </View>
          <View style={styles.passportGrid}>
            <PassportRow label="Creator" value={creator.name} />
            <PassportRow label="Craft category" value={category.name} />
            <PassportRow label="Made in" value={creator.location} />
            <PassportRow label="Materials" value={product.materials.join(', ')} />
            <PassportRow label="Dimensions" value={product.dimensions} />
            <PassportRow label="Creation time" value={`~${product.estimatedDays} days`} />
            <PassportRow label="Preparation" value="Handmade to order" />
            <PassportRow label="Verification" value="Story & process shared by creator · not a government certification" />
          </View>
        </View>

        {/* Meet the maker */}
        <View style={styles.block}>
          <Text style={styles.h2}>MEET THE MAKER</Text>
          <View style={styles.makerCard}>
            <View style={styles.makerRow}>
              <Avatar label={creator.name} size={56} />
              <View style={styles.makerInfo}>
                <Text style={styles.makerName}>{creator.name}</Text>
                <Text style={styles.makerBrand}>{creator.brand} · {creator.location}</Text>
                <Text style={styles.makerCraft}>{creator.craft.join(' · ')}</Text>
                <RatingStars rating={creator.rating} reviews={creator.reviews} />
              </View>
            </View>
            <Text style={styles.makerStory} numberOfLines={4}>
              {creator.story}
            </Text>
            <View style={styles.makerCtas}>
              <Pressable
                onPress={() => navigation.navigate('Creator', { id: creator.id })}
                style={({ pressed }) => [styles.makerCtaPrimary, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.makerCtaPrimaryText}>View Profile</Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('Category', { id: product.categoryId })}
                style={({ pressed }) => [styles.makerCtaGhost, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.makerCtaGhostText}>See More Creations</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Customize */}
        <Pressable
          onPress={() => navigation.navigate('Customize', { id: product.id })}
          style={({ pressed }) => [styles.customizeCard, pressed && { opacity: 0.92 }]}
        >
          <View style={styles.customizeIcon}>
            <Ionicons name="color-wand-outline" size={22} color="#A9823A" />
          </View>
          <View style={styles.customizeInfo}>
            <Text style={styles.customizeTitle}>Customize This Creation</Text>
            <Text style={styles.customizeSub}>
              Name, message, colors & more · est. from ₹{Math.round(product.price * 1.25).toLocaleString('en-IN')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={light.inkFaint} />
        </Pressable>
      </ScrollView>

      {/* Bottom bar */}
      <View style={styles.bottomBar}>
        <View style={styles.qtyWrap}>
          <Text style={styles.qtyLabel}>Qty</Text>
          <QtyStepper qty={qty} onChange={setQty} max={product.stock || 99} />
        </View>
        <Pressable
          onPress={handleAdd}
          disabled={product.stock === 0}
          style={({ pressed }) => [
            styles.addBtn,
            product.stock === 0 && { backgroundColor: light.lineStrong },
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
          accessibilityRole="button"
        >
          {added ? (
            <View style={styles.addBtnRow}>
              <Ionicons name="checkmark" size={17} color={colors.buttonText} />
              <Text style={styles.addBtnText}>Added!</Text>
            </View>
          ) : (
            <Text style={styles.addBtnText}>{product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</Text>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function PassportRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.passportRow}>
      <Text style={styles.passportLabel}>{label}</Text>
      <Text style={styles.passportValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: light.bg,
  },
  scroll: {
    paddingBottom: 100,
  },
  heartBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: light.lineStrong,
    backgroundColor: light.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtnActive: {
    backgroundColor: 'rgba(192, 82, 56, 0.1)',
  },
  gallery: {
    paddingHorizontal: 16,
  },
  block: {
    paddingHorizontal: 16,
    marginTop: 20,
    gap: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  creatorLinkText: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
  },
  name: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 23,
    lineHeight: 29,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  price: {
    color: light.ink,
    fontFamily: fonts.sans.bold,
    fontSize: 22,
  },
  compare: {
    color: light.inkFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 15,
    textDecorationLine: 'line-through',
  },
  h2: {
    color: light.ink,
    fontFamily: fonts.serif.semibold,
    fontSize: 18,
  },
  body: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  passport: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 89, 0.35)',
    backgroundColor: light.surface,
    padding: 16,
    gap: 12,
  },
  passportHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passportTitle: {
    color: '#A9823A',
    fontFamily: fonts.sans.semibold,
    fontSize: 14.5,
    letterSpacing: 0.3,
  },
  passportGrid: {
    gap: 10,
  },
  passportRow: {
    gap: 2,
  },
  passportLabel: {
    color: light.inkFaint,
    fontFamily: fonts.sans.medium,
    fontSize: 11,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  passportValue: {
    color: light.ink,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    lineHeight: 19,
  },
  makerCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: light.lineStrong,
    backgroundColor: light.surface,
    padding: 16,
    gap: 12,
  },
  makerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  makerInfo: {
    flex: 1,
    gap: 1,
  },
  makerName: {
    color: light.ink,
    fontFamily: fonts.serif.semibold,
    fontSize: 17,
  },
  makerBrand: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
  },
  makerCraft: {
    color: '#A9823A',
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    marginBottom: 2,
  },
  makerStory: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  makerCtas: {
    flexDirection: 'row',
    gap: 10,
  },
  makerCtaPrimary: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#2E1B10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  makerCtaPrimaryText: {
    color: '#FFF8EC',
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
  },
  makerCtaGhost: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 89, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  makerCtaGhostText: {
    color: '#A9823A',
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
  },
  customizeCard: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 89, 0.4)',
    backgroundColor: 'rgba(212, 163, 89, 0.09)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  customizeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212, 163, 89, 0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customizeInfo: {
    flex: 1,
    gap: 2,
  },
  customizeTitle: {
    color: light.ink,
    fontFamily: fonts.serif.semibold,
    fontSize: 16,
  },
  customizeSub: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    lineHeight: 17,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: light.surface,
    borderTopWidth: 1,
    borderTopColor: light.line,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  qtyWrap: {
    gap: 2,
  },
  qtyLabel: {
    color: light.inkMuted,
    fontFamily: fonts.sans.medium,
    fontSize: 11,
  },
  addBtn: {
    flex: 1,
    height: 50,
    borderRadius: 999,
    backgroundColor: colors.goldGradientStart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addBtnText: {
    color: colors.buttonText,
    fontFamily: fonts.sans.bold,
    fontSize: 15,
    letterSpacing: 0.3,
  },
});