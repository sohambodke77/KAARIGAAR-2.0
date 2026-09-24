import { Pressable, StyleSheet, Text, View } from 'react-native';

import { fonts, light } from '../theme';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.titleWrap}>
        <View style={styles.accent} />
        <Text style={styles.title}>{title}</Text>
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8} accessibilityRole="button">
          <Text style={styles.action}>{actionLabel} →</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  accent: {
    width: 4,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#D4A359',
  },
  title: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 19,
    flexShrink: 1,
  },
  action: {
    color: '#B98A2E',
    fontFamily: fonts.sans.semibold,
    fontSize: 12.5,
  },
});