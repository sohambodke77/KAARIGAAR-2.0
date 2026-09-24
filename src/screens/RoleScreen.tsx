import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth, type Role } from '../context/AuthContext';
import { Badge } from '../components/Badge';
import type { IconName } from '../data/categories';
import { colors, fonts, light } from '../theme';

interface Experience {
  role: Role;
  icon: IconName;
  title: string;
  description: string;
  cta: string;
}

const EXPERIENCES: Experience[] = [
  {
    role: 'customer',
    icon: 'bag-handle-outline',
    title: "I'm a Customer",
    description:
      'Discover unique handmade products, find meaningful gifts, customize creations, and connect with makers.',
    cta: 'Explore Handmade →',
  },
  {
    role: 'seller',
    icon: 'storefront-outline',
    title: "I'm a Creator",
    description:
      'Showcase your craft, receive custom orders, reach new customers, and grow your handmade business.',
    cta: 'Start Creating →',
  },
];

export function RoleScreen() {
  const { chooseRole } = useAuth();
  const [selected, setSelected] = useState<Role | null>(null);
  const [busy, setBusy] = useState<Role | null>(null);

  const handleContinue = async (role: Role) => {
    if (busy) return;
    setBusy(role);
    await chooseRole(role);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headingBlock}>
          <Text style={styles.eyebrow}>KARIGAAR · कारीGaar</Text>
          <Text style={styles.heading}>Welcome to KARIGAAR</Text>
          <Text style={styles.subtitle}>Every creation has a story. How will you use KARIGAAR?</Text>
        </View>

        <View style={styles.cards}>
          {EXPERIENCES.map((item) => {
            const isSelected = selected === item.role;
            return (
              <Pressable
                key={item.role}
                onPress={() => setSelected(item.role)}
                style={({ pressed }) => [
                  styles.card,
                  isSelected && styles.cardSelected,
                  pressed && { opacity: 0.92 },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={item.title}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconCircle, isSelected && styles.iconCircleSelected]}>
                    <Ionicons name={item.icon} size={24} color={isSelected ? colors.goldBright : '#A9823A'} />
                  </View>
                  <Text style={[styles.cardTitle, isSelected && styles.textLight]}>
                    {item.title}
                  </Text>
                  {isSelected ? <Badge text="Selected" tone="dark" /> : null}
                </View>

                <Text style={[styles.cardBody, isSelected && styles.textLightMuted]}>
                  {item.description}
                </Text>

                <Pressable
                  onPress={() => handleContinue(item.role)}
                  style={({ pressed }) => [
                    styles.cta,
                    isSelected && styles.ctaSelected,
                    busy === item.role && { opacity: 0.6 },
                    pressed && { opacity: 0.85 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={item.cta}
                >
                  <Text style={[styles.ctaText, isSelected && styles.ctaTextSelected]}>
                    {busy === item.role ? 'Setting up…' : item.cta}
                  </Text>
                </Pressable>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.footnote}>Choose your role · Switch anytime from your profile</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: light.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  headingBlock: {
    alignItems: 'center',
    marginBottom: 30,
  },
  eyebrow: {
    color: '#A9823A',
    fontFamily: fonts.sans.semibold,
    fontSize: 11.5,
    letterSpacing: 3,
    marginBottom: 10,
  },
  heading: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 30,
    textAlign: 'center',
  },
  subtitle: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 14.5,
    lineHeight: 21,
    marginTop: 10,
    textAlign: 'center',
    maxWidth: 340,
  },
  cards: {
    gap: 18,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  card: {
    backgroundColor: light.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: light.lineStrong,
    padding: 22,
    gap: 14,
  },
  cardSelected: {
    borderColor: '#241A11',
    backgroundColor: '#241A11',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.22,
    shadowRadius: 24,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(212, 163, 89, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSelected: {
    backgroundColor: 'rgba(212, 163, 89, 0.22)',
  },
  cardTitle: {
    flex: 1,
    color: light.ink,
    fontFamily: fonts.serif.semibold,
    fontSize: 20,
  },
  textLight: {
    color: '#FFF8EC',
  },
  cardBody: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  textLightMuted: {
    color: 'rgba(255,248,236,0.72)',
  },
  cta: {
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 89, 0.5)',
    backgroundColor: 'rgba(212, 163, 89, 0.10)',
  },
  ctaSelected: {
    backgroundColor: colors.goldGradientStart,
    borderColor: colors.goldGradientStart,
  },
  ctaText: {
    color: '#A9823A',
    fontFamily: fonts.sans.semibold,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  ctaTextSelected: {
    color: colors.buttonText,
  },
  footnote: {
    color: light.inkFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: 26,
    letterSpacing: 0.3,
  },
});