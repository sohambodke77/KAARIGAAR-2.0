import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fonts } from '../theme';

interface RatingStarsProps {
  rating: number;
  reviews?: number;
  size?: number;
}

export function RatingStars({ rating, reviews, size = 12 }: RatingStarsProps) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;

  return (
    <View style={styles.row}>
      {Array.from({ length: 5 }).map((_, i) => {
        const name =
          i < full ? 'star' : i === full && half ? 'star-half' : ('star-outline' as const);
        return <Ionicons key={i} name={name} size={size} color={colors.gold} />;
      })}
      <Text style={styles.value}>{rating.toFixed(1)}</Text>
      {reviews !== undefined ? <Text style={styles.reviews}>({reviews})</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  value: {
    color: colors.goldDeep,
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    marginLeft: 4,
  },
  reviews: {
    color: colors.creamFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 11,
    marginLeft: 2,
  },
});