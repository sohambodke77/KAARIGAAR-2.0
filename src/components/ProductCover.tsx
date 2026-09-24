import { StyleSheet, Text, View, type DimensionValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { getCategory } from '../data/categories';
import { fonts } from '../theme';

interface ProductCoverProps {
  categoryId: string;
  label: string;
  height?: number;
  feature?: string;
  width?: DimensionValue;
}

export function ProductCover({ categoryId, label, height = 150, feature, width = '100%' }: ProductCoverProps) {
  const category = getCategory(categoryId);

  return (
    <View style={[styles.wrap, { height, width }]}>
      <LinearGradient
        colors={[...category.gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.art}>
          <Ionicons name={category.icon} size={height * 0.34} color="rgba(255,248,236,0.92)" />
          <Text style={styles.caption} numberOfLines={2}>
            {label}
          </Text>
        </View>
        {feature === 'eco' ? (
          <View style={[styles.badge, styles.eco]}>
            <Ionicons name="leaf" size={10} color="#2F4D2F" />
            <Text style={[styles.badgeText, { color: '#2F4D2F' }]}>Eco</Text>
          </View>
        ) : feature === 'handmade' ? (
          <View style={styles.badge}>
            <Ionicons name="hand-left" size={10} color="#FFF8EC" />
            <Text style={styles.badgeText}>Handmade</Text>
          </View>
        ) : null}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  art: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 6,
  },
  caption: {
    color: '#FFF8EC',
    fontFamily: fonts.serif.semibold,
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.95,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  eco: {
    backgroundColor: 'rgba(240,248,235,0.9)',
  },
  badgeText: {
    color: '#FFF8EC',
    fontFamily: fonts.sans.semibold,
    fontSize: 9.5,
    letterSpacing: 0.5,
  },
});