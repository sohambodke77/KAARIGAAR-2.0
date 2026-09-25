import { useState } from 'react';
import {
  Image,
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
import { useMarketplace } from '../context/MarketplaceContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadow } from '../theme';

const SAMPLE_LISTING_IMAGES = [
  'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
];

export function AddProductScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { categories, addNewProduct } = useMarketplace();

  // Form Fields
  const [productName, setProductName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categories[0].name);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0].id);
  const [price, setPrice] = useState('499');
  const [originalPrice, setOriginalPrice] = useState('699');
  const [description, setDescription] = useState('');
  const [materials, setMaterials] = useState('100% Organic Indian Cotton, Natural Dyes');
  const [dimensions, setDimensions] = useState('12 cm × 10 cm × 8 cm');
  const [stock, setStock] = useState('10');
  const [preparationDays, setPreparationDays] = useState('3');
  const [allowCustomization, setAllowCustomization] = useState(true);
  const [selectedImage, setSelectedImage] = useState(SAMPLE_LISTING_IMAGES[0]);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // AI Storytelling Generator
  const handleGenerateStoryDescription = () => {
    setGeneratingAi(true);
    setTimeout(() => {
      const generated = `Handcrafted with devotion in our Pune studio, the ${
        productName || 'Artisan Creation'
      } is an authentic tribute to slow living and ancestral craft heritage. Shaped from ${materials}, every contour is individually sculpted by hand over many hours. No two pieces are ever identical, giving you a soulful, one-of-a-kind treasure that carries human care and timeless beauty into your everyday space.`;
      setDescription(generated);
      setGeneratingAi(false);
    }, 850);
  };

  const handlePublish = () => {
    if (!productName.trim()) {
      alert('Please enter a product title before publishing.');
      return;
    }

    setPublishing(true);
    const numPrice = parseInt(price, 10) || 499;
    const numOrig = parseInt(originalPrice, 10) || Math.round(numPrice * 1.3);

    const newProd = addNewProduct({
      name: productName.trim(),
      category: selectedCategory,
      categoryId: selectedCategoryId,
      price: numPrice,
      originalPrice: numOrig,
      description:
        description ||
        `Handmade ${productName.trim()} crafted in Pune using authentic materials and heritage techniques.`,
      images: [selectedImage],
      stock: parseInt(stock, 10) || 10,
      preparationDays: parseInt(preparationDays, 10) || 3,
      isEco: true,
      passport: {
        origin: 'Pune, Maharashtra',
        craftType: `${selectedCategory} Artisan Handcraft`,
        materials: materials.split(',').map((m) => m.trim()),
        hoursToCraft: `${preparationDays} days handcrafting timeline`,
        batchInfo: `Pune Atelier Series #KG-${Math.floor(100 + Math.random() * 900)}`,
        authenticityGuarantee: 'Individually handmade by verified Karigaar.',
      },
    });

    setTimeout(() => {
      setPublishing(false);
      navigation.navigate('ProductDetail', { productId: newProd.id });
    }, 700);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Back Row */}
          <View style={styles.backRow}>
            <BackButton label="Back to Creator Dashboard" fallbackRoute="SellerDashboard" />
          </View>

          {/* Heading */}
          <View style={styles.headingBlock}>
            <View style={styles.badge}>
              <Ionicons name="sparkles" size={13} color={colors.goldBright} />
              <Text style={styles.badgeText}>KARIGAAR CREATOR WORKSPACE</Text>
            </View>
            <Text style={styles.title}>List a New Handmade Creation</Text>
            <Text style={styles.subtitle}>
              Publish your craft to hundreds of discerning customers across Pune & India. Tell your creation’s story.
            </Text>
          </View>

          <View style={[styles.layout, isDesktop && styles.layoutDesktop]}>
            {/* Form Column */}
            <View style={[styles.formColumn, isDesktop && { width: '64%' }]}>
              {/* Image Selector */}
              <View style={styles.card}>
                <Text style={styles.cardHeading}>1. Product Photography</Text>
                <Text style={styles.cardSub}>
                  Select or upload workshop photography with warm, natural lighting:
                </Text>

                <View style={styles.previewImageContainer}>
                  <Image source={{ uri: selectedImage }} style={styles.previewImg} resizeMode="cover" />
                  <View style={styles.imageOverlayBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.goldBright} />
                    <Text style={styles.imageOverlayText}>Primary Image</Text>
                  </View>
                </View>

                <Text style={styles.selectThumbLabel}>Select from sample craft photo studio:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbScroll}>
                  {SAMPLE_LISTING_IMAGES.map((img, i) => (
                    <Pressable
                      key={i}
                      onPress={() => setSelectedImage(img)}
                      style={[
                        styles.thumbBtn,
                        selectedImage === img && styles.thumbBtnActive,
                      ]}
                    >
                      <Image source={{ uri: img }} style={styles.thumbImg} />
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {/* Basic Details */}
              <View style={styles.card}>
                <Text style={styles.cardHeading}>2. Basic Creation Details</Text>

                <View style={{ marginBottom: 14 }}>
                  <Text style={styles.fieldLabel}>Creation Title *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="e.g. Hand-carved Sheesham Wood Floral Mirror"
                    placeholderTextColor={colors.textMuted}
                    value={productName}
                    onChangeText={setProductName}
                  />
                </View>

                <View style={{ marginBottom: 14 }}>
                  <Text style={styles.fieldLabel}>Craft Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catChips}>
                    {categories.map((c) => {
                      const isSel = selectedCategoryId === c.id;
                      return (
                        <Pressable
                          key={c.id}
                          onPress={() => {
                            setSelectedCategory(c.name);
                            setSelectedCategoryId(c.id);
                          }}
                          style={[styles.catChip, isSel && styles.catChipActive]}
                        >
                          <Text style={[styles.catChipText, isSel && styles.catChipTextActive]}>
                            {c.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* AI Assistant Box */}
                <View style={styles.aiBox}>
                  <View style={styles.aiBoxHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Ionicons name="sparkles" size={16} color={colors.goldDeep} />
                      <Text style={styles.aiBoxTitle}>AI Artisan Storyteller</Text>
                    </View>
                    <Pressable
                      onPress={handleGenerateStoryDescription}
                      style={styles.aiGenerateBtn}
                    >
                      <Text style={styles.aiGenerateBtnText}>
                        {generatingAi ? 'Composing Story…' : '✨ Generate Product Description'}
                      </Text>
                    </Pressable>
                  </View>

                  <Text style={styles.aiBoxHint}>
                    Let KARIGAAR compose an evocative, heritage-rich description of your handiwork. You can edit before publishing.
                  </Text>

                  <TextInput
                    style={[styles.textInput, { height: 110, marginTop: 10 }]}
                    placeholder="Write the creation’s story, heritage inspiration, and handcrafting technique…"
                    placeholderTextColor={colors.textMuted}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                  />
                </View>
              </View>

              {/* Specifications & Materials */}
              <View style={styles.card}>
                <Text style={styles.cardHeading}>3. Materials, Dimensions & Stock</Text>

                <View style={styles.formRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Materials Used</Text>
                    <TextInput
                      style={styles.textInput}
                      value={materials}
                      onChangeText={setMaterials}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Dimensions</Text>
                    <TextInput
                      style={styles.textInput}
                      value={dimensions}
                      onChangeText={setDimensions}
                    />
                  </View>
                </View>

                <View style={[styles.formRow, { marginTop: 14 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Stock Available</Text>
                    <TextInput
                      style={styles.textInput}
                      value={stock}
                      onChangeText={setStock}
                      keyboardType="number-pad"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Prep Time (Days to Craft)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={preparationDays}
                      onChangeText={setPreparationDays}
                      keyboardType="number-pad"
                    />
                  </View>
                </View>

                <Pressable
                  onPress={() => setAllowCustomization((p) => !p)}
                  style={styles.toggleRow}
                >
                  <View
                    style={[
                      styles.toggleCheckbox,
                      allowCustomization && styles.toggleCheckboxActive,
                    ]}
                  >
                    {allowCustomization && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.toggleLabel}>Allow Bespoke Customization on this product</Text>
                    <Text style={styles.toggleSub}>
                      Permit customers to request custom inscriptions, dimensions, and color options.
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>

            {/* Right Summary Column */}
            <View style={[styles.summaryColumn, isDesktop && { width: '33%' }]}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Pricing & Publication</Text>

                <View style={{ marginBottom: 14 }}>
                  <Text style={styles.fieldLabel}>Customer Price (₹) *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={{ marginBottom: 18 }}>
                  <Text style={styles.fieldLabel}>Original / Comparison Price (₹)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={originalPrice}
                    onChangeText={setOriginalPrice}
                    keyboardType="number-pad"
                  />
                </View>

                <View style={styles.payoutPreview}>
                  <Text style={styles.payoutTitle}>Artisan Payout Preview</Text>
                  <View style={styles.payoutRow}>
                    <Text style={styles.payoutLabel}>Customer Price:</Text>
                    <Text style={styles.payoutVal}>₹{price || 0}</Text>
                  </View>
                  <View style={styles.payoutRow}>
                    <Text style={styles.payoutLabel}>Platform Fee (5%):</Text>
                    <Text style={styles.payoutVal}>-₹{Math.round((parseInt(price, 10) || 0) * 0.05)}</Text>
                  </View>
                  <View style={[styles.payoutRow, { paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.cardBorder }]}>
                    <Text style={styles.payoutTotalLabel}>Your Net Earnings:</Text>
                    <Text style={styles.payoutTotalVal}>
                      ₹{Math.round((parseInt(price, 10) || 0) * 0.95)}
                    </Text>
                  </View>
                </View>

                {/* Publish Button */}
                <Pressable
                  onPress={handlePublish}
                  style={({ pressed }) => [
                    styles.publishBtn,
                    pressed && styles.publishBtnPressed,
                  ]}
                  accessibilityRole="button"
                >
                  <Ionicons name="cloud-upload" size={18} color="#FFFFFF" />
                  <Text style={styles.publishBtnText}>
                    {publishing ? 'Publishing to Marketplace…' : 'Publish Product to Marketplace'}
                  </Text>
                </Pressable>

                <Text style={styles.publishHint}>
                  Once published, this creation will immediately appear under “Trending” and in its category for Pune shoppers!
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
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
    marginBottom: 24,
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
    marginBottom: 8,
  },
  badgeText: {
    fontFamily: fonts.sans.bold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: colors.goldDeep,
  },
  title: {
    fontFamily: fonts.serif.bold,
    fontSize: 28,
    color: colors.charcoal,
  },
  subtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 4,
    maxWidth: 680,
  },
  layout: {
    flexDirection: 'column',
    gap: 24,
  },
  layoutDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 32,
  },
  formColumn: {
    gap: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 24,
    ...shadow.soft,
  },
  cardHeading: {
    fontFamily: fonts.serif.bold,
    fontSize: 17,
    color: colors.charcoal,
    marginBottom: 4,
  },
  cardSub: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  previewImageContainer: {
    width: '100%',
    height: 220,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
  },
  previewImg: {
    width: '100%',
    height: '100%',
  },
  imageOverlayBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(26, 22, 19, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  imageOverlayText: {
    fontFamily: fonts.sans.medium,
    fontSize: 11,
    color: '#FFFFFF',
  },
  selectThumbLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  thumbScroll: {
    gap: 10,
  },
  thumbBtn: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  thumbBtnActive: {
    borderColor: colors.gold,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  fieldLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.charcoal,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  catChips: {
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.marketplaceBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  catChipActive: {
    backgroundColor: colors.charcoal,
    borderColor: colors.charcoal,
  },
  catChipText: {
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  catChipTextActive: {
    color: '#FFFFFF',
  },
  aiBox: {
    backgroundColor: '#FFFDF9',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.goldDim,
    padding: 16,
    marginTop: 8,
  },
  aiBoxHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 6,
  },
  aiBoxTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 14.5,
    color: colors.charcoal,
  },
  aiGenerateBtn: {
    backgroundColor: colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  aiGenerateBtnText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 11.5,
    color: colors.charcoal,
  },
  aiBoxHint: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorderSubtle,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  toggleCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.marketplaceBg,
  },
  toggleCheckboxActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  toggleLabel: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    color: colors.charcoal,
  },
  toggleSub: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  summaryColumn: {
    position: 'relative',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 24,
    ...shadow.medium,
  },
  summaryTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 18,
    color: colors.charcoal,
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  payoutPreview: {
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.md,
    padding: 14,
    gap: 6,
    marginBottom: 20,
  },
  payoutTitle: {
    fontFamily: fonts.sans.bold,
    fontSize: 12,
    color: colors.goldDeep,
    marginBottom: 4,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  payoutLabel: {
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  payoutVal: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.charcoal,
  },
  payoutTotalLabel: {
    fontFamily: fonts.sans.bold,
    fontSize: 13,
    color: colors.charcoal,
  },
  payoutTotalVal: {
    fontFamily: fonts.sans.bold,
    fontSize: 15,
    color: colors.ecoGreen,
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.charcoal,
    height: 48,
    borderRadius: radius.md,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  publishBtnPressed: {
    backgroundColor: colors.gold,
  },
  publishBtnText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
  publishHint: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
  },
});
