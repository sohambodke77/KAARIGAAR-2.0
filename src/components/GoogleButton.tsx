import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Svg, Path } from 'react-native-svg';

import { PressableScale } from './PressableScale';
import { colors, fonts, radius } from '../theme';

interface GoogleButtonProps {
  onPress: () => void;
  loading?: boolean;
}

export function GoogleButton({ onPress, loading = false }: GoogleButtonProps) {
  return (
    <PressableScale onPress={onPress} disabled={loading} style={{ opacity: loading ? 0.55 : 1 }}>
      <View style={styles.base}>
        {loading ? (
          <ActivityIndicator color={colors.cream} />
        ) : (
          <>
            <GoogleMark />
            <Text style={styles.label}>Continue with Google</Text>
          </>
        )}
      </View>
    </PressableScale>
  );
}

function GoogleMark() {
  return (
    <Svg width={18} height={18} viewBox="0 0 48 48" style={{ marginRight: 10 }}>
      <Path
        fill="#E8D9C0"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <Path
        fill="#D8B775"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <Path
        fill="#E8C36A"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <Path
        fill="#D9B463"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C38.3 36.6 44 31 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.cream,
    fontFamily: fonts.sans.semibold,
    fontSize: 15,
    letterSpacing: 0.3,
  },
});