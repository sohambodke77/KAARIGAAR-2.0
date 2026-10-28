import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fonts, radius, shadow } from '../theme';

interface TermsPolicyModalProps {
  type: 'terms' | 'privacy' | 'charter' | null;
  onClose: () => void;
}

export function TermsPolicyModal({ type, onClose }: TermsPolicyModalProps) {
  if (!type) return null;

  const title =
    type === 'terms'
      ? 'Terms of Service'
      : type === 'privacy'
      ? 'Privacy Policy'
      : 'Artisan & Creator Charter';

  return (
    <Modal visible={Boolean(type)} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button">
              <Ionicons name="close" size={22} color={colors.creamDim} />
            </Pressable>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={true}>
            {type === 'terms' && (
              <View style={styles.content}>
                <Text style={styles.sectionHeading}>1. Welcome to KARIGAAR</Text>
                <Text style={styles.bodyText}>
                  KARIGAAR (“कारीGaar”) is a curated handmade marketplace created to celebrate the
                  heritage, authenticity, and individuality of genuine handcrafted items. By creating
                  an account, you agree to uphold our community standards.
                </Text>

                <Text style={styles.sectionHeading}>2. Authentic Craftsmanship</Text>
                <Text style={styles.bodyText}>
                  All products sold on KARIGAAR must be genuinely handmade, artisan-finished, or
                  produced in small micro-batches. Commercial mass-manufactured or dropshipped goods
                  are strictly prohibited.
                </Text>

                <Text style={styles.sectionHeading}>3. Orders & Custom Creations</Text>
                <Text style={styles.bodyText}>
                  Buyers can request bespoke customizations. Artisans provide estimates and milestones
                  in good faith. Payments are held in secure escrow until order fulfillment is verified.
                </Text>

                <Text style={styles.sectionHeading}>4. Fair Artisan Support</Text>
                <Text style={styles.bodyText}>
                  KARIGAAR operates on transparent maker-first pricing. Creators receive direct payouts
                  to their verified bank accounts or UPI upon order completion.
                </Text>
              </View>
            )}

            {type === 'privacy' && (
              <View style={styles.content}>
                <Text style={styles.sectionHeading}>1. Information We Collect</Text>
                <Text style={styles.bodyText}>
                  We collect your contact details (name, email, mobile number) and delivery address to
                  facilitate authentic handmade transactions. Creator bank and tax details are stored
                  in encrypted formats strictly for verified payouts.
                </Text>

                <Text style={styles.sectionHeading}>2. Data Security & Cryptography</Text>
                <Text style={styles.bodyText}>
                  All passwords are salted and cryptographically hashed before storage. We never share
                  your personal information or phone number with third-party telemarketers.
                </Text>

                <Text style={styles.sectionHeading}>3. Communications & OTP Verification</Text>
                <Text style={styles.bodyText}>
                  Security OTPs are dispatched strictly for authentication, account recovery, and order
                  updates. You may manage your notification preferences anytime in your Profile.
                </Text>
              </View>
            )}

            {type === 'charter' && (
              <View style={styles.content}>
                <Text style={styles.sectionHeading}>1. The KARIGAAR Artisan Pledge</Text>
                <Text style={styles.bodyText}>
                  “Har Haath Ki Kahani” — Every creation carries a human story. As a registered Creator,
                  you pledge that every listed product is handmade by you, your studio team, or your
                  local craft cluster.
                </Text>

                <Text style={styles.sectionHeading}>2. Transparency & Materials</Text>
                <Text style={styles.bodyText}>
                  Artisans agree to clearly describe crafting techniques, clay, yarn, metals, dyes, or
                  wood used. Eco-friendly and sustainable practices are celebrated with the Eco-Craft badge.
                </Text>

                <Text style={styles.sectionHeading}>3. Payouts & Compliance</Text>
                <Text style={styles.bodyText}>
                  Earnings are calculated on net orders and disbursed directly into your designated bank
                  account via automated settlement schedules.
                </Text>
              </View>
            )}
          </ScrollView>

          <Pressable onPress={onClose} style={styles.doneBtn} accessibilityRole="button">
            <Text style={styles.doneBtnText}>I Understand & Agree</Text>
          </Pressable>
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
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '82%',
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
    paddingBottom: 12,
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.serif.bold,
    fontSize: 20,
    color: colors.goldBright,
  },
  scrollArea: {
    maxHeight: 380,
  },
  content: {
    paddingVertical: 6,
  },
  sectionHeading: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14.5,
    color: colors.cream,
    marginTop: 10,
    marginBottom: 4,
  },
  bodyText: {
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    color: colors.creamDim,
    lineHeight: 19,
    marginBottom: 10,
  },
  doneBtn: {
    backgroundColor: colors.gold,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  doneBtnText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
    color: colors.charcoal,
  },
});
