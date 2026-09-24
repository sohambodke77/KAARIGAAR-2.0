import { useState, type ReactNode } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fonts } from '../theme';

interface UnderlineInputProps extends Omit<TextInputProps, 'style'> {
  leftIcon: keyof typeof Ionicons.glyphMap;
  rightAction?: ReactNode;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  error?: string | null;
}

export function UnderlineInput({
  leftIcon,
  rightAction,
  rightIcon,
  onRightIconPress,
  error,
  placeholder,
  value,
  onChangeText,
  ...rest
}: UnderlineInputProps) {
  const [focused, setFocused] = useState(false);

  const activeBorder = error
    ? colors.danger
    : focused
    ? colors.goldBorderFocus
    : colors.inputBorder;

  const iconColor = error
    ? colors.danger
    : focused
    ? colors.goldBright
    : colors.creamFaint;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.row,
          { borderBottomColor: activeBorder },
          focused && styles.rowFocused,
          Boolean(error) && styles.rowError,
        ]}
      >
        <Ionicons name={leftIcon} size={20} color={iconColor} style={styles.leftIcon} />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.inputPlaceholder}
          selectionColor={colors.goldBright}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as never) : null]}
          {...rest}
        />

        {rightAction ? (
          rightAction
        ) : rightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            hitSlop={10}
            style={styles.rightAction}
            accessibilityRole="button"
          >
            <Ionicons name={rightIcon} size={20} color={colors.creamFaint} />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle-outline" size={13} color={colors.danger} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.2,
    paddingVertical: 10,
    paddingHorizontal: 4,
    backgroundColor: 'transparent',
  },
  rowFocused: {
    borderBottomWidth: 1.6,
  },
  rowError: {
    borderBottomColor: colors.danger,
  },
  leftIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: colors.cream,
    fontFamily: fonts.sans.regular,
    fontSize: 15.5,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  rightAction: {
    paddingLeft: 8,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
    paddingLeft: 4,
  },
  errorText: {
    color: colors.danger,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    lineHeight: 16,
  },
});
