import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import type { Product } from '../context/MarketplaceContext';
import { colors, fonts, radius, shadow } from '../theme';

interface DigitalPassportModalProps {
  visible: boolean;
  product: Product;
  onClose: () => void;
}

export function DigitalPassportModal({
  visible,
  product,
  onClose,
}: DigitalPassportModalProps) {
  const { passport } = product;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons name="certificate-outline" size={22} color={colors.gold} />
              </View>
              <View>
                <Text style={styles.headerBadge}>AUTHENTIC CREATION</Text>
                <Text style={styles.headerTitle}>Digital Handmade Passport</Text>
              </View>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close passport"
            >
              <Ionicons name="close" size={20} color={colors.charcoal} />
            </Pressable>
          </View>

          <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
            {/* Passport Intro Banner */}
            <View style={styles.introBanner}>
              <Text style={styles.introTitle}>{product.name}</Text>
              <Text style={styles.introCreator}>
                Crafted by <Text style={{ fontFamily: fonts.sans.semibold }}>{product.creatorName}</Text> ({product.creatorBrand})
              </Text>
              <Text style={styles.introLocation}>📍 {passport.origin}</Text>
            </View>

            {/* Passport Detail Items */}
            <View style={styles.specsGrid}>
              {/* Craft Technique */}
              <View style={styles.specItem}>
                <View style={styles.specIcon}>
                  <Ionicons name="hammer-outline" size={18} color={colors.gold} />
                </View>
                <View style={styles.specTextContent}>
                  <Text style={styles.specLabel}>CRAFT TECHNIQUE</Text>
                  <Text style={styles.specValue}>{passport.craftType}</Text>
                </View>
              </View>

              {/* Time Spent */}
              <View style={styles.specItem}>
                <View style={styles.specIcon}>
                  <Ionicons name="time-outline" size={18} color={colors.gold} />
                </View>
                <View style={styles.specTextContent}>
                  <Text style={styles.specLabel}>ARTISAN TIME INVESTMENT</Text>
                  <Text style={styles.specValue}>{passport.hoursToCraft}</Text>
                </View>
              </View>

              {/* Materials */}
              <View style={styles.specItem}>
                <View style={styles.specIcon}>
                  <Ionicons name="leaf-outline" size={18} color={colors.ecoGreen} />
                </View>
                <View style={styles.specTextContent}>
                  <Text style={styles.specLabel}>SUSTAINABLE MATERIALS</Text>
                  <View style={styles.materialTagsRow}>
                    {passport.materials.map((mat) => (
                      <View key={mat} style={styles.materialPill}>
                        <Text style={styles.materialPillText}>{mat}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>

              {/* Batch Info */}
              <View style={styles.specItem}>
                <View style={styles.specIcon}>
                  <Ionicons name="barcode-outline" size={18} color={colors.gold} />
                </View>
                <View style={styles.specTextContent}>
                  <Text style={styles.specLabel}>BATCH & EDITION</Text>
                  <Text style={styles.specValue}>{passport.batchInfo}</Text>
                </View>
              </View>
            </View>

            {/* Authenticity Guarantee Note */}
            <View style={styles.guaranteeBox}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Ionicons name="shield-checkmark" size={16} color={colors.gold} />
                <Text style={styles.guaranteeHeading}>Karigaar Artisan Assurance</Text>
              </View>
              <Text style={styles.guaranteeText}>
                {passport.authenticityGuarantee} Every creation on KARIGAAR is individually crafted by independent artisans, honoring slow living and handmade heritage.
              </Text>
            </View>

            <Pressable
              onPress={onClose}
              style={styles.doneButton}
              accessibilityRole="button"
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(26, 22, 19, 0.70)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        } as never)
      : {}),
  },
  card: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: '#FFFFFF',
    borderRadius: radius.xl,
    padding: 24,
    ...shadow.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.marketplaceBg,
    borderWidth: 1,
    borderColor: colors.goldDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadge: {
    fontFamily: fonts.sans.bold,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.goldDeep,
  },
  headerTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 18,
    color: colors.charcoal,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.marketplaceBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyScroll: {
    marginTop: 14,
  },
  introBanner: {
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  introTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 16,
    color: colors.charcoal,
    marginBottom: 4,
  },
  introCreator: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  introLocation: {
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    color: colors.textMuted,
  },
  specsGrid: {
    gap: 14,
    marginBottom: 18,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  specIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: colors.marketplaceBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  specTextContent: {
    flex: 1,
  },
  specLabel: {
    fontFamily: fonts.sans.semibold,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: colors.textMuted,
    marginBottom: 2,
  },
  specValue: {
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  materialTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  materialPill: {
    backgroundColor: colors.marketplaceBg,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  materialPillText: {
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  guaranteeBox: {
    backgroundColor: '#FFFDF9',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.goldDim,
    padding: 14,
    marginBottom: 20,
  },
  guaranteeHeading: {
    fontFamily: fonts.sans.semibold,
    fontSize: 12.5,
    color: colors.charcoal,
  },
  guaranteeText: {
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  doneButton: {
    backgroundColor: colors.charcoal,
    borderRadius: radius.md,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  doneButtonText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
