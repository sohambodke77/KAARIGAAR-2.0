import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import { PRODUCTS, type Product } from '../data/products';
import { getCategory } from '../data/categories';
import { PageHeader } from '../components/PageHeader';
import { ProductCover } from '../components/ProductCover';
import { fonts, light } from '../theme';
import type { CreatorStackParamList } from '../navigation/types';

type Nav = NavigationProp<CreatorStackParamList>;

const MY_PRODUCTS_KEY = '@kaarigaar/myProducts';

export interface MyProduct extends Product {
  isMine?: boolean;
}

export function CreatorProductsScreen() {
  const navigation = useNavigation<Nav>();
  const { width } = useWindowDimensions();
  const [mine, setMine] = useState<MyProduct[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(MY_PRODUCTS_KEY)
      .then((raw) => raw && setMine(JSON.parse(raw)))
      .catch(() => {});
  }, []);

  const catalog = [
    ...mine.map((p) => ({ ...p, isMine: true })),
    ...PRODUCTS.slice(0, 10).map((p) => ({ ...p, isMine: false })),
  ];

  const columns = width < 640 ? 2 : width < 1100 ? 3 : 4;
  const gap = 12;
  const cardWidth = Math.floor((Math.min(width, 1200) - 32 - gap * (columns - 1)) / columns);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PageHeader
        title="My Products"
        subtitle={`${catalog.length} listed`}
        right={
          <Pressable
            onPress={() => navigation.navigate('ProductNew')}
            style={styles.addBtn}
            accessibilityRole="button"
            accessibilityLabel="Add new product"
          >
            <Ionicons name="add" size={22} color="#2A1A10" />
          </Pressable>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.gridWrap}>
        <View style={styles.grid}>
          {catalog.map((p) => (
            <Pressable
              key={p.id}
              style={({ pressed }) => [styles.card, { width: cardWidth }, pressed && { opacity: 0.9 }]}
            >
              <ProductCover categoryId={p.categoryId} label={p.name} height={cardWidth * 0.9} feature={p.feature} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardName} numberOfLines={2}>{p.name}</Text>
                <Text style={styles.cardMeta}>{getCategory(p.categoryId).name}</Text>
                <View style={styles.cardBottom}>
                  <Text style={styles.cardPrice}>₹{p.price.toLocaleString('en-IN')}</Text>
                  {p.isMine ? (
                    <View style={styles.mineBadge}><Text style={styles.mineText}>Yours</Text></View>
                  ) : (
                    <Text style={styles.cardStock}>In stock · {p.stock}</Text>
                  )}
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#D9A94A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridWrap: { padding: 16, paddingBottom: 32 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    backgroundColor: light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: light.line,
    overflow: 'hidden',
  },
  cardInfo: { padding: 10, gap: 3 },
  cardName: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    lineHeight: 17,
    minHeight: 34,
  },
  cardMeta: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  cardPrice: {
    color: light.ink,
    fontFamily: fonts.sans.bold,
    fontSize: 14.5,
  },
  cardStock: {
    color: light.inkFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 10.5,
  },
  mineBadge: {
    backgroundColor: 'rgba(120,152,96,0.16)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  mineText: {
    color: '#3F5A33',
    fontFamily: fonts.sans.bold,
    fontSize: 10,
  },
});