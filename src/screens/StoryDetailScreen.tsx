import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { STORIES } from '../data/stories';
import { getCreator } from '../data/creators';
import { PageHeader } from '../components/PageHeader';
import { Avatar } from '../components/Avatar';
import { fonts, light } from '../theme';
import type { CustomerStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;
type Route = RouteProp<CustomerStackParamList, 'StoryDetail'>;

export function StoryDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { id } = useRoute<Route>().params;
  const story = STORIES.find((s) => s.id === id) ?? STORIES[0];
  const creator = getCreator(story.creatorId);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PageHeader title="Story" fallback={() => navigation.navigate('Stories')} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <LinearGradient
          colors={['#6E4526', '#2E1B10']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cover}
        >
          <Ionicons name="images-outline" size={44} color="rgba(255,248,236,0.85)" />
          <Text style={styles.tag}>{story.tag}</Text>
        </LinearGradient>

        <Text style={styles.title}>{story.title}</Text>
        <View style={styles.byline}>
          <Avatar label={creator.name} size={34} />
          <View>
            <Text style={styles.byName}>{creator.name} · {creator.brand}</Text>
            <Text style={styles.byMeta}>{story.readTime} · Sample story</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.paragraph}>{story.excerpt}</Text>
          <Text style={styles.paragraph}>
            This is demo/sample editorial content created to demonstrate the KARIGAAR stories
            experience. Every story on the platform is written with the creator&#39;s consent and
            reflects their workshop, process and the people behind the craft.
          </Text>
          <Text style={styles.paragraph}>
            With camera rolls full of workshop photos and short films, the KARIGAAR editorial
            team brings the hands that craft your favourite creations a little closer to home.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  scroll: { paddingBottom: 40 },
  cover: {
    height: 190,
    marginHorizontal: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  tag: {
    color: '#F3DFA8',
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 24,
    lineHeight: 31,
    paddingHorizontal: 16,
    marginTop: 18,
  },
  byline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  byName: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
  },
  byMeta: {
    color: light.inkFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
  },
  body: {
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 14,
  },
  paragraph: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 14.5,
    lineHeight: 23,
  },
});