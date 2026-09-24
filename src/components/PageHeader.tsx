import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BackButton } from './BackButton';
import { fonts, light } from '../theme';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  dark?: boolean;
  fallback?: () => void;
  showBack?: boolean;
}

export function PageHeader({ title, subtitle, right, dark, fallback, showBack = true }: PageHeaderProps) {
  return (
    <View style={styles.header}>
      {showBack ? <BackButton dark={dark} fallback={fallback} /> : <View style={styles.spacer} />}
      <View style={styles.center}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {right ? right : <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    gap: 12,
  },
  spacer: {
    width: 38,
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 20,
  },
  subtitle: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    marginTop: 2,
  },
});