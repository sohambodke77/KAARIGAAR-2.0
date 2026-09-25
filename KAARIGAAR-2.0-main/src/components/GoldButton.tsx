import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { PressableScale } from './PressableScale';
import { colors, fonts } from '../theme';

interface GoldButtonProps {
  label: string;
  loadingLabel?: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function GoldButton({
  label,
  loadingLabel = 'Signing in…',
  onPress,
  loading = false,
  disabled = false,
}: GoldButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      scaleTo={0.98}
      style={[styles.shadowWrap, { opacity: isDisabled ? 0.6 : 1 }]}
    >
      <LinearGradient
        colors={[colors.goldGradientStart, colors.goldGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.base}
      >
        {loading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={colors.buttonText} size="small" />
            <Text style={styles.label}>{loadingLabel}</Text>
          </View>
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 6,
    borderRadius: 12,
  },
  base: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    color: colors.buttonText,
    fontFamily: fonts.sans.semibold,
    fontSize: 15.5,
    letterSpacing: 0.4,
  },
});