import { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth, type Role } from '../context/AuthContext';
import { colors, fonts, radius, shadow } from '../theme';

const logoAsset = require('../../assets/kaarigaar_logo.png');

interface RoleOption {
  role: Role;
  iconName: 'bag-handle-outline' | 'hammer-outline';
  title: 'I’m a Customer' | 'I’m a Creator';
  description: string;
  ctaText: string;
}

const ROLES_DATA: RoleOption[] = [
  {
    role: 'customer',
    iconName: 'bag-handle-outline',
    title: 'I’m a Customer',
    description:
      'Discover unique handmade products, find meaningful gifts, customize creations, and connect with makers.',
    ctaText: 'Explore Handmade →',
  },
  {
    role: 'seller',
    iconName: 'hammer-outline',
    title: 'I’m a Creator',
    description:
      'Showcase your craft, receive custom orders, reach new customers, and grow your handmade business.',
    ctaText: 'Start Creating →',
  },
];

export function RoleScreen() {
  const { chooseRole } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loadingRole, setLoadingRole] = useState<Role | null>(null);

  const handleSelectAndProceed = async (role: Role) => {
    setSelectedRole(role);
    setLoadingRole(role);
    try {
      await chooseRole(role);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoEmblemContainer}>
            <Image source={logoAsset} style={styles.logoEmblem} resizeMode="contain" />
          </View>
          <Text style={styles.brandTitle}>KARIGAAR</Text>
          <Text style={styles.brandTagline}>Har Haath Ki Kahani</Text>
        </View>

        {/* Title and Subtitle Block */}
        <View style={styles.headingsBlock}>
          <Text style={styles.welcomeTitle}>Welcome to KARIGAAR</Text>
          <Text style={styles.welcomeSubtitle}>
            Every creation has a story. How will you use KARIGAAR?
          </Text>
          <View style={styles.roleEyebrowBadge}>
            <Text style={styles.roleEyebrowText}>Choose your role</Text>
          </View>
        </View>

        {/* Two Large Role Cards */}
        <View style={styles.cardsContainer}>
          {ROLES_DATA.map((item) => {
            const isSelected = selectedRole === item.role;
            const isLoading = loadingRole === item.role;

            return (
              <Pressable
                key={item.role}
                onPress={() => handleSelectAndProceed(item.role)}
                style={({ pressed }) => [
                  styles.roleCard,
                  isSelected ? styles.cardSelected : styles.cardUnselected,
                  pressed && styles.cardPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${item.title}: ${item.description}`}
              >
                {/* Header row with Icon and Radio Check */}
                <View style={styles.cardHeaderRow}>
                  <View
                    style={[
                      styles.iconCircle,
                      isSelected ? styles.iconCircleSelected : styles.iconCircleUnselected,
                    ]}
                  >
                    <Ionicons
                      name={item.iconName}
                      size={24}
                      color={isSelected ? colors.goldBright : colors.charcoal}
                    />
                  </View>

                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={14} color={colors.charcoal} />
                    )}
                  </View>
                </View>

                {/* Card Title & Description */}
                <Text
                  style={[
                    styles.cardTitle,
                    isSelected ? styles.cardTitleSelected : styles.cardTitleUnselected,
                  ]}
                >
                  {item.title}
                </Text>

                <Text
                  style={[
                    styles.cardDescription,
                    isSelected
                      ? styles.cardDescriptionSelected
                      : styles.cardDescriptionUnselected,
                  ]}
                >
                  {item.description}
                </Text>

                {/* Card CTA */}
                <View
                  style={[
                    styles.cardCtaButton,
                    isSelected
                      ? styles.cardCtaButtonSelected
                      : styles.cardCtaButtonUnselected,
                  ]}
                >
                  <Text
                    style={[
                      styles.cardCtaText,
                      isSelected
                        ? styles.cardCtaTextSelected
                        : styles.cardCtaTextUnselected,
                    ]}
                  >
                    {isLoading ? 'Loading experience…' : item.ctaText}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Footer note */}
        <Text style={styles.footerNote}>
          You can switch between Customer and Creator roles anytime from your profile.
        </Text>
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    maxWidth: 720,
    width: '100%',
    alignSelf: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoEmblemContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.charcoal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoEmblem: {
    width: 32,
    height: 32,
  },
  brandTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 20,
    letterSpacing: 2.2,
    color: colors.charcoal,
  },
  brandTagline: {
    fontFamily: fonts.sans.medium,
    fontSize: 11.5,
    letterSpacing: 1.2,
    color: colors.goldDeep,
    marginTop: 2,
  },
  headingsBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  welcomeTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 28,
    lineHeight: 36,
    color: colors.charcoal,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontFamily: fonts.sans.regular,
    fontSize: 14.5,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 480,
  },
  roleEyebrowBadge: {
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  roleEyebrowText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    letterSpacing: 1.2,
    color: colors.goldDeep,
    textTransform: 'uppercase',
  },
  cardsContainer: {
    gap: 20,
    width: '100%',
  },
  roleCard: {
    borderRadius: radius.xl,
    padding: 24,
    width: '100%',
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        } as never)
      : {}),
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
  },
  cardSelected: {
    backgroundColor: colors.charcoal,
    borderWidth: 1.5,
    borderColor: colors.gold,
    ...shadow.card,
  },
  cardUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadow.soft,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSelected: {
    backgroundColor: 'rgba(212, 163, 89, 0.18)',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  iconCircleUnselected: {
    backgroundColor: colors.marketplaceBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  radioCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    backgroundColor: colors.gold,
    borderColor: colors.goldBright,
  },
  cardTitle: {
    fontFamily: fonts.serif.bold,
    fontSize: 22,
    marginBottom: 8,
  },
  cardTitleSelected: {
    color: '#FFFFFF',
  },
  cardTitleUnselected: {
    color: colors.charcoal,
  },
  cardDescription: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  cardDescriptionSelected: {
    color: colors.beige,
  },
  cardDescriptionUnselected: {
    color: colors.textSecondary,
  },
  cardCtaButton: {
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCtaButtonSelected: {
    backgroundColor: colors.gold,
  },
  cardCtaButtonUnselected: {
    backgroundColor: colors.marketplaceBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardCtaText: {
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
    letterSpacing: 0.3,
  },
  cardCtaTextSelected: {
    color: colors.charcoal,
  },
  cardCtaTextUnselected: {
    color: colors.charcoal,
  },
  footerNote: {
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 28,
  },
});