import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Badge } from './Badge';
import { fonts, light } from '../theme';

interface StoryCardProps {
  story: {
    id: string;
    title: string;
    tag: string;
    excerpt: string;
    readTime: string;
  };
  onPress: () => void;
}

export function StoryCard({ story, onPress }: StoryCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.92 }]}
      accessibilityRole="button"
    >
      <LinearGradient
        colors={['#6E4526', '#2E1B10']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cover}
      >
        <Ionicons name="film-outline" size={30} color="rgba(255,248,236,0.8)" />
        <Badge text={story.tag} tone="gold" />
      </LinearGradient>
      <View style={styles.body}>
        <Text style={styles.title}>{story.title}</Text>
        <Text style={styles.excerpt} numberOfLines={3}>
          {story.excerpt}
        </Text>
        <Text style={styles.footer}>
          KARIGAAR Maker · {story.readTime}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: light.surface,
    borderWidth: 1,
    borderColor: light.line,
    overflow: 'hidden',
    width: 250,
  },
  cover: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  body: {
    padding: 14,
    gap: 6,
  },
  title: {
    color: light.ink,
    fontFamily: fonts.serif.semibold,
    fontSize: 16,
    lineHeight: 21,
  },
  excerpt: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    lineHeight: 18,
  },
  footer: {
    color: light.inkFaint,
    fontFamily: fonts.sans.medium,
    fontSize: 11.5,
    marginTop: 2,
  },
});