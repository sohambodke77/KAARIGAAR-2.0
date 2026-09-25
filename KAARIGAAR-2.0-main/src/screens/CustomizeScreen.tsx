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
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { BackButton } from '../components/BackButton';
import { BottomNavigation } from '../components/BottomNavigation';
import { MarketplaceHeader } from '../components/MarketplaceHeader';
import { useMarketplace } from '../context/MarketplaceContext';
import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadow } from '../theme';

type CustomizeScreenRouteProp = RouteProp<AppStackParamList, 'Customize'>;

const COLOR_OPTIONS = [
  { name: 'Warm Mustard Gold', hex: '#D4A359', extra: 0 },
  { name: 'Terracotta Earth', hex: '#C86D51', extra: 0 },
  { name: 'Sage Leaf Green', hex: '#6A8E72', extra: 0 },
  { name: 'Raw Natural Ivory', hex: '#FAF6F0', extra: 0 },
  { name: 'Midnight Charcoal', hex: '#26221E', extra: 50 },
  { name: 'Indigo Heritage', hex: '#3B4D61', extra: 50 },
];

const SIZE_OPTIONS = [
  { label: 'Standard Compact', blurb: 'Ideal for desks & shelves', extra: 0 },
  { label: 'Medium Classic (+₹120)', blurb: 'Most popular handcrafted size', extra: 120 },
  { label: 'Grand Statement (+₹280)', blurb: 'Heirloom centerpiece', extra: 280 },
];

const MATERIAL_OPTIONS = [
  { label: 'Organic Combed Cotton', extra: 0 },
  { label: 'Merino Wool Blend (+₹80)', extra: 80 },
  { label: 'Jute & Raw Silk Fibers (+₹150)', extra: 150 },
];

const PATTERN_OPTIONS = [
  'Artisan Original Motif',
  'Minimalist Botanical',
  'Festive Intricate Weave',
  'Geometric Folk Pattern',
];

export function CustomizeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<CustomizeScreenRouteProp>();
  const { productId } = route.params;

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const { products, addToCart } = useMarketplace();
  const product = products.find((p) => p.id === productId) || products[0];

  // Customization Form State
  const [customName, setCustomName] = useState('');
  const [initials, setInitials] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [selectedSize, setSelectedSize] = useState(SIZE_OPTIONS[0]);
  const [selectedMaterial, setSelectedMaterial] = useState(MATERIAL_OPTIONS[0]);
  const [selectedPattern, setSelectedPattern] = useState(PATTERN_OPTIONS[0]);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [mockPhotoUploaded, setMockPhotoUploaded] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Price Calculation
  const basePrice = product.price;
  const customizationAddons =
    selectedColor.extra +
    selectedSize.extra +
    selectedMaterial.extra +
    (customName.trim() ? 50 : 0);
  const unitPrice = basePrice + customizationAddons;
  const totalPrice = unitPrice * quantity;
  const estimatedDays = product.preparationDays + 2;

  const handleAddToCart = () => {
    addToCart(product, quantity, {
      customerName: customName.trim() || undefined,
      initials: initials.trim() || undefined,
      message: personalMessage.trim() || undefined,
      color: selectedColor.name,
      size: selectedSize.label,
      material: selectedMaterial.label,
      pattern: selectedPattern,
      specialInstructions: specialInstructions.trim() || undefined,
      hasReferenceImage: mockPhotoUploaded,
      extraPrice: customizationAddons,
    });

    setSubmitted(true);
    setTimeout(() => {
      navigation.navigate('Cart');
    }, 800);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <MarketplaceHeader />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Back Row */}
          <View style={styles.backRow}>
            <BackButton label="Back to Product Details" fallbackRoute="CustomerHome" />
          </View>

          {/* Heading */}
          <View style={styles.headingBlock}>
            <View style={styles.sparkleBadge}>
              <Ionicons name="sparkles" size={13} color={colors.goldBright} />
              <Text style={styles.sparkleBadgeText}>BESPOKE ARTISAN WORKSHOP</Text>
            </View>
            <Text style={styles.mainTitle}>Customize This Creation</Text>
            <Text style={styles.mainSubtitle}>
              Personalize colors, engraved names, patterns, and materials. Handcrafted exclusively for you by {product.creatorName}.
            </Text>
          </View>

          {/* Product Preview Bar */}
          <View style={styles.productBar}>
            <Image source={{ uri: product.images[0] }} style={styles.productThumb} />
            <View style={styles.productBarDetails}>
              <Text style={styles.productBarCategory}>{product.category}</Text>
              <Text style={styles.productBarName}>{product.name}</Text>
              <Text style={styles.productBarMaker}>by {product.creatorName} ({product.creatorLocation})</Text>
            </View>
            <View style={styles.productBarPrice}>
              <Text style={styles.barBasePriceLabel}>Base Price</Text>
              <Text style={styles.barBasePriceVal}>₹{product.price}</Text>
            </View>
          </View>

          {/* Layout: Options on Left, Live Summary on Right */}
          <View style={[styles.bodyLayout, isDesktop && styles.bodyLayoutDesktop]}>
            {/* Form Column */}
            <View style={[styles.formColumn, isDesktop && { width: '62%' }]}>
              {/* 1. Name & Inscription */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldSectionTitle}>1. Name & Inscription (Optional)</Text>
                <Text style={styles.fieldSectionDesc}>
                  Artisan will hand-stitch, embroider, or paint this onto your piece (+₹50).
                </Text>

                <View style={styles.inputRow}>
                  <View style={{ flex: 2 }}>
                    <Text style={styles.inputLabel}>Full Name or Custom Inscription</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. Ananya & Rohan"
                      placeholderTextColor={colors.textMuted}
                      value={customName}
                      onChangeText={setCustomName}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputLabel}>Initials</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="e.g. A & R"
                      placeholderTextColor={colors.textMuted}
                      value={initials}
                      onChangeText={setInitials}
                      maxLength={6}
                    />
                  </View>
                </View>

                <View style={{ marginTop: 12 }}>
                  <Text style={styles.inputLabel}>Gift Message or Dedication Note</Text>
                  <TextInput
                    style={[styles.textInput, { height: 72 }]}
                    placeholder="Included as a calligraphy card with your handcrafted package…"
                    placeholderTextColor={colors.textMuted}
                    value={personalMessage}
                    onChangeText={setPersonalMessage}
                    multiline
                  />
                </View>
              </View>

              {/* 2. Color Palette Selection */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldSectionTitle}>2. Choose Color Palette</Text>
                <Text style={styles.fieldSectionDesc}>Select your preferred yarn, glaze, or pigment shade:</Text>
                <View style={styles.colorSwatchesGrid}>
                  {COLOR_OPTIONS.map((c) => {
                    const isSelected = selectedColor.name === c.name;
                    return (
                      <Pressable
                        key={c.name}
                        onPress={() => setSelectedColor(c)}
                        style={[
                          styles.colorOptionCard,
                          isSelected && styles.colorOptionCardSelected,
                        ]}
                      >
                        <View
                          style={[
                            styles.colorCircle,
                            { backgroundColor: c.hex },
                            c.hex === '#FAF6F0' && { borderWidth: 1, borderColor: colors.cardBorder },
                          ]}
                        />
                        <View>
                          <Text style={styles.colorName}>{c.name}</Text>
                          {c.extra > 0 && <Text style={styles.colorExtra}>+₹{c.extra}</Text>}
                        </View>
                        {isSelected && (
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color={colors.goldDeep}
                            style={{ marginLeft: 'auto' }}
                          />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* 3. Size & Dimensions */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldSectionTitle}>3. Size & Scale</Text>
                <View style={styles.optionsList}>
                  {SIZE_OPTIONS.map((sz) => {
                    const isSelected = selectedSize.label === sz.label;
                    return (
                      <Pressable
                        key={sz.label}
                        onPress={() => setSelectedSize(sz)}
                        style={[
                          styles.radioOptionRow,
                          isSelected && styles.radioOptionRowSelected,
                        ]}
                      >
                        <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                          {isSelected && <View style={styles.radioInnerDot} />}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.radioTitle}>{sz.label}</Text>
                          <Text style={styles.radioBlurb}>{sz.blurb}</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* 4. Material Customization */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldSectionTitle}>4. Craft Material</Text>
                <View style={styles.optionsList}>
                  {MATERIAL_OPTIONS.map((mat) => {
                    const isSelected = selectedMaterial.label === mat.label;
                    return (
                      <Pressable
                        key={mat.label}
                        onPress={() => setSelectedMaterial(mat)}
                        style={[
                          styles.radioOptionRow,
                          isSelected && styles.radioOptionRowSelected,
                        ]}
                      >
                        <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                          {isSelected && <View style={styles.radioInnerDot} />}
                        </View>
                        <Text style={styles.radioTitle}>{mat.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* 5. Pattern / Style */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldSectionTitle}>5. Pattern & Theme</Text>
                <View style={styles.patternPills}>
                  {PATTERN_OPTIONS.map((pat) => {
                    const isSelected = selectedPattern === pat;
                    return (
                      <Pressable
                        key={pat}
                        onPress={() => setSelectedPattern(pat)}
                        style={[
                          styles.patternPill,
                          isSelected && styles.patternPillSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.patternPillText,
                            isSelected && styles.patternPillTextSelected,
                          ]}
                        >
                          {pat}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* 6. Reference Photo Upload & Special Instructions */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldSectionTitle}>6. Reference Photo & Maker Notes</Text>
                <Text style={styles.fieldSectionDesc}>
                  Share a sample decor photo or specific color swatch for the maker:
                </Text>

                <Pressable
                  onPress={() => setMockPhotoUploaded((p) => !p)}
                  style={[
                    styles.mockUploadBox,
                    mockPhotoUploaded && styles.mockUploadBoxDone,
                  ]}
                >
                  <Ionicons
                    name={mockPhotoUploaded ? 'image' : 'cloud-upload-outline'}
                    size={28}
                    color={mockPhotoUploaded ? colors.ecoGreen : colors.gold}
                  />
                  <Text style={styles.uploadBoxText}>
                    {mockPhotoUploaded
                      ? '✓ Sample reference photo attached (my_room_palette.jpg)'
                      : 'Tap to upload reference photo (decor, color matching, or inspiration)'}
                  </Text>
                  <Text style={styles.uploadBoxHint}>PNG, JPG up to 10MB</Text>
                </Pressable>

                <View style={{ marginTop: 16 }}>
                  <Text style={styles.inputLabel}>Special Maker Instructions</Text>
                  <TextInput
                    style={[styles.textInput, { height: 80 }]}
                    placeholder="e.g. Please make the sunflower petals slightly brighter yellow to match my balcony cushions…"
                    placeholderTextColor={colors.textMuted}
                    value={specialInstructions}
                    onChangeText={setSpecialInstructions}
                    multiline
                  />
                </View>
              </View>
            </View>

            {/* Right Summary Column */}
            <View style={[styles.summaryColumn, isDesktop && { width: '35%' }]}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>Customization Summary</Text>

                <View style={styles.summaryList}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryItemLabel}>Base Product:</Text>
                    <Text style={styles.summaryItemVal}>₹{basePrice}</Text>
                  </View>

                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryItemLabel}>Color:</Text>
                    <Text style={styles.summaryItemVal}>
                      {selectedColor.name} {selectedColor.extra > 0 ? `(+₹${selectedColor.extra})` : ''}
                    </Text>
                  </View>

                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryItemLabel}>Size:</Text>
                    <Text style={styles.summaryItemVal}>{selectedSize.label}</Text>
                  </View>

                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryItemLabel}>Material:</Text>
                    <Text style={styles.summaryItemVal}>{selectedMaterial.label}</Text>
                  </View>

                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryItemLabel}>Pattern:</Text>
                    <Text style={styles.summaryItemVal}>{selectedPattern}</Text>
                  </View>

                  {customName.trim() ? (
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryItemLabel}>Engraved Name:</Text>
                      <Text style={styles.summaryItemVal}>“{customName}” (+₹50)</Text>
                    </View>
                  ) : null}

                  {mockPhotoUploaded ? (
                    <View style={styles.summaryItem}>
                      <Text style={styles.summaryItemLabel}>Photo Reference:</Text>
                      <Text style={[styles.summaryItemVal, { color: colors.ecoGreen }]}>Attached ✓</Text>
                    </View>
                  ) : null}
                </View>

                {/* Crafting Time Note */}
                <View style={styles.craftTimeBox}>
                  <Ionicons name="time-outline" size={18} color={colors.gold} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.craftTimeTitle}>Estimated Creation Time</Text>
                    <Text style={styles.craftTimeText}>
                      {estimatedDays} to {estimatedDays + 2} days handcrafted by {product.creatorName}
                    </Text>
                  </View>
                </View>

                {/* Quantity */}
                <View style={styles.summaryQuantityRow}>
                  <Text style={styles.summaryQuantityLabel}>Quantity:</Text>
                  <View style={styles.quantityControl}>
                    <Pressable
                      onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                      style={styles.qtyBtn}
                    >
                      <Ionicons name="remove" size={16} color={colors.charcoal} />
                    </Pressable>
                    <Text style={styles.qtyText}>{quantity}</Text>
                    <Pressable
                      onPress={() => setQuantity((q) => q + 1)}
                      style={styles.qtyBtn}
                    >
                      <Ionicons name="add" size={16} color={colors.charcoal} />
                    </Pressable>
                  </View>
                </View>

                {/* Final Total */}
                <View style={styles.summaryTotalRow}>
                  <Text style={styles.summaryTotalLabel}>Total Price:</Text>
                  <Text style={styles.summaryTotalValue}>₹{totalPrice}</Text>
                </View>

                {/* Request CTA */}
                <Pressable
                  onPress={handleAddToCart}
                  style={({ pressed }) => [
                    styles.submitCta,
                    pressed && styles.submitCtaPressed,
                  ]}
                  accessibilityRole="button"
                >
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                  <Text style={styles.submitCtaText}>
                    {submitted ? 'Adding to Cart…' : 'Request Custom Creation'}
                  </Text>
                </Pressable>

                <Text style={styles.satisfactionNote}>
                  🛡️ Karigaar Artisan Guarantee: If the customized creation does not match your brief, free remake is guaranteed.
                </Text>
              </View>
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
  headingBlock: {
    marginBottom: 20,
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
  mainTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 28,
    color: colors.charcoal,
  },
  mainSubtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginTop: 6,
    maxWidth: 680,
  },
  productBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
    ...shadow.soft,
  },
  productThumb: {
    width: 60,
    height: 60,
    borderRadius: radius.md,
  },
  productBarDetails: {
    flex: 1,
  },
  productBarCategory: {
    fontFamily: fonts.sans.bold,
    fontSize: 10.5,
    letterSpacing: 1,
    color: colors.goldDeep,
  },
  productBarName: {
    fontFamily: fonts.serif.bold,
    fontSize: 16,
    color: colors.charcoal,
  },
  productBarMaker: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  productBarPrice: {
    alignItems: 'flex-end',
  },
  barBasePriceLabel: {
    fontFamily: fonts.sans.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  barBasePriceVal: {
    fontFamily: fonts.sans.bold,
    fontSize: 18,
    color: colors.charcoal,
  },
  bodyLayout: {
    flexDirection: 'column',
    gap: 24,
  },
  bodyLayoutDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 32,
  },
  formColumn: {
    gap: 20,
  },
  fieldSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 20,
    ...shadow.soft,
  },
  fieldSectionTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 18,
    color: colors.charcoal,
    marginBottom: 4,
  },
  fieldSectionDesc: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.charcoal,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    color: colors.textPrimary,
    outlineWidth: 0,
  },
  colorSwatchesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorOptionCard: {
    width: Platform.OS === 'web' ? '48%' : '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.marketplaceBg,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  colorOptionCardSelected: {
    borderColor: colors.gold,
    backgroundColor: '#FFFDF9',
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  colorName: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.charcoal,
  },
  colorExtra: {
    fontFamily: fonts.sans.bold,
    fontSize: 11,
    color: colors.goldDeep,
  },
  optionsList: {
    gap: 10,
  },
  radioOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.marketplaceBg,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  radioOptionRowSelected: {
    borderColor: colors.gold,
    backgroundColor: '#FFFDF9',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: colors.gold,
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.gold,
  },
  radioTitle: {
    fontFamily: fonts.sans.medium,
    fontSize: 13.5,
    color: colors.charcoal,
  },
  radioBlurb: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  patternPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  patternPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: colors.marketplaceBg,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  patternPillSelected: {
    backgroundColor: colors.charcoal,
    borderColor: colors.charcoal,
  },
  patternPillText: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  patternPillTextSelected: {
    color: '#FFFFFF',
  },
  mockUploadBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.goldDim,
    borderRadius: radius.lg,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.marketplaceBg,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  mockUploadBoxDone: {
    borderColor: colors.ecoGreen,
    backgroundColor: '#F3FAF4',
  },
  uploadBoxText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.charcoal,
    textAlign: 'center',
    marginTop: 8,
  },
  uploadBoxHint: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 4,
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
    fontSize: 20,
    color: colors.charcoal,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  summaryList: {
    gap: 10,
    marginBottom: 18,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  summaryItemLabel: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textSecondary,
  },
  summaryItemVal: {
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    color: colors.charcoal,
    textAlign: 'right',
    flex: 1,
  },
  craftTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF8E8',
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 18,
  },
  craftTimeTitle: {
    fontFamily: fonts.sans.bold,
    fontSize: 11.5,
    letterSpacing: 0.5,
    color: colors.goldDeep,
  },
  craftTimeText: {
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    color: colors.charcoal,
    marginTop: 1,
  },
  summaryQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  summaryQuantityLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: 13.5,
    color: colors.charcoal,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 4,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontFamily: fonts.sans.bold,
    fontSize: 14,
    paddingHorizontal: 8,
    color: colors.charcoal,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    marginBottom: 20,
  },
  summaryTotalLabel: {
    fontFamily: fonts.sans.bold,
    fontSize: 16,
    color: colors.charcoal,
  },
  summaryTotalValue: {
    fontFamily: fonts.sans.bold,
    fontSize: 26,
    color: colors.charcoal,
  },
  submitCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.charcoal,
    height: 50,
    borderRadius: radius.md,
    ...shadow.medium,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  submitCtaPressed: {
    backgroundColor: colors.gold,
  },
  submitCtaText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14.5,
    color: '#FFFFFF',
  },
  satisfactionNote: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    lineHeight: 16,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 14,
  },
});
