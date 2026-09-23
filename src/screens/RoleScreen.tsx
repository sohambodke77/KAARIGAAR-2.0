import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Logo } from '../components/Logo';
import { RoleCard } from '../components/RoleCard';
import { useAuth, type Role } from '../context/AuthContext';
import { colors, fonts, spacing } from '../theme';

const EXPERIENCES: {
  role: Role;
  icon: 'shopping-outline' | 'palette';
  eyebrow: string;
  title: string;
  features: string[];
  actionLabel: string;
}[] = [
  {
    role: 'customer',
    icon: 'shopping-outline',
    eyebrow: 'Customer',
    title: 'Discover handmade',
    features: [
      'Explore unique products',
      'Find meaningful gifts',
      'Customize products',
      'Connect with creators',
    ],
    actionLabel: 'Continue as Customer →',
  },
  {
    role: 'seller',
    icon: 'palette',
    eyebrow: 'Seller / Creator',
    title: 'Turn your craft into a business',
    features: [
      'Showcase your creations',
      'Get custom orders',
      'Manage products & orders',
      'Reach more customers',
    ],
    actionLabel: 'Continue as Seller →',
  },
];

export function RoleScreen() {
  const { chooseRole } = useAuth();
  const [selected, setSelected] = useState<Role | null>(null);

  const handleContinue = async (role: Role) => {
    setSelected(role);
    await chooseRole(role);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Logo size="sm" />
        </View>

        <View style={styles.headingBlock}>
          <Text style={styles.heading}>How will you use KARIGAAR?</Text>
          <Text style={styles.subtitle}>Choose your experience. You can switch roles later.</Text>
        </View>

        <View style={styles.cards}>
          {EXPERIENCES.map((item) => (
            <RoleCard
              key={item.role}
              icon={item.icon}
              eyebrow={item.eyebrow}
              title={item.title}
              features={item.features}
              actionLabel={item.actionLabel}
              selected={selected === item.role}
              onSelect={() => setSelected(item.role)}
              onContinue={() => handleContinue(item.role)}
            />
          ))}
        </View>

        <Text style={styles.footnote}>Switch anytime from your profile.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  headingBlock: {
    marginTop: 36,
    alignItems: 'center',
  },
  heading: {
    color: colors.cream,
    fontFamily: fonts.serif.bold,
    fontSize: 30,
    lineHeight: 38,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.creamDim,
    fontFamily: fonts.sans.regular,
    fontSize: 14.5,
    lineHeight: 21,
    marginTop: 10,
    textAlign: 'center',
  },
  cards: {
    marginTop: 32,
    gap: 18,
  },
  footnote: {
    color: colors.creamFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: spacing.xl,
    letterSpacing: 0.3,
  },
});