import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { colors, light } from '../theme';

interface BackButtonProps {
  dark?: boolean;
  fallback?: () => void;
}

export function BackButton({ dark = false, fallback }: BackButtonProps) {
  const navigation = useNavigation();

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      fallback?.();
    }
  };

  return (
    <Pressable
      onPress={goBack}
      hitSlop={10}
      style={({ pressed }) => [
        styles.btn,
        dark && styles.btnDark,
        pressed && { opacity: 0.65 },
      ]}
      accessibilityRole="button"
      accessibilityLabel="Go back"
    >
      <Ionicons name="arrow-back" size={20} color={dark ? colors.cream : light.ink} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: light.lineStrong,
    backgroundColor: light.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDark: {
    borderColor: colors.goldDim,
    backgroundColor: 'rgba(55, 35, 23, 0.5)',
  },
});