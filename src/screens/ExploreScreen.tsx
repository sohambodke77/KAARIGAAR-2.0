import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';
import { fonts, light } from '../theme';
import type { CustomerStackParamList, CustomerTabParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;
type Route = RouteProp<CustomerTabParamList, 'ExploreTab'>;

const SORTS = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Top Rated'] as const;

export function ExploreScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { width } = useWindowDimensions();

  const [query, setQuery] = useState<string>(route.params?.q ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [sort, setSort] = useState<(typeof SORTS)[number]>('Featured');

  const columns = width < 640 ? 2 : width < 1100 ? 3 : 4;
  const gap = 12;
  const cardWidth = Math.floor((Math.min(width, 1200) - 32 - gap * (columns - 1)) / columns);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = PRODUCTS.filter((p) => {
      const matchesCat = categoryId ? p.categoryId === categoryId : true;
      const matchesQ = q
        ? p.name.toLowerCase().includes(q) ||
          p.blurb.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        : true;
      return matchesCat && matchesQ;
    });

    if (sort === 'Price: Low to High') list = [...list].sort((a, b) => a.price - b.price);
    if (sort === 'Price: High to Low') list = [...list].sort((a, b) => b.price - a.price);
    if (sort === 'Top Rated') list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [query, categoryId, sort]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <Text style={styles.subtitle}>{results.length} handmade creations</Text>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar value={query} onChangeText={setQuery} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        <Pressable
          onPress={() => setCategoryId(null)}
          style={[styles.chip, categoryId === null && styles.chipActive]}
        >
          <Text style={[styles.chipText, categoryId === null && styles.chipTextActive]}>All</Text>
        </Pressable>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => setCategoryId(categoryId === c.id ? null : c.id)}
            style={[styles.chip, categoryId === c.id && styles.chipActive]}
          >
            <Text style={[styles.chipText, categoryId === c.id && styles.chipTextActive]}>{c.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.sortRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortList}>
          {SORTS.map((s) => (
            <Pressable key={s} onPress={() => setSort(s)} style={[styles.sortPill, sort === s && styles.sortPillActive]}>
              <Text style={[styles.sortText, sort === s && styles.sortTextActive]}>{s}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridWrap}>
        {results.length === 0 ? (
          <EmptyState
            icon="search-outline"
            title="No creations found"
            subtitle="Try a different search or category — something handmade is waiting."
            ctaLabel="Clear filters"
            onCta={() => {
              setQuery('');
              setCategoryId(null);
            }}
          />
        ) : (
          <View style={styles.grid}>
            {results.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                width={cardWidth}
                onPress={() => navigation.navigate('Product', { id: p.id })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: light.bg,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  title: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 24,
  },
  subtitle: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    marginTop: 2,
  },
  searchWrap: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  chips: {
    paddingHorizontal: 16,
    gap: 8,
    paddingVertical: 14,
  },
  chip: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: light.lineStrong,
    backgroundColor: light.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#2E1B10',
    borderColor: '#2E1B10',
  },
  chipText: {
    color: light.inkMuted,
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
  },
  chipTextActive: {
    color: '#FFF8EC',
  },
  sortRow: {
    paddingBottom: 4,
  },
  sortList: {
    paddingHorizontal: 16,
    gap: 6,
  },
  sortPill: {
    paddingHorizontal: 12,
    height: 30,
    borderRadius: 999,
    backgroundColor: light.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortPillActive: {
    backgroundColor: 'rgba(212, 163, 89, 0.18)',
  },
  sortText: {
    color: light.inkMuted,
    fontFamily: fonts.sans.medium,
    fontSize: 12,
  },
  sortTextActive: {
    color: '#A9823A',
    fontFamily: fonts.sans.semibold,
  },
  gridWrap: {
    padding: 16,
    paddingTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});