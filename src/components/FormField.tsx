import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, fonts, light } from '../theme';

interface FormFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string | null;
}

export function FormField({ label, error, value, onChangeText, ...rest }: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? light.danger : focused ? colors.gold : light.lineStrong;

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, error && { color: light.danger }]}>{label}</Text>
      <View style={[styles.row, { borderBottomColor: borderColor }, focused && styles.rowFocused]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={colors.gold}
          placeholderTextColor={light.inkFaint}
          style={[styles.input, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as never) : null]}
          {...rest}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginVertical: 6,
  },
  label: {
    color: light.inkMuted,
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  row: {
    borderBottomWidth: 1,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowFocused: {
    borderBottomWidth: 1.6,
  },
  input: {
    flex: 1,
    color: light.ink,
    fontFamily: fonts.sans.regular,
    fontSize: 15,
    paddingVertical: 0,
  },
  error: {
    color: light.danger,
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    marginTop: 5,
  },
});