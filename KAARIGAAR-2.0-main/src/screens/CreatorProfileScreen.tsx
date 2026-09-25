import {
  Image,
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
import { colors, fonts, radius, shadow } from '../theme';

type CreatorProfileRouteProp = RouteProp<AppStackParamList, 'CreatorProfile'>;

export function CreatorProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<CreatorProfileRouteProp>();
  const { creatorId } = route.params;

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { creators, products } = useMarketplace();
  const creator = creators.find((c) => c.id === creatorId) || creators[0];

  const creatorProducts = products.filter((p) => p.creatorId === creator.id);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <MarketplaceHeader />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Back Row */}
          <View style={styles.backRow}>
            <BackButton label="Back to Marketplace" fallbackRoute="CustomerHome" />
          </View>

          {/* Banner Card */}
          <View style={styles.profileBanner}>
            <Image
              source={{ uri: creator.workshopImage }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <View style={styles.bannerOverlay} />

            <View style={styles.bannerContent}>
              <Image source={{ uri: creator.avatar }} style={styles.avatar} />
              <View style={styles.bannerInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.creatorName}>{creator.name}</Text>
                  {creator.verified && (
                    <Ionicons name="checkmark-circle" size={18} color={colors.goldBright} />
                  )}
                </View>
                <Text style={styles.brandTitle}>{creator.brand}</Text>
                <Text style={styles.locationTitle}>📍 {creator.location} • Member since {creator.joinedYear}</Text>
              </View>

              <Pressable
                onPress={() => navigation.navigate('FindMyMaker')}
                style={styles.commissionBtn}
                accessibilityRole="button"
              >
                <Ionicons name="sparkles" size={15} color={colors.charcoal} />
                <Text style={styles.commissionBtnText}>Request Custom Order</Text>
              </Pressable>
            </View>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{creator.rating.toFixed(1)} ★</Text>
              <Text style={styles.statLbl}>{creator.reviewCount} Reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{creator.completedCreations}+</Text>
              <Text style={styles.statLbl}>Creations Delivered</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>Pune</Text>
              <Text style={styles.statLbl}>{creator.locality} Atelier</Text>
            </View>
          </View>

          {/* Artisan Story */}
          <View style={styles.storyCard}>
            <Text style={styles.storyCardTitle}>About the Artisan & Atelier</Text>
            <Text style={styles.storyCardBody}>{creator.story}</Text>
            <View style={styles.specialtiesRow}>
              <Text style={styles.specialtiesLabel}>Specializations:</Text>
              {creator.specialties.map((spec) => (
                <View key={spec} style={styles.specChip}>
                  <Text style={styles.specChipText}>{spec}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Creator's Catalog */}
          <View style={styles.catalogSection}>
            <Text style={styles.catalogTitle}>Creations by {creator.name} ({creatorProducts.length})</Text>
            <View style={styles.productGrid}>
              {creatorProducts.map((p) => (
                <View
                  key={p.id}
                  style={[styles.productGridItem, { width: isDesktop ? '23.5%' : '48%' }]}
                >
                  <ProductCard product={p} />
                </View>
              ))}
            </View>
          </View>
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
    paddingBottom: 48,
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
  profileBanner: {
    height: 240,
    borderRadius: radius.xl,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
    ...shadow.medium,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 22, 19, 0.65)',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  bannerInfo: {
    flex: 1,
    minWidth: 200,
  },
  creatorName: {
    fontFamily: fonts.serif.bold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  brandTitle: {
    fontFamily: fonts.sans.medium,
    fontSize: 14,
    color: colors.goldLight,
    marginTop: 2,
  },
  locationTitle: {
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    color: colors.beige,
    marginTop: 2,
  },
  commissionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gold,
    paddingHorizontal: 16,
    height: 40,
    borderRadius: radius.full,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  commissionBtnText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    color: colors.charcoal,
  },
  statsBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 24,
    ...shadow.soft,
  },
  statItem: {
    alignItems: 'center',
  },
  statVal: {
    fontFamily: fonts.sans.bold,
    fontSize: 18,
    color: colors.charcoal,
  },
  statLbl: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.cardBorder,
  },
  storyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 24,
    marginBottom: 32,
    ...shadow.soft,
  },
  storyCardTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 18,
    color: colors.charcoal,
    marginBottom: 10,
  },
  storyCardBody: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  specialtiesLabel: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    color: colors.charcoal,
  },
  specChip: {
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  specChipText: {
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  catalogSection: {
    marginTop: 8,
  },
  catalogTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 22,
    color: colors.charcoal,
    marginBottom: 16,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  productGridItem: {
    marginBottom: 8,
  },
});
