import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { STORIES } from '../data/stories';
import { PageHeader } from '../components/PageHeader';
import { StoryCard } from '../components/StoryCard';
import { fonts, light } from '../theme';
import type { CustomerStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;

export function StoriesScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PageHeader title="Handmade Stories" fallback={() => navigation.navigate('Tabs', { screen: 'HomeTab' })} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.heading}>Stories Carved in Hand & Heart</Text>
        <Text style={styles.subtitle}>Meet the people behind the creations.</Text>

        <View style={styles.list}>
          {STORIES.map((story) => (
            <StoryCard key={story.id} story={story} onPress={() => navigation.navigate('StoryDetail', { id: story.id })} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  heading: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 23,
    lineHeight: 30,
  },
  subtitle: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    marginTop: 4,
    marginBottom: 18,
  },
  list: {
    gap: 14,
    alignItems: 'flex-start',
  },
});