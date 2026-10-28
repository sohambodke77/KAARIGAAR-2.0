import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { colors, fonts, radius, shadow } from '../theme';
import { Checkbox } from './Checkbox';
import { GoldButton } from './GoldButton';
import { UnderlineInput } from './UnderlineInput';

const CRAFT_CATEGORIES = [
  'Pottery & Ceramics',
  'Crochet & Macramé',
  'Resin & Fluid Art',
  'Handmade Jewellery',
  'Woolen Flowers',
  'Scented Candles',
  'Miniature Paintings',
  'Hand Embroidery',
  'Home Décor',
  'Customized Gifts',
];

interface ArtisanOnboardingModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ArtisanOnboardingModal({
  visible,
  onClose,
  onSuccess,
}: ArtisanOnboardingModalProps) {
  const { user, chooseRole } = useAuth();

  const [brandName, setBrandName] = useState('');
  const [address, setAddress] = useState('');
  const [serviceArea, setServiceArea] = useState('Pan-India');
  const [categories, setCategories] = useState<string[]>(['Pottery & Ceramics']);
  const [bio, setBio] = useState('');
  const [bankAcc, setBankAcc] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accHolder, setAccHolder] = useState(user?.profile?.name || '');
  const [upi, setUpi] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [pan, setPan] = useState('');
  const [gstin, setGstin] = useState('');
  const [terms, setTerms] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleUpgrade = async () => {
    if (!user) return;
    const newErrors: Record<string, string> = {};

    if (!brandName.trim()) newErrors.brandName = 'Please enter your Studio/Brand name.';
    if (!address.trim()) newErrors.address = 'Please enter your workshop address.';
    if (categories.length === 0) newErrors.categories = 'Please select at least 1 craft category.';
    if (!bankAcc.trim()) newErrors.bankAcc = 'Please enter your bank account number.';
    if (!ifsc.trim()) newErrors.ifsc = 'Please enter your bank IFSC code.';
    if (!accHolder.trim()) newErrors.accHolder = 'Please enter the account holder name.';
    if (!terms) newErrors.terms = 'Please accept the Artisan Charter.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      await authService.upgradeToSeller(user.id, {
        brandName: brandName.trim(),
        businessAddress: address.trim(),
        serviceArea: serviceArea.trim(),
        categories,
        bio: bio.trim() || 'Master artisan crafting handmade treasures with heritage passion.',
        bankAccountNumber: bankAcc.trim(),
        ifscCode: ifsc.trim(),
        accountHolderName: accHolder.trim(),
        upiId: upi.trim() || `${brandName.toLowerCase().replace(/[^a-z0-9]/g, '')}@okaxis`,
        bankName: bankName.trim(),
        panNumber: pan.trim(),
        gstin: gstin.trim(),
        businessType: 'Individual Artisan / Proprietorship',
        termsConsent: terms,
      });

      await chooseRole('seller');
      onSuccess();
    } catch (err: any) {
      setErrors({ form: err?.message || 'Upgrade failed. Please check your details.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="sparkles" size={20} color={colors.goldBright} />
              </View>
              <View>
                <Text style={styles.title}>Artisan Studio Setup</Text>
                <Text style={styles.subtitle}>Unlock Maker tools & start selling</Text>
              </View>
            </View>

            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button">
              <Ionicons name="close" size={22} color={colors.creamDim} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <Text style={styles.groupHeading}>1. Studio & Craft Profile</Text>

            <UnderlineInput
              leftIcon="sparkles-outline"
              placeholder="Brand / Studio Name"
              value={brandName}
              onChangeText={(val) => {
                setBrandName(val);
                if (errors.brandName) setErrors((e) => ({ ...e, brandName: '' }));
              }}
              error={errors.brandName}
              editable={!loading}
            />

            <UnderlineInput
              leftIcon="home-outline"
              placeholder="Workshop / Studio Address"
              value={address}
              onChangeText={(val) => {
                setAddress(val);
                if (errors.address) setErrors((e) => ({ ...e, address: '' }));
              }}
              error={errors.address}
              editable={!loading}
            />

            <UnderlineInput
              leftIcon="navigate-outline"
              placeholder="Service Area (e.g. Pan-India, Pune)"
              value={serviceArea}
              onChangeText={setServiceArea}
              editable={!loading}
            />

            {/* Categories */}
            <View style={styles.categoryWrap}>
              <Text style={styles.fieldLabel}>Craft Categories:</Text>
              <View style={styles.chipsRow}>
                {CRAFT_CATEGORIES.map((cat) => {
                  const sel = categories.includes(cat);
                  return (
                    <Pressable
                      key={cat}
                      onPress={() => toggleCategory(cat)}
                      style={[styles.chip, sel && styles.chipSelected]}
                      accessibilityRole="button"
                    >
                      <Ionicons
                        name={sel ? 'checkmark' : 'add'}
                        size={12}
                        color={sel ? colors.charcoal : colors.goldBright}
                      />
                      <Text style={[styles.chipText, sel && styles.chipTextSelected]}>{cat}</Text>
                    </Pressable>
                  );
                })}
              </View>
              {errors.categories ? <Text style={styles.fieldError}>{errors.categories}</Text> : null}
            </View>

            <UnderlineInput
              leftIcon="create-outline"
              placeholder="Artisan Bio & Craft Story"
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              editable={!loading}
            />

            <Text style={styles.groupHeading}>2. Payout & Bank Information</Text>

            <UnderlineInput
              leftIcon="card-outline"
              placeholder="Bank Account Number"
              value={bankAcc}
              onChangeText={(val) => {
                setBankAcc(val);
                if (errors.bankAcc) setErrors((e) => ({ ...e, bankAcc: '' }));
              }}
              keyboardType="number-pad"
              error={errors.bankAcc}
              editable={!loading}
            />

            <UnderlineInput
              leftIcon="business-outline"
              placeholder="IFSC Code (e.g. HDFC0001248)"
              value={ifsc}
              onChangeText={(val) => {
                setIfsc(val.toUpperCase());
                if (errors.ifsc) setErrors((e) => ({ ...e, ifsc: '' }));
              }}
              autoCapitalize="characters"
              error={errors.ifsc}
              editable={!loading}
            />

            <UnderlineInput
              leftIcon="person-circle-outline"
              placeholder="Account Holder Name"
              value={accHolder}
              onChangeText={(val) => {
                setAccHolder(val);
                if (errors.accHolder) setErrors((e) => ({ ...e, accHolder: '' }));
              }}
              error={errors.accHolder}
              editable={!loading}
            />

            <UnderlineInput
              leftIcon="wallet-outline"
              placeholder="UPI ID (e.g. maker@okhdfcbank)"
              value={upi}
              onChangeText={setUpi}
              editable={!loading}
            />

            <Text style={styles.groupHeading}>3. Tax Compliance</Text>

            <View style={styles.twoCol}>
              <View style={styles.col}>
                <UnderlineInput
                  leftIcon="document-text-outline"
                  placeholder="PAN Number"
                  value={pan}
                  onChangeText={(val) => setPan(val.toUpperCase())}
                  autoCapitalize="characters"
                  editable={!loading}
                />
              </View>
              <View style={styles.col}>
                <UnderlineInput
                  leftIcon="receipt-outline"
                  placeholder="GSTIN (Optional)"
                  value={gstin}
                  onChangeText={(val) => setGstin(val.toUpperCase())}
                  autoCapitalize="characters"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.termsRow}>
              <Checkbox checked={terms} onChange={setTerms} label="" disabled={loading} />
              <Text style={styles.termsText}>
                I pledge that my products are genuinely handmade and agree to the Artisan Charter.
              </Text>
            </View>
            {errors.terms ? <Text style={styles.fieldError}>{errors.terms}</Text> : null}

            {errors.form ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={15} color={colors.danger} />
                <Text style={styles.errorBannerText}>{errors.form}</Text>
              </View>
            ) : null}

            <View style={styles.btnWrapper}>
              <GoldButton
                label="Launch My Creator Studio"
                loadingLabel="Setting up studio…"
                onPress={handleUpgrade}
                loading={loading}
                disabled={loading}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 6, 4, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 540,
    maxHeight: '90%',
    backgroundColor: '#1E140E',
    borderRadius: radius.xl,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(220, 175, 95, 0.35)',
    ...shadow.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    paddingBottom: 14,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(197, 147, 65, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(220, 175, 95, 0.30)',
  },
  title: {
    fontFamily: fonts.serif.bold,
    fontSize: 18,
    color: colors.cream,
  },
  subtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.creamDim,
  },
  scrollArea: {
    maxHeight: 480,
  },
  groupHeading: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13.5,
    color: colors.goldBright,
    marginTop: 14,
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  categoryWrap: {
    marginVertical: 10,
  },
  fieldLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
    color: colors.creamDim,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(220, 175, 95, 0.25)',
  },
  chipSelected: {
    backgroundColor: colors.gold,
    borderColor: colors.goldBright,
  },
  chipText: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    color: colors.cream,
  },
  chipTextSelected: {
    fontFamily: fonts.sans.semibold,
    color: colors.charcoal,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 10,
  },
  termsText: {
    flex: 1,
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    color: colors.creamDim,
    lineHeight: 17,
  },
  fieldError: {
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    color: colors.danger,
    marginTop: 4,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(226, 109, 92, 0.15)',
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    padding: 10,
    marginTop: 10,
  },
  errorBannerText: {
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    color: colors.danger,
    flex: 1,
  },
  btnWrapper: {
    marginTop: 18,
    marginBottom: 10,
  },
});
