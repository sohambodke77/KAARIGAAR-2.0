import { useMemo, useState } from 'react';
import {
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
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton } from '../components/BackButton';
import { BottomNavigation } from '../components/BottomNavigation';
import { MarketplaceHeader } from '../components/MarketplaceHeader';
import { ProductCard } from '../components/ProductCard';
import { useMarketplace } from '../context/MarketplaceContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius } from '../theme';

type CategoryScreenRouteProp = RouteProp<AppStackParamList, 'Category'>;

type FilterType = 'all' | 'pocket' | 'rated' | 'eco';
type SortType = 'featured' | 'priceAsc' | 'priceDesc' | 'rating';

export function CategoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<CategoryScreenRouteProp>();
  const { categoryId, categoryName } = route.params || { categoryId: 'all', categoryName: 'All Creations' };

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { products, categories } = useMarketplace();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [activeSort, setActiveSort] = useState<SortType>('featured');

  const categoryMeta = categories.find((c) => c.id === categoryId);

  // Filter products by category and activeFilter
  const filteredProducts = useMemo(() => {
    let result = products;

    if (categoryId && categoryId !== 'all') {
      if (categoryId === 'trending') {
        result = result.filter((p) => p.isTrending);
      } else if (categoryId === 'pocket-friendly') {
        result = result.filter((p) => p.isPocketFriendly || p.price <= 499);
      } else if (categoryId === 'highly-rated') {
        result = result.filter((p) => p.rating >= 4.8);
      } else {
        result = result.filter((p) => p.categoryId === categoryId);
      }
    }

    if (activeFilter === 'pocket') {
      result = result.filter((p) => p.price <= 499);
    } else if (activeFilter === 'rated') {
      result = result.filter((p) => p.rating >= 4.8);
    } else if (activeFilter === 'eco') {
      result = result.filter((p) => p.isEco);
    }

    if (activeSort === 'priceAsc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (activeSort === 'priceDesc') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (activeSort === 'rating') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, categoryId, activeFilter, activeSort]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <MarketplaceHeader />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Top navigation row with Back Button */}
          <View style={styles.backRow}>
            <BackButton label="Back to Marketplace" fallbackRoute="CustomerHome" />
          </View>

          {/* Category Banner / Heading */}
          <View style={styles.titleBlock}>
            <Text style={styles.categoryTitle}>{categoryName}</Text>
            {categoryMeta?.description && (
              <Text style={styles.categoryDescription}>{categoryMeta.description}</Text>
            )}
            <Text style={styles.productCount}>
              {filteredProducts.length} authentic handmade {filteredProducts.length === 1 ? 'creation' : 'creations'}
            </Text>
          </View>

          {/* Filter & Sort Controls */}
          <View style={styles.controlsRow}>
            {/* Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              <Pressable
                onPress={() => setActiveFilter('all')}
                style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, activeFilter === 'all' && styles.filterTextActive]}>
                  All Creations
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setActiveFilter('pocket')}
                style={[styles.filterChip, activeFilter === 'pocket' && styles.filterChipActive]}
              >
                <Text style={[styles.filterText, activeFilter === 'pocket' && styles.filterTextActive]}>
                  Under ₹499
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setActiveFilter('rated')}
                style={[styles.filterChip, activeFilter === 'rated' && styles.filterChipActive]}
              >
                <Ionicons
                  name="star"
                  size={12}
                  color={activeFilter === 'rated' ? colors.gold : colors.textMuted}
                />
                <Text style={[styles.filterText, activeFilter === 'rated' && styles.filterTextActive]}>
                  4.8+ Rated
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setActiveFilter('eco')}
                style={[styles.filterChip, activeFilter === 'eco' && styles.filterChipActive]}
              >
                <Ionicons
                  name="leaf"
                  size={12}
                  color={activeFilter === 'eco' ? colors.ecoGreen : colors.textMuted}
                />
                <Text style={[styles.filterText, activeFilter === 'eco' && styles.filterTextActive]}>
                  Eco-Craft
                </Text>
              </Pressable>
            </ScrollView>

            {/* Sort options */}
            <View style={styles.sortRow}>
              <Text style={styles.sortLabel}>Sort:</Text>
              <Pressable
                onPress={() => {
                  const nextSort: SortType =
                    activeSort === 'featured'
                      ? 'priceAsc'
                      : activeSort === 'priceAsc'
                      ? 'priceDesc'
                      : activeSort === 'priceDesc'
                      ? 'rating'
                      : 'featured';
                  setActiveSort(nextSort);
                }}
                style={styles.sortButton}
              >
                <Text style={styles.sortButtonText}>
                  {activeSort === 'featured' && 'Featured'}
                  {activeSort === 'priceAsc' && 'Price: Low → High'}
                  {activeSort === 'priceDesc' && 'Price: High → Low'}
                  {activeSort === 'rating' && 'Top Rated'}
                </Text>
                <Ionicons name="swap-vertical" size={14} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="sparkles-outline" size={42} color={colors.gold} />
              <Text style={styles.emptyTitle}>No creations match this filter</Text>
              <Text style={styles.emptyText}>
                Try adjusting your filters or browse all creations crafted with love.
              </Text>
              <Pressable
                onPress={() => {
                  setActiveFilter('all');
                  setActiveSort('featured');
                }}
                style={styles.resetFilterBtn}
              >
                <Text style={styles.resetFilterText}>Reset Filters</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.productGrid}>
              {filteredProducts.map((p) => (
                <View
                  key={p.id}
                  style={[styles.productGridItem, { width: isDesktop ? '23.5%' : '48%' }]}
                >
                  <ProductCard product={p} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

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
    paddingBottom: 40,
  },
  container: {
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backRow: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  titleBlock: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 28,
    color: colors.charcoal,
  },
  categoryDescription: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
    maxWidth: 680,
  },
  productCount: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.goldDeep,
    marginTop: 8,
  },
  controlsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  filterScroll: {
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  filterChipActive: {
    backgroundColor: colors.charcoal,
    borderColor: colors.charcoal,
  },
  filterText: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortLabel: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  sortButtonText: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.charcoal,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productGridItem: {
    marginBottom: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 20,
    color: colors.charcoal,
  },
  emptyText: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 360,
  },
  resetFilterBtn: {
    marginTop: 8,
    backgroundColor: colors.charcoal,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  resetFilterText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
