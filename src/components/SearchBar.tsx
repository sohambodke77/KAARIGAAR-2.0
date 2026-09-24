import { StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fonts, light } from '../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({ value, onChangeText, placeholder, autoFocus = false }: SearchBarProps) {
  return (
    <View style={styles.wrap}>
      <Ionicons name="search" size={18} color={light.inkMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? 'Search handmade products, gifts & creators...'}
        placeholderTextColor={light.inkFaint}
        selectionColor={colors.gold}
        autoFocus={autoFocus}
        style={styles.input}
        accessibilityLabel="Search"
      />
      {value ? (
        <Ionicons
          name="close-circle"
          size={18}
          color={light.inkFaint}
          onPress={() => onChangeText('')}
          suppressHighlighting
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: light.surface,
    borderWidth: 1,
    borderColor: light.line,
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 42,
  },
  input: {
    flex: 1,
    color: light.ink,
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    paddingVertical: 0,
  },
});