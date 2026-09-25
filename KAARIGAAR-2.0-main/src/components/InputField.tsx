import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fonts, radius } from '../theme';

interface InputFieldProps extends Omit<TextInputProps, 'style'> {
  icon: keyof typeof Ionicons.glyphMap;
  error?: string | null;
}

export function InputField({ icon, error, ...rest }: InputFieldProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.danger : focused ? colors.goldDim : colors.line;

  return (
    <View>
      <View style={[styles.container, { borderColor }]}>
        <Ionicons
          name={icon}
          size={18}
          color={focused ? colors.gold : colors.creamFaint}
          style={styles.icon}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.creamFaint}
          selectionColor={colors.gold}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  icon: { marginRight: 12 },
  input: {
    flex: 1,
    color: colors.cream,
    fontFamily: fonts.sans.regular,
    fontSize: 16,
    paddingVertical: 0,
  },
  error: {
    color: colors.danger,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    marginTop: 8,
    marginLeft: 4,
  },
});