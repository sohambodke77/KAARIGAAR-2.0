import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius } from '../theme';

export type SegmentOption = 'mobile' | 'email';

interface SegmentedControlProps {
  value: SegmentOption;
  onChange: (value: SegmentOption) => void;
}

const OPTIONS: { value: SegmentOption; label: string }[] = [
  { value: 'mobile', label: 'Mobile number' },
  { value: 'email', label: 'Email' },
];

export function SegmentedControl({ value, onChange }: SegmentedControlProps) {
  return (
    <View style={styles.track}>
      {OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <Pressable key={option.value} style={[styles.segment, active && styles.segmentActive]} onPress={() => onChange(option.value)}>
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceDeep,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm + 2,
    padding: 3,
  },
  segment: {
    flex: 1,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    backgroundColor: colors.goldFaint,
    borderWidth: 1,
    borderColor: colors.goldDim,
  },
  label: {
    color: colors.creamDim,
    fontFamily: fonts.sans.medium,
    fontSize: 14,
  },
  labelActive: {
    color: colors.gold,
    fontFamily: fonts.sans.semibold,
  },
});