import { Text, View } from 'react-native';

import { colors, fonts } from '../theme';

interface LogoProps {
  size?: 'sm' | 'lg';
  showTagline?: boolean;
}

export function Logo({ size = 'lg', showTagline = false }: LogoProps) {
  const compact = size === 'sm';

  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Mark size={compact ? 26 : 54} />
        <View>
          <Text
            style={{
              color: colors.cream,
              fontFamily: fonts.serif.bold,
              fontSize: compact ? 17 : 28,
              letterSpacing: compact ? 4 : 6,
            }}
          >
            KARIGAAR
          </Text>
          {!compact && (
            <Text style={{ color: colors.gold, fontFamily: fonts.sans.medium, fontSize: 11, letterSpacing: 2, marginTop: 2 }}>
              कारीGaar
            </Text>
          )}
        </View>
      </View>
      {showTagline && (
        <Text
          style={{
            color: colors.gold,
            fontFamily: fonts.sans.medium,
            fontSize: 11,
            letterSpacing: 2.4,
            marginTop: 14,
            opacity: 0.85,
          }}
        >
          HAR HAATH KI KAHANI, AAP TAK.
        </Text>
      )}
    </View>
  );
}

function Mark({ size }: { size: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.4,
        borderColor: colors.goldDim,
        backgroundColor: colors.goldFaint,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          color: colors.gold,
          fontFamily: fonts.serif.bold,
          fontSize: size * 0.54,
          lineHeight: size * 0.66,
        }}
      >
        K
      </Text>
    </View>
  );
}