import { Image, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

const logoAsset = require('../../assets/kaarigaar_logo.png');

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export function Logo({ size = 'lg', showTagline = true }: LogoProps) {
  if (size === 'sm') {
    return (
      <View style={styles.compactRow}>
        <Image
          source={logoAsset}
          style={{ width: 44, height: 40 }}
          resizeMode="contain"
          accessibilityLabel="KARIGAAR Logo"
        />
        <View>
          <Text style={styles.compactTitle}>KARIGAAR</Text>
          <Text style={styles.compactSubtitle}>कारीGaar</Text>
        </View>
      </View>
    );
  }

  const dimensions = size === 'md' ? { width: 100, height: 90 } : { width: 124, height: 110 };

  return (
    <View style={styles.container}>
      <Image
        source={logoAsset}
        style={dimensions}
        resizeMode="contain"
        accessibilityLabel="KARIGAAR Logo"
      />
      {showTagline && (
        <View style={styles.taglineBlock}>
          <View style={styles.taglineDivider} />
          <Text style={styles.taglineText}>Har Haath Ki Kahani, Aap Tak.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compactTitle: {
    color: colors.cream,
    fontFamily: fonts.serif.bold,
    fontSize: 18,
    letterSpacing: 3,
  },
  compactSubtitle: {
    color: colors.gold,
    fontFamily: fonts.sans.medium,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  taglineBlock: {
    alignItems: 'center',
    marginTop: 6,
    width: '100%',
  },
  taglineDivider: {
    width: 140,
    height: 1,
    backgroundColor: colors.goldBorder,
    marginBottom: 6,
  },
  taglineText: {
    color: colors.gold,
    fontFamily: fonts.sans.medium,
    fontSize: 11,
    letterSpacing: 1.8,
    opacity: 0.92,
    textAlign: 'center',
  },
});