import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { Creator } from '../data/creators';
import { RatingStars } from './RatingStars';
import { Avatar } from './Avatar';
import { fonts, light } from '../theme';

interface CreatorCardProps {
  creator: Creator;
  onPress: () => void;
  showEstimate?: boolean;
}

export function CreatorCard({ creator, onPress, showEstimate = false }: CreatorCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
      accessibilityRole="button"
      accessibilityLabel={`View ${creator.name}`}
    >
      <View style={styles.row}>
        <Avatar label={creator.name} size={52} />
        <View style={styles.info}>
          <Text style={styles.name}>{creator.name}</Text>
          <Text style={styles.brand}>{creator.brand} · {creator.location}</Text>
          <View style={styles.metaRow}>
            <RatingStars rating={creator.rating} reviews={creator.reviews} />
            <Text style={styles.meta}>{creator.creationsCount} creations</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={light.inkFaint} />
      </View>

      <View style={styles.chips}>
        {creator.craft.map((skill) => (
          <View key={skill} style={styles.chip}>
            <Text style={styles.chipText}>{skill}</Text>
          </View>
        ))}
      </View>

      {showEstimate ? (
        <View style={styles.estimateRow}>
          <Text style={styles.estimate}>{creator.priceRange}</Text>
          <Text style={styles.estimate}>· Avg {creator.aveTime} days</Text>
        </View>
      ) : null}

      <View style={styles.cta}>
        <Text style={styles.ctaText}>View Creator</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: light.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: light.line,
    padding: 14,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: light.ink,
    fontFamily: fonts.serif.semibold,
    fontSize: 16,
  },
  brand: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  meta: {
    color: light.inkFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 11,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: 'rgba(212, 163, 89, 0.14)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipText: {
    color: '#A9823A',
    fontFamily: fonts.sans.medium,
    fontSize: 11,
  },
  estimateRow: {
    flexDirection: 'row',
    gap: 4,
  },
  estimate: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12,
  },
  cta: {
    marginTop: 2,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 89, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 163, 89, 0.1)',
  },
  ctaText: {
    color: '#A9823A',
    fontFamily: fonts.sans.semibold,
    fontSize: 13.5,
  },
});