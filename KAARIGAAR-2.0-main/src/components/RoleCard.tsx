import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { PressableScale } from './PressableScale';
import { colors, fonts, radius, shadow, spacing } from '../theme';

interface RoleCardProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  eyebrow: string;
  title: string;
  features: string[];
  actionLabel: string;
  selected: boolean;
  onSelect: () => void;
  onContinue: () => void;
}

export function RoleCard({
  icon,
  eyebrow,
  title,
  features,
  actionLabel,
  selected,
  onSelect,
  onContinue,
}: RoleCardProps) {
  const [selAnim] = useState(() => new Animated.Value(selected ? 1 : 0));

  useEffect(() => {
    Animated.timing(selAnim, { toValue: selected ? 1 : 0, duration: 260, useNativeDriver: true }).start();
  }, [selected, selAnim]);

  return (
    <PressableScale onPress={onSelect} scaleTo={0.985} style={shadow.card}>
      <View style={[styles.card, selected && styles.cardSelected]}>
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.highlightBorder, { opacity: selAnim }]} />
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.highlightFill, { opacity: selAnim }]} />

        {selected && (
          <View style={styles.badge}>
            <Ionicons name="checkmark" size={14} color={colors.background} />
          </View>
        )}

        <View style={styles.headerRow}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name={icon} size={22} color={colors.gold} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.features}>
          {features.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <View style={styles.bullet} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <PressableScale onPress={onContinue} scaleTo={0.98}>
          <View style={[styles.action, selected && styles.actionSelected]}>
            <Text style={styles.actionLabel}>{actionLabel}</Text>
            <Ionicons name="arrow-forward" size={16} color={selected ? colors.goldBright : colors.gold} />
          </View>
        </PressableScale>
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    overflow: 'hidden',
  },
  cardSelected: {
    borderColor: colors.goldDim,
  },
  highlightBorder: {
    borderRadius: radius.xl,
    borderWidth: 1.4,
    borderColor: colors.gold,
  },
  highlightFill: {
    borderRadius: radius.xl,
    backgroundColor: colors.goldSoft,
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.goldDim,
    backgroundColor: colors.goldFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    color: colors.gold,
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  title: {
    color: colors.cream,
    fontFamily: fonts.serif.semibold,
    fontSize: 21,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: 18,
  },
  features: {
    gap: 10,
    marginBottom: 22,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.gold,
    opacity: 0.85,
  },
  featureText: {
    color: colors.creamDim,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    lineHeight: 19,
  },
  action: {
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.goldDim,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionSelected: {
    backgroundColor: colors.goldFaint,
  },
  actionLabel: {
    color: colors.gold,
    fontFamily: fonts.sans.semibold,
    fontSize: 14.5,
    letterSpacing: 0.3,
  },
});