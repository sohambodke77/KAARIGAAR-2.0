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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton } from '../components/BackButton';
import { BottomNavigation } from '../components/BottomNavigation';
import { MarketplaceHeader } from '../components/MarketplaceHeader';
import { useMarketplace } from '../context/MarketplaceContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadow } from '../theme';

export function StoriesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { stories } = useMarketplace();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <MarketplaceHeader />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Back Row */}
          <View style={styles.backRow}>
            <BackButton label="Back to Marketplace" fallbackRoute="CustomerHome" />
          </View>

          {/* Heading */}
          <View style={styles.headingBlock}>
            <View style={styles.badge}>
              <Ionicons name="sparkles" size={13} color={colors.goldBright} />
              <Text style={styles.badgeText}>EDITORIAL ARCHIVES</Text>
            </View>
            <Text style={styles.title}>Stories Carved in Hand & Heart</Text>
            <Text style={styles.subtitle}>
              Meet the people behind the creations. Real workshops, sacred ancestral techniques, and modern creative journeys across Pune and India.
            </Text>
          </View>

          {/* Stories List */}
          <View style={styles.storiesContainer}>
            {stories.map((story, index) => (
              <View
                key={story.id}
                style={[
                  styles.storyCard,
                  isDesktop && styles.storyCardDesktop,
                  index % 2 === 1 && isDesktop && styles.storyCardReversed,
                ]}
              >
                {/* Visual Half */}
                <View style={[styles.visualHalf, isDesktop && { width: '48%' }]}>
                  <Image source={{ uri: story.image }} style={styles.mainStoryImg} resizeMode="cover" />
                  <View style={styles.workshopPeekBox}>
                    <Image source={{ uri: story.workshopImage }} style={styles.workshopImg} resizeMode="cover" />
                    <View style={styles.peekCaption}>
                      <Ionicons name="camera-outline" size={14} color={colors.gold} />
                      <Text style={styles.peekText}>At the {story.location} Studio</Text>
                    </View>
                  </View>
                </View>

                {/* Text Half */}
                <View style={[styles.textHalf, isDesktop && { width: '48%' }]}>
                  <View style={styles.craftBadge}>
                    <Text style={styles.craftBadgeText}>{story.craft.toUpperCase()}</Text>
                  </View>

                  <Text style={styles.storyArticleTitle}>{story.title}</Text>
                  <Text style={styles.storyArticleSubtitle}>{story.subtitle}</Text>

                  {/* Pull Quote */}
                  <View style={styles.quoteBlock}>
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.gold} />
                    <Text style={styles.quoteText}>“{story.quote}”</Text>
                  </View>

                  <Text style={styles.storyParagraph}>{story.content}</Text>

                  {/* Creator Info Footer */}
                  <View style={styles.storyAuthorRow}>
                    <View>
                      <Text style={styles.storyAuthorName}>{story.creatorName}</Text>
                      <Text style={styles.storyAuthorRole}>{story.creatorRole}</Text>
                    </View>

                    <Pressable
                      onPress={() =>
                        navigation.navigate('Category', {
                          categoryId: 'crochet',
                          categoryName: `${story.creatorName}’s Workshop`,
                        })
                      }
                      style={styles.exploreCreationsBtn}
                      accessibilityRole="button"
                    >
                      <Text style={styles.exploreCreationsText}>Explore Creations</Text>
                      <Ionicons name="arrow-forward" size={14} color={colors.charcoal} />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
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
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  backRow: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  headingBlock: {
    marginBottom: 32,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF8E8',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.goldDim,
    marginBottom: 10,
  },
  badgeText: {
    fontFamily: fonts.sans.bold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: colors.goldDeep,
  },
  title: {
    fontFamily: fonts.serif.bold,
    fontSize: 32,
    color: colors.charcoal,
  },
  subtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: 8,
    maxWidth: 680,
  },
  storiesContainer: {
    gap: 40,
  },
  storyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    ...shadow.soft,
    flexDirection: 'column',
    gap: 20,
  },
  storyCardDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 32,
    gap: 32,
  },
  storyCardReversed: {
    flexDirection: 'row-reverse',
  },
  visualHalf: {
    width: '100%',
    position: 'relative',
  },
  mainStoryImg: {
    width: '100%',
    height: 320,
    borderRadius: radius.lg,
  },
  workshopPeekBox: {
    position: 'absolute',
    bottom: -16,
    right: 16,
    width: 150,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 6,
    ...shadow.medium,
  },
  workshopImg: {
    width: '100%',
    height: 90,
    borderRadius: radius.sm,
  },
  peekCaption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  peekText: {
    fontFamily: fonts.sans.medium,
    fontSize: 10,
    color: colors.textMuted,
  },
  textHalf: {
    width: '100%',
  },
  craftBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF8E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.goldDim,
    marginBottom: 10,
  },
  craftBadgeText: {
    fontFamily: fonts.sans.bold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: colors.goldDeep,
  },
  storyArticleTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 24,
    lineHeight: 32,
    color: colors.charcoal,
    marginBottom: 6,
  },
  storyArticleSubtitle: {
    fontFamily: fonts.sans.medium,
    fontSize: 14,
    color: colors.goldDeep,
    marginBottom: 16,
    lineHeight: 20,
  },
  quoteBlock: {
    backgroundColor: '#FFFDF9',
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
    padding: 14,
    marginBottom: 16,
    gap: 6,
  },
  quoteText: {
    fontFamily: fonts.serif.medium,
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.charcoal,
    fontStyle: 'italic',
  },
  storyParagraph: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  storyAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorderSubtle,
    gap: 12,
  },
  storyAuthorName: {
    fontFamily: fonts.serif.bold,
    fontSize: 15,
    color: colors.charcoal,
  },
  storyAuthorRole: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  exploreCreationsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.marketplaceBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: radius.full,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  exploreCreationsText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 12.5,
    color: colors.charcoal,
  },
});
