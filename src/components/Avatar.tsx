import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

interface AvatarProps {
  label: string;
  size?: number;
  onPress?: () => void;
}

export function Avatar({ label, size = 38, onPress }: AvatarProps) {
  const initial = (label.trim().charAt(0) || 'K').toUpperCase();
  const sizeStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const inner = (
    <View style={[styles.circle, sizeStyle]}>
      <Text style={[styles.initial, { fontSize: size * 0.42, lineHeight: size * 0.54 }]}>{initial}</Text>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
        {inner}
      </Pressable>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  circle: {
    borderWidth: 1,
    borderColor: colors.goldDim,
    backgroundColor: colors.goldFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: colors.gold,
    fontFamily: fonts.serif.bold,
  },
});