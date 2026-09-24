import { StyleSheet, Text, View } from 'react-native';

import { fonts, light } from '../theme';

type Tone = 'gold' | 'eco' | 'muted' | 'dark';

interface BadgeProps {
  text: string;
  tone?: Tone;
}

export function Badge({ text, tone = 'gold' }: BadgeProps) {
  const style = toneMap[tone];
  return (
    <View style={[styles.badge, style.bg]}>
      <Text style={[styles.text, style.text]}>{text}</Text>
    </View>
  );
}

const toneMap: Record<Tone, { bg: object; text: object }> = {
  gold: { bg: { backgroundColor: 'rgba(212, 163, 89, 0.16)' }, text: { color: '#A9823A' } },
  eco: { bg: { backgroundColor: 'rgba(120, 152, 96, 0.16)' }, text: { color: '#3F5A33' } },
  muted: { bg: { backgroundColor: light.surfaceAlt }, text: { color: light.inkMuted } },
  dark: { bg: { backgroundColor: '#241A11' }, text: { color: '#FFF8EC' } },
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  text: {
    fontFamily: fonts.sans.semibold,
    fontSize: 10.5,
    letterSpacing: 0.5,
  },
});