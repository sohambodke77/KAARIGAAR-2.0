import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { IconName } from '../data/categories';
import { colors, fonts, light } from '../theme';
import { PressableScale } from './PressableScale';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onCta?: () => void;
}

export function EmptyState({ icon, title, subtitle, ctaLabel, onCta }: EmptyStateProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={30} color="#B98A2E" />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {ctaLabel && onCta ? (
        <PressableScale onPress={onCta} scaleTo={0.97} style={styles.ctaWrap}>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>{ctaLabel}</Text>
          </View>
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: 44,
    paddingHorizontal: 24,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(212, 163, 89, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 19,
    textAlign: 'center',
  },
  subtitle: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 300,
  },
  ctaWrap: {
    marginTop: 20,
  },
  cta: {
    paddingHorizontal: 26,
    paddingVertical: 13,
    borderRadius: 999,
    backgroundColor: colors.goldGradientStart,
  },
  ctaText: {
    color: colors.buttonText,
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
    letterSpacing: 0.3,
  },
});