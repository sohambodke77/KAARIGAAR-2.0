import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getCreator } from '../data/creators';
import { PRODUCTS } from '../data/products';
import { PageHeader } from '../components/PageHeader';
import { Avatar } from '../components/Avatar';
import { RatingStars } from '../components/RatingStars';
import { Badge } from '../components/Badge';
import { ProductCard } from '../components/ProductCard';
import { useMarket } from '../context/MarketContext';
import { fonts, light } from '../theme';
import type { CustomerStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;
type Route = RouteProp<CustomerStackParamList, 'Creator'>;

export function CreatorScreen() {
  const navigation = useNavigation<Nav>();
  const { id } = useRoute<Route>().params;
  const { width } = useWindowDimensions();
  const { savedCreators, toggleSavedCreator } = useMarket();

  const creator = getCreator(id);
  const saved = savedCreators.includes(id);
  const products = useMemo(() => PRODUCTS.filter((p) => p.creatorId === id), [id]);

  const columns = width < 640 ? 2 : width < 1100 ? 3 : 4;
  const gap = 12;
  const cardWidth = Math.floor((Math.min(width, 1200) - 32 - gap * (columns - 1)) / columns);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PageHeader
        title={creator.brand}
        fallback={() => navigation.navigate('Tabs', { screen: 'HomeTab' })}
        right={
          <Pressable
            onPress={() => toggleSavedCreator(id)}
            style={[styles.saveBtn, saved && styles.saveBtnActive]}
            accessibilityRole="button"
            accessibilityLabel={saved ? 'Unsave creator' : 'Save creator'}
          >
            <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={19} color={saved ? light.danger : light.ink} />
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.heroCard}>
          <Avatar label={creator.name} size={84} />
          <Text style={styles.name}>{creator.name}</Text>
          <Text style={styles.brand}>{creator.brand}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={14} color={light.inkMuted} />
            <Text style={styles.metaText}>{creator.location}</Text>
            <Ionicons name="time-outline" size={14} color={light.inkMuted} />
            <Text style={styles.metaText}>{creator.yearsActive} years of craft</Text>
          </View>
          <RatingStars rating={creator.rating} reviews={creator.reviews} />
          <View style={styles.chips}>
            {creator.craft.map((c) => (
              <Badge key={c} text={c} />
            ))}
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.h2}>About the maker</Text>
          <Text style={styles.body}>{creator.story}</Text>
        </View>

        <View style={styles.statsRow}>
          <Stat value={String(creator.creationsCount)} label="Creations" />
          <Stat value={String(creator.reviews)} label="Reviews" />
          <Stat value={creator.priceRange} label="Price range" />
          <Stat value={`~${creator.aveTime}d`} label="Avg. time" />
        </View>

        <View style={styles.block}>
          <Text style={styles.h2}>Creations ({products.length})</Text>
          {products.length === 0 ? (
            <Text style={styles.body}>No live creations right now.</Text>
          ) : (
            <View style={styles.grid}>
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  width={cardWidth}
                  onPress={() => navigation.navigate('Product', { id: p.id })}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: light.bg,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  saveBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: light.lineStrong,
    backgroundColor: light.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnActive: {
    backgroundColor: 'rgba(192, 82, 56, 0.1)',
  },
  heroCard: {
    backgroundColor: light.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: light.line,
    padding: 22,
    alignItems: 'center',
    gap: 8,
  },
  name: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 21,
    marginTop: 4,
  },
  brand: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    marginRight: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
    justifyContent: 'center',
  },
  block: {
    marginTop: 22,
    gap: 10,
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
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  stat: {
    flex: 1,
    backgroundColor: light.surfaceAlt,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    color: light.ink,
    fontFamily: fonts.sans.bold,
    fontSize: 14,
    textAlign: 'center',
  },
  statLabel: {
    color: light.inkFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 10.5,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});