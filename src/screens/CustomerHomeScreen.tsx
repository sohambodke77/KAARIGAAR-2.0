import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { CATEGORIES } from '../data/categories';
import { CREATORS } from '../data/creators';
import { PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { SectionHeader } from '../components/SectionHeader';
import { ProductCover } from '../components/ProductCover';
import { useMarket } from '../context/MarketContext';
import { fonts, light, radius, colors } from '../theme';
import type { CustomerStackParamList, CustomerTabParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;
type Tab = BottomTabNavigationProp<CustomerTabParamList>;

export function CustomerHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  const { cart, wishlist } = useMarket();
  const [search, setSearch] = useState('');

  const cardWidth = width < 640 ? 158 : 182;

  const goSearch = () => {
    const tab = navigation as unknown as Tab;
    tab.navigate('ExploreTab', { q: search.trim() });
  };

  const trending = PRODUCTS.filter((p) => p.rating >= 4.7).slice(0, 8);
  const pocket = [...PRODUCTS].sort((a, b) => a.price - b.price).slice(0, 8);
  const rated = [...PRODUCTS].sort((a, b) => b.rating - a.rating).slice(0, 8);
  const newCreators = [...PRODUCTS].reverse().slice(0, 8);
  const nearPune = PRODUCTS.filter((p) =>
    ['Pune', 'Mumbai'].some((c) => getCreator(p.creatorId).location.includes(c)),
  );
  const gifts = PRODUCTS.filter((p) => p.categoryId === 'gifts' || p.feature === 'handmade').slice(0, 8);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Text style={styles.brandTitle}>KARIGAAR</Text>
            <Text style={styles.brandSub}>कारीGaar</Text>
          </View>
          <View style={styles.headerIcons}>
            <Pressable hitSlop={6} style={styles.iconBtn} accessibilityLabel="Delivering to Pune">
              <Ionicons name="location-outline" size={20} color={light.ink} />
            </Pressable>
            <Pressable
              hitSlop={6}
              style={[styles.iconBtn, wishlist.length > 0 && styles.iconBtnActive]}
              onPress={() => navigation.navigate('Wishlist')}
              accessibilityLabel="Wishlist"
            >
              <Ionicons name="heart-outline" size={20} color={light.ink} />
              {wishlist.length > 0 ? <View style={styles.countBadge}><Text style={styles.countText}>{wishlist.length}</Text></View> : null}
            </Pressable>
            <Pressable
              hitSlop={6}
              style={[styles.iconBtn, cart.length > 0 && styles.iconBtnActive]}
              onPress={() => navigation.navigate('Cart')}
              accessibilityLabel="Cart"
            >
              <Ionicons name="bag-handle-outline" size={20} color={light.ink} />
              {cart.length > 0 ? <View style={styles.countBadge}><Text style={styles.countText}>{cart.reduce((s, i) => s + i.qty, 0)}</Text></View> : null}
            </Pressable>
          </View>
        </View>

        {/* Search row */}
        <Pressable style={styles.searchBar} onPress={goSearch} accessibilityRole="search">
          <Ionicons name="search" size={17} color={light.inkMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search handmade products, gifts & creators..."
            placeholderTextColor={light.inkFaint}
            style={styles.searchInput}
            returnKeyType="search"
            onSubmitEditing={goSearch}
            accessibilityLabel="Search handmade products"
          />
          <Text style={styles.searchGo}>Search</Text>
        </Pressable>

        {/* Hero */}
        <LinearGradient
          colors={['#2E1B10', '#6E4526', '#A77038']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Text style={styles.heroKicker}>HAR HAATH KI KAHANI · हर हाथ की कहानी</Text>
          <Text style={styles.heroTitle}>Discover Handmade.{'\n'}Carry the Story.</Text>
          <Text style={styles.heroSub}>
            Unique creations made by real people, discovered in one place.
          </Text>
          <View style={styles.locationLine}>
            <Ionicons name="location" size={13} color="#F3DFA8" />
            <Text style={styles.locationText}>Delivering to Pune</Text>
          </View>
          <View style={styles.heroCtas}>
            <Pressable
              onPress={() => navigation.navigate('Tabs', { screen: 'ExploreTab' })}
              style={({ pressed }) => [styles.heroCtaPrimary, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.heroCtaPrimaryText}>Explore Handmade</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('FindMyMaker')}
              style={({ pressed }) => [styles.heroCtaGhost, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.heroCtaGhostText}>Find My Maker</Text>
            </Pressable>
          </View>
        </LinearGradient>

        {/* Categories */}
        <View style={styles.section}>
          <SectionHeader title="Shop by Category" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => navigation.navigate('Category', { id: c.id })}
                style={({ pressed }) => [styles.categoryCard, pressed && { opacity: 0.9 }]}
                accessibilityRole="button"
                accessibilityLabel={c.name}
              >
                <ProductCover categoryId={c.id} label={c.name} height={84} width={112} />
                <Text style={styles.categoryName} numberOfLines={2}>{c.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Product sections */}
        <Section title="Trending Handmade Products" onSeeAll={() => navigation.navigate('Tabs', { screen: 'ExploreTab' })}>
          {trending.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              width={cardWidth}
              onPress={() => navigation.navigate('Product', { id: p.id })}
            />
          ))}
        </Section>

        <Section title="Pocket-Friendly Treasures">
          {pocket.map((p) => (
            <ProductCard key={p.id} product={p} width={cardWidth} onPress={() => navigation.navigate('Product', { id: p.id })} />
          ))}
        </Section>

        <Section title="Highly Rated Craftsmanship">
          {rated.map((p) => (
            <ProductCard key={p.id} product={p} width={cardWidth} onPress={() => navigation.navigate('Product', { id: p.id })} />
          ))}
        </Section>

        <Section title="New from Creators">
          {newCreators.map((p) => (
            <ProductCard key={p.id} product={p} width={cardWidth} onPress={() => navigation.navigate('Product', { id: p.id })} />
          ))}
        </Section>

        <Section title="Made Near You">
          {nearPune.map((p) => (
            <ProductCard key={p.id} product={p} width={cardWidth} onPress={() => navigation.navigate('Product', { id: p.id })} />
          ))}
        </Section>

        <Section title="Perfect Gifts">
          {gifts.map((p) => (
            <ProductCard key={p.id} product={p} width={cardWidth} onPress={() => navigation.navigate('Product', { id: p.id })} />
          ))}
        </Section>

        {/* Stories banner */}
        <Pressable
          onPress={() => navigation.navigate('Stories')}
          style={({ pressed }) => [styles.storiesBanner, pressed && { opacity: 0.92 }]}
        >
          <View style={styles.storiesLeft}>
            <Text style={styles.storiesTitle}>Stories Carved in Hand & Heart</Text>
            <Text style={styles.storiesSub}>Meet the people behind the creations.</Text>
            <Text style={styles.storiesCta}>Explore Stories →</Text>
          </View>
          <Ionicons name="images-outline" size={44} color="rgba(255,248,236,0.85)" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function getCreator(id: string) {
  return CREATORS.find((c) => c.id === id) ?? CREATORS[0];
}

function Section({ title, onSeeAll, children }: { title: string; onSeeAll?: () => void; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <SectionHeader title={title} actionLabel={onSeeAll ? 'See all' : undefined} onAction={onSeeAll} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: light.bg,
  },
  scroll: {
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  brandBlock: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  brandTitle: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 21,
    letterSpacing: 1.5,
  },
  brandSub: {
    color: '#A9823A',
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    letterSpacing: 1,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnActive: {
    backgroundColor: light.surface,
  },
  countBadge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#B98A2E',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  countText: {
    color: '#FFF8EC',
    fontFamily: fonts.sans.bold,
    fontSize: 9.5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: light.surface,
    borderWidth: 1,
    borderColor: light.lineStrong,
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: light.ink,
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    paddingVertical: 0,
  },
  searchGo: {
    color: '#A9823A',
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
  },
  hero: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: radius.xl,
    padding: 22,
    overflow: 'hidden',
  },
  heroKicker: {
    color: '#F3DFA8',
    fontFamily: fonts.sans.semibold,
    fontSize: 10,
    letterSpacing: 2.4,
    marginBottom: 10,
  },
  heroTitle: {
    color: '#FFF8EC',
    fontFamily: fonts.serif.bold,
    fontSize: 27,
    lineHeight: 34,
  },
  heroSub: {
    color: 'rgba(255,248,236,0.8)',
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: 380,
  },
  locationLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 12,
  },
  locationText: {
    color: '#F3DFA8',
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
  },
  heroCtas: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  heroCtaPrimary: {
    backgroundColor: colors.goldGradientStart,
    paddingHorizontal: 18,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCtaPrimaryText: {
    color: colors.buttonText,
    fontFamily: fonts.sans.semibold,
    fontSize: 13.5,
  },
  heroCtaGhost: {
    borderWidth: 1,
    borderColor: 'rgba(255,248,236,0.4)',
    paddingHorizontal: 18,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCtaGhostText: {
    color: '#FFF8EC',
    fontFamily: fonts.sans.semibold,
    fontSize: 13.5,
  },
  section: {
    marginTop: 26,
  },
  hList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryCard: {
    width: 112,
    gap: 6,
  },
  categoryName: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  storiesBanner: {
    marginHorizontal: 16,
    marginTop: 28,
    borderRadius: radius.xl,
    backgroundColor: '#2E1B10',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storiesLeft: {
    flex: 1,
    gap: 6,
  },
  storiesTitle: {
    color: '#FFF8EC',
    fontFamily: fonts.serif.bold,
    fontSize: 19,
  },
  storiesSub: {
    color: 'rgba(255,248,236,0.7)',
    fontFamily: fonts.sans.regular,
    fontSize: 13,
  },
  storiesCta: {
    color: '#F3DFA8',
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    marginTop: 4,
  },
});