import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius } from '../theme';

interface BackButtonProps {
  label?: string;
  fallbackRoute?: keyof AppStackParamList;
  onPress?: () => void;
  variant?: 'light' | 'dark' | 'transparent';
}

export function BackButton({
  label,
  fallbackRoute = 'CustomerHome',
  onPress,
  variant = 'light',
}: BackButtonProps) {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate(fallbackRoute as never);
    }
  };

  const isDark = variant === 'dark';

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={label ? `Back, ${label}` : 'Go back'}
      style={({ pressed }) => [
        styles.button,
        isDark ? styles.buttonDark : styles.buttonLight,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.contentRow}>
        <Ionicons
          name="arrow-back"
          size={18}
          color={isDark ? colors.cream : colors.charcoal}
        />
        {label ? (
          <Text
            style={[
              styles.labelText,
              { color: isDark ? colors.cream : colors.charcoal },
            ]}
          >
            {label}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 38,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.15s ease',
        } as never)
      : {}),
  },
  buttonLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  buttonDark: {
    backgroundColor: colors.charcoalSoft,
    borderWidth: 1,
    borderColor: colors.goldDim,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelText: {
    fontFamily: fonts.sans.medium,
    fontSize: 13.5,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
});
