import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getCategory } from '../data/categories';
import { PRODUCTS } from '../data/products';
import { PageHeader } from '../components/PageHeader';
import { ProductCard } from '../components/ProductCard';
import { ProductCover } from '../components/ProductCover';
import { EmptyState } from '../components/EmptyState';
import { fonts, light } from '../theme';
import type { CustomerStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;
type Route = RouteProp<CustomerStackParamList, 'Category'>;

export function CategoryScreen() {
  const navigation = useNavigation<Nav>();
  const { id } = useRoute<Route>().params;
  const { width } = useWindowDimensions();

  const category = getCategory(id);
  const products = useMemo(() => PRODUCTS.filter((p) => p.categoryId === id), [id]);

  const columns = width < 640 ? 2 : width < 1100 ? 3 : 4;
  const gap = 12;
  const cardWidth = Math.floor((Math.min(width, 1200) - 32 - gap * (columns - 1)) / columns);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PageHeader title={category.name} subtitle={category.tagline} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.coverWrap}>
          <ProductCover categoryId={category.id} label={category.name} height={130} />
        </View>

        <Text style={styles.count}>{products.length} creations</Text>

        {products.length === 0 ? (
          <EmptyState
            icon="pricetags-outline"
            title="Coming soon"
            subtitle="Creators are crafting new pieces for this category."
          />
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: light.bg,
  },
  content: {
    padding: 16,
  },
  coverWrap: {
    marginBottom: 6,
  },
  count: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    marginVertical: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});