import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ScreenHeader } from '../components/ScreenHeader';
import { colors, fonts, radius, shadow } from '../theme';
import type { AppStackParamList } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const CATEGORIES = ['All crafts', 'Textile', 'Jewellery', 'Home & Décor', 'Ceramics', 'Leather'];

export function CustomerHomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [activeCategory, setActiveCategory] = useState('All crafts');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader onProfile={() => navigation.navigate('Profile')} />

        <View style={styles.greeting}>
          <Text style={styles.label}>CUSTOMER</Text>
          <Text style={styles.title}>Discover handmade,{'\n'}one story at a time.</Text>
        </View>

        <Pressable style={styles.search}>
          <Ionicons name="search" size={18} color={colors.creamFaint} />
          <Text style={styles.searchText}>Search for crafts, gifts, makers…</Text>
        </Pressable>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {CATEGORIES.map((category) => {
            const active = category === activeCategory;
            return (
              <Pressable
                key={category}
                onPress={() => setActiveCategory(category)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{category}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <LinearGradient
          colors={[colors.goldFaint, 'rgba(201,164,76,0.03)']}
          style={styles.hero}
        >
          <Text style={styles.heroLabel}>FEATURED</Text>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="flower-tulip-outline" size={24} color={colors.gold} />
          </View>
          <Text style={styles.heroTitle}>Handpicked by our makers</Text>
          <Text style={styles.heroBody}>
            Every piece carries a story. Explore curated crafts from karigaars across India.
          </Text>
          <View style={styles.heroCta}>
            <Text style={styles.heroCtaText}>Explore the collection</Text>
            <Ionicons name="arrow-forward" size={15} color={colors.gold} />
          </View>
        </LinearGradient>

        <Text style={styles.footnote}>The full marketplace experience is coming soon.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
  },
  greeting: {
    marginTop: 34,
  },
  label: {
    color: colors.gold,
    fontFamily: fonts.sans.semibold,
    fontSize: 11,
    letterSpacing: 2.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    color: colors.cream,
    fontFamily: fonts.serif.bold,
    fontSize: 28,
    lineHeight: 37,
  },
  search: {
    marginTop: 26,
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  searchText: {
    color: colors.creamFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 14.5,
  },
  chipRow: {
    gap: 10,
    marginTop: 20,
    paddingRight: 24,
  },
  chip: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.goldFaint,
    borderColor: colors.goldDim,
  },
  chipText: {
    color: colors.creamDim,
    fontFamily: fonts.sans.medium,
    fontSize: 13,
  },
  chipTextActive: {
    color: colors.gold,
  },
  hero: {
    marginTop: 26,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.goldDim,
    padding: 22,
    ...shadow.card,
  },
  heroLabel: {
    color: colors.gold,
    fontFamily: fonts.sans.semibold,
    fontSize: 11,
    letterSpacing: 2.6,
  },
  heroIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: colors.goldDim,
    backgroundColor: colors.goldFaint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  heroTitle: {
    color: colors.cream,
    fontFamily: fonts.serif.semibold,
    fontSize: 21,
    marginTop: 14,
  },
  heroBody: {
    color: colors.creamDim,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: 8,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 18,
  },
  heroCtaText: {
    color: colors.gold,
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
  },
  footnote: {
    color: colors.creamFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 30,
  },
});