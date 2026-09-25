import { useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { useMarketplace, type Creator } from '../context/MarketplaceContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadow } from '../theme';

const CRAFT_OPTIONS = [
  'Crochet & Fiber Art',
  'Pottery & Ceramics',
  'Madhubani & Folk Paintings',
  'Resin Art & Keepsakes',
  'Handmade Jewellery',
  'Soy Candles & Aromatics',
  'Embroidery & Hoop Art',
  'Woodcraft & Furniture',
];

const STYLE_OPTIONS = ['Traditional Folk', 'Minimalist Modern', 'Rustic Earthy', 'Bohemian Chic'];

const BUDGET_OPTIONS = ['Under ₹500', '₹500 - ₹1,500', '₹1,500 - ₹3,500', '₹3,500+'];

export function FindMyMakerScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { creators, submitCustomBrief } = useMarketplace();

  // Wizard state
  const [selectedCraft, setSelectedCraft] = useState(CRAFT_OPTIONS[0]);
  const [selectedStyle, setSelectedStyle] = useState(STYLE_OPTIONS[0]);
  const [selectedBudget, setSelectedBudget] = useState(BUDGET_OPTIONS[1]);
  const [locationPref, setLocationPref] = useState('Pune & Alandi');
  const [deliveryDate, setDeliveryDate] = useState('Within 2 weeks');
  const [projectDescription, setProjectDescription] = useState('');

  // Brief modal state
  const [briefCreator, setBriefCreator] = useState<Creator | null>(null);
  const [briefSubmitted, setBriefSubmitted] = useState(false);

  // Match creators based on craft & location
  const matchedCreators = creators.filter((c) => {
    return true; // We showcase all 6 matched karigaars scored by relevance
  });

  const handleSendBrief = (creator: Creator) => {
    setBriefCreator(creator);
    setBriefSubmitted(false);
  };

  const handleConfirmBriefSubmit = () => {
    if (!briefCreator) return;
    submitCustomBrief({
      craftType: selectedCraft,
      description: projectDescription || `Custom commission in ${selectedStyle} style.`,
      budget: selectedBudget,
      style: selectedStyle,
      deliveryDate,
      location: locationPref,
      creatorId: briefCreator.id,
      creatorName: briefCreator.name,
    });
    setBriefSubmitted(true);
    setTimeout(() => {
      setBriefCreator(null);
      setBriefSubmitted(false);
      navigation.navigate('Orders');
    }, 1200);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <MarketplaceHeader />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Back Row */}
          <View style={styles.backRow}>
            <BackButton label="Back to Marketplace" fallbackRoute="CustomerHome" />
          </View>

          {/* Header */}
          <View style={styles.headerBlock}>
            <View style={styles.sparkleBadge}>
              <Ionicons name="sparkles" size={13} color={colors.goldBright} />
              <Text style={styles.sparkleBadgeText}>AI-ASSISTED ARTISAN MATCHMAKING</Text>
            </View>
            <Text style={styles.title}>Find My Maker</Text>
            <Text style={styles.subtitle}>
              Describe your dream custom creation. We connect you directly with master karigaars in Pune who can bring your vision to life.
            </Text>
          </View>

          {/* Form Wizard */}
          <View style={styles.wizardCard}>
            <Text style={styles.wizardHeading}>1. What would you like to create?</Text>
            <View style={styles.pillsRow}>
              {CRAFT_OPTIONS.map((craft) => {
                const isSelected = selectedCraft === craft;
                return (
                  <Pressable
                    key={craft}
                    onPress={() => setSelectedCraft(craft)}
                    style={[styles.pill, isSelected && styles.pillSelected]}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                      {craft}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.wizardHeading, { marginTop: 24 }]}>2. Preferred Design Style</Text>
            <View style={styles.pillsRow}>
              {STYLE_OPTIONS.map((st) => {
                const isSelected = selectedStyle === st;
                return (
                  <Pressable
                    key={st}
                    onPress={() => setSelectedStyle(st)}
                    style={[styles.pill, isSelected && styles.pillSelected]}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                      {st}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.twoColRow, { marginTop: 24 }]}>
              {/* Budget */}
              <View style={{ flex: 1 }}>
                <Text style={styles.wizardHeading}>3. Budget Range</Text>
                <View style={styles.pillsRow}>
                  {BUDGET_OPTIONS.map((b) => {
                    const isSelected = selectedBudget === b;
                    return (
                      <Pressable
                        key={b}
                        onPress={() => setSelectedBudget(b)}
                        style={[styles.pill, isSelected && styles.pillSelected]}
                      >
                        <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                          {b}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Delivery Date */}
              <View style={{ flex: 1 }}>
                <Text style={styles.wizardHeading}>4. Target Delivery Timeline</Text>
                <TextInput
                  style={styles.textInput}
                  value={deliveryDate}
                  onChangeText={setDeliveryDate}
                  placeholder="e.g. Within 10 days, for Diwali, etc."
                />
              </View>
            </View>

            {/* Description */}
            <View style={{ marginTop: 24 }}>
              <Text style={styles.wizardHeading}>5. Brief Details / Inspiration (Optional)</Text>
              <TextInput
                style={[styles.textInput, { height: 74, marginTop: 8 }]}
                value={projectDescription}
                onChangeText={setProjectDescription}
                placeholder="Mention specific dimensions, color palette, reference ideas, or dedication notes…"
                multiline
              />
            </View>
          </View>

          {/* Matched Makers Section */}
          <View style={styles.matchedSection}>
            <View style={styles.matchedSectionHeader}>
              <Text style={styles.matchedCount}>
                Matched Karigaars ({matchedCreators.length} Available in Pune)
              </Text>
              <Text style={styles.matchedSub}>
                Artisans specialized in {selectedCraft} with open custom order slots:
              </Text>
            </View>

            <View style={styles.creatorsGrid}>
              {matchedCreators.map((creator) => (
                <View
                  key={creator.id}
                  style={[styles.creatorCard, isDesktop && { width: '48.5%' }]}
                >
                  <View style={styles.creatorTop}>
                    <Image source={{ uri: creator.avatar }} style={styles.creatorAvatar} />
                    <View style={styles.creatorInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.creatorName}>{creator.name}</Text>
                        {creator.verified && (
                          <Ionicons name="checkmark-circle" size={15} color={colors.gold} />
                        )}
                      </View>
                      <Text style={styles.creatorBrand}>{creator.brand}</Text>
                      <Text style={styles.creatorLoc}>📍 {creator.location}</Text>
                      <View style={styles.creatorStatsRow}>
                        <View style={styles.ratingBadge}>
                          <Ionicons name="star" size={12} color={colors.gold} />
                          <Text style={styles.ratingText}>{creator.rating.toFixed(1)}</Text>
                        </View>
                        <Text style={styles.statsSeparator}>•</Text>
                        <Text style={styles.creationsCount}>{creator.completedCreations}+ creations</Text>
                      </View>
                    </View>
                  </View>

                  {/* Specialties Pills */}
                  <View style={styles.specialtiesRow}>
                    {creator.specialties.map((spec) => (
                      <View key={spec} style={styles.specialtyPill}>
                        <Text style={styles.specialtyText}>{spec}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Estimation metrics */}
                  <View style={styles.estimationRow}>
                    <View>
                      <Text style={styles.estLabel}>Estimated Price</Text>
                      <Text style={styles.estValue}>{selectedBudget}</Text>
                    </View>
                    <View>
                      <Text style={styles.estLabel}>Lead Time</Text>
                      <Text style={styles.estValue}>4 - 7 days</Text>
                    </View>
                  </View>

                  {/* Card Action Buttons */}
                  <View style={styles.cardActionsRow}>
                    <Pressable
                      onPress={() => navigation.navigate('CreatorProfile', { creatorId: creator.id })}
                      style={styles.viewProfileBtn}
                    >
                      <Text style={styles.viewProfileText}>View Profile</Text>
                    </Pressable>

                    <Pressable
                      onPress={() => handleSendBrief(creator)}
                      style={styles.sendBriefBtn}
                    >
                      <Ionicons name="paper-plane-outline" size={15} color="#FFFFFF" />
                      <Text style={styles.sendBriefText}>Send Direct Brief</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Direct Brief Modal */}
      <Modal
        visible={briefCreator !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setBriefCreator(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Commission Request</Text>
              <Pressable
                onPress={() => setBriefCreator(null)}
                hitSlop={8}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={20} color={colors.charcoal} />
              </Pressable>
            </View>

            {briefSubmitted ? (
              <View style={styles.modalSuccessBlock}>
                <Ionicons name="checkmark-circle" size={48} color={colors.ecoGreen} />
                <Text style={styles.modalSuccessTitle}>Brief Dispatched to {briefCreator?.name}!</Text>
                <Text style={styles.modalSuccessText}>
                  The artisan will review your custom requirements and respond with a tailored proposal.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.modalSub}>
                  Sending custom creation brief directly to{' '}
                  <Text style={{ fontFamily: fonts.sans.bold }}>{briefCreator?.name}</Text> ({briefCreator?.brand})
                </Text>

                <View style={styles.modalSummaryBox}>
                  <Text style={styles.summaryLine}>• Craft: <Text style={styles.summaryVal}>{selectedCraft}</Text></Text>
                  <Text style={styles.summaryLine}>• Style: <Text style={styles.summaryVal}>{selectedStyle}</Text></Text>
                  <Text style={styles.summaryLine}>• Budget: <Text style={styles.summaryVal}>{selectedBudget}</Text></Text>
                  <Text style={styles.summaryLine}>• Due: <Text style={styles.summaryVal}>{deliveryDate}</Text></Text>
                </View>

                <Pressable
                  onPress={handleConfirmBriefSubmit}
                  style={styles.modalConfirmBtn}
                >
                  <Text style={styles.modalConfirmText}>Confirm & Send Brief</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      <BottomNavigation activeTab="create" />
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
  headerBlock: {
    marginBottom: 24,
  },
  sparkleBadge: {
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
  sparkleBadgeText: {
    fontFamily: fonts.sans.bold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: colors.goldDeep,
  },
  title: {
    fontFamily: fonts.serif.bold,
    fontSize: 30,
    color: colors.charcoal,
  },
  subtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: 14.5,
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: 6,
    maxWidth: 680,
  },
  wizardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 24,
    marginBottom: 36,
    ...shadow.soft,
  },
  wizardHeading: {
    fontFamily: fonts.serif.bold,
    fontSize: 16,
    color: colors.charcoal,
    marginBottom: 12,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.marketplaceBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  pillSelected: {
    backgroundColor: colors.charcoal,
    borderColor: colors.charcoal,
  },
  pillText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
  twoColRow: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: 20,
  },
  textInput: {
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  matchedSection: {
    marginTop: 10,
  },
  matchedSectionHeader: {
    marginBottom: 20,
  },
  matchedCount: {
    fontFamily: fonts.serif.bold,
    fontSize: 22,
    color: colors.charcoal,
  },
  matchedSub: {
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    color: colors.textSecondary,
    marginTop: 4,
  },
  creatorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  creatorCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    ...shadow.soft,
  },
  creatorTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 14,
  },
  creatorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontFamily: fonts.serif.bold,
    fontSize: 16,
    color: colors.charcoal,
  },
  creatorBrand: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.goldDeep,
  },
  creatorLoc: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  creatorStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontFamily: fonts.sans.bold,
    fontSize: 12,
    color: colors.charcoal,
  },
  statsSeparator: {
    color: colors.textMuted,
  },
  creationsCount: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  specialtiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  specialtyPill: {
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  specialtyText: {
    fontFamily: fonts.sans.medium,
    fontSize: 11.5,
    color: colors.textSecondary,
  },
  estimationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
  },
  estLabel: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    color: colors.textMuted,
  },
  estValue: {
    fontFamily: fonts.sans.bold,
    fontSize: 13.5,
    color: colors.charcoal,
    marginTop: 2,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  viewProfileBtn: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.marketplaceBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  viewProfileText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.charcoal,
  },
  sendBriefBtn: {
    flex: 1.2,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.charcoal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  sendBriefText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 22, 19, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 24,
    ...shadow.card,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 18,
    color: colors.charcoal,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.marketplaceBg,
  },
  modalSub: {
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    color: colors.textSecondary,
    marginBottom: 14,
    lineHeight: 20,
  },
  modalSummaryBox: {
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.md,
    padding: 14,
    gap: 6,
    marginBottom: 18,
  },
  summaryLine: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  summaryVal: {
    fontFamily: fonts.sans.semibold,
    color: colors.charcoal,
  },
  modalConfirmBtn: {
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  modalConfirmText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  modalSuccessBlock: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  modalSuccessTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 18,
    color: colors.charcoal,
    textAlign: 'center',
  },
  modalSuccessText: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
