import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { fonts, light } from '../theme';

interface QtyStepperProps {
  qty: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
}

export function QtyStepper({ qty, onChange, min = 1, max = 99 }: QtyStepperProps) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onChange(Math.max(min, qty - 1))}
        disabled={qty <= min}
        style={[styles.btn, (qty <= min) && styles.disabled]}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
      >
        <Ionicons name="remove" size={16} color={light.ink} />
      </Pressable>
      <Text style={styles.qty}>{qty}</Text>
      <Pressable
        onPress={() => onChange(Math.min(max, qty + 1))}
        disabled={qty >= max}
        style={[styles.btn, (qty >= max) && styles.disabled]}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
      >
        <Ionicons name="add" size={16} color={light.ink} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  btn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: light.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: light.surface,
  },
  disabled: {
    opacity: 0.35,
  },
  qty: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 15,
    minWidth: 20,
    textAlign: 'center',
  },
});