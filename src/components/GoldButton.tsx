import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { PressableScale } from './PressableScale';
import { colors, fonts, radius } from '../theme';

interface GoldButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function GoldButton({ label, onPress, loading = false, disabled = false }: GoldButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <PressableScale onPress={onPress} disabled={isDisabled} style={{ opacity: isDisabled ? 0.55 : 1 }}>
      <LinearGradient
        colors={[colors.goldBright, colors.gold, colors.goldDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.base}
      >
        {loading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
      </LinearGradient>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.background,
    fontFamily: fonts.sans.semibold,
    fontSize: 15.5,
    letterSpacing: 0.4,
  },
});