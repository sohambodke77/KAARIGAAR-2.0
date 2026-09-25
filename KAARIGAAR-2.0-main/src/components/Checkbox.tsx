import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fonts } from '../theme';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Checkbox({ checked, onChange, label, disabled = false }: CheckboxProps) {
  return (
    <Pressable
      onPress={() => !disabled && onChange(!checked)}
      style={({ pressed }) => [styles.container, pressed && { opacity: 0.8 }]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      hitSlop={6}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && (
          <Ionicons
            name="checkmark"
            size={13}
            color={colors.chocolateDark}
            style={styles.checkIcon}
          />
        )}
      </View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
  },
  box: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.4,
    borderColor: colors.goldDim,
    backgroundColor: 'rgba(250, 246, 240, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: colors.goldBright,
    borderColor: colors.goldBright,
  },
  checkIcon: {
    fontWeight: 'bold',
  },
  label: {
    color: colors.creamMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    letterSpacing: 0.2,
  },
});
