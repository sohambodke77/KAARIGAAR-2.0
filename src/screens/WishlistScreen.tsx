import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getProduct } from '../data/products';
import { PageHeader } from '../components/PageHeader';
import { ProductCard } from '../components/ProductCard';
import { EmptyState } from '../components/EmptyState';
import { useMarket } from '../context/MarketContext';
import { fonts, light } from '../theme';
import type { CustomerStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;

export function WishlistScreen() {
  const navigation = useNavigation<Nav>();
  const { wishlist } = useMarket();
  const { width } = useWindowDimensions();

  const wished = wishlist.map(getProduct);
  const columns = width < 640 ? 2 : width < 1100 ? 3 : 4;
  const gap = 12;
  const cardWidth = Math.floor((Math.min(width, 1200) - 32 - gap * (columns - 1)) / columns);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PageHeader title="My Wishlist" subtitle={`${wished.length} saved`} />
      {wished.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="Your handmade collection starts here."
          subtitle="Tap the heart on any creation to save it for later."
          ctaLabel="Discover Handmade"
          onCta={() => navigation.navigate('Tabs', { screen: 'HomeTab' })}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridWrap}>
          <View style={styles.grid}>
            {wished.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                width={cardWidth}
                onPress={() => navigation.navigate('Product', { id: p.id })}
              />
            ))}
          </View>
          <Text style={styles.hint}>Press the heart on a card to remove it.</Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: light.bg,
  },
  gridWrap: {
    padding: 16,
    paddingBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  hint: {
    color: light.inkFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 18,
  },
});