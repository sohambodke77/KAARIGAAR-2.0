import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { CREATORS } from '../data/creators';
import { PageHeader } from '../components/PageHeader';
import { FormField } from '../components/FormField';
import { CreatorCard } from '../components/CreatorCard';
import { colors, fonts, light } from '../theme';
import type { CustomerStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;

const BUDGETS = ['Under ₹300', '₹300–₹800', '₹800–₹2,000', '₹2,000+', 'Flexible'];
const STYLES = ['Traditional', 'Modern', 'Minimal', 'Colourful', 'Rustic', 'No preference'];

function chips(options: string[], selected: string | null, onSelect: (v: string | null) => void) {
  return (
    <View style={styles.chipWrap}>
      {options.map((o) => (
        <Pressable
          key={o}
          onPress={() => onSelect(selected === o ? null : o)}
          style={[styles.chip, selected === o && styles.chipActive]}
        >
          <Text style={[styles.chipText, selected === o && styles.chipTextActive]}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function FindMyMakerScreen() {
  const navigation = useNavigation<Nav>();
  const [want, setWant] = useState('');
  const [budget, setBudget] = useState<string | null>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [customization, setCustomization] = useState<string | null>(null);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [location, setLocation] = useState('');
  const [searched, setSearched] = useState(false);

  const matches = useMemo(() => {
    if (!searched) return [];
    const q = want.toLowerCase();
    const keywords = q.split(/[^a-z]+/).filter((w) => w.length > 2);

    const scored = CREATORS.map((c) => {
      let score = 0;
      const haystack = `${c.craft.join(' ')} ${c.brand} ${c.name}`.toLowerCase();
      keywords.forEach((k) => {
        if (haystack.includes(k)) score += 2;
        c.craft.forEach((skill) => {
          if (skill.toLowerCase().includes(k)) score += 3;
        });
      });
      if (customization === 'Yes') score += 1;
      if (style && style !== 'No preference' && haystack.includes(style.toLowerCase())) score += 1;
      if (location && c.location.toLowerCase().includes(location.toLowerCase().slice(0, 4))) score += 2;
      score += c.rating - 4;
      return { creator: c, score };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((s) => s.creator);
  }, [searched, want, customization, style, location]);

  const submit = () => {
    if (!want.trim() && !budget) return;
    setSearched(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PageHeader title="Find My Maker" subtitle="Tell us about your vision" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.intro}>
          Describe what you want and KARIGAAR will match you with suitable creators for a
          personalised piece.
        </Text>

        <FormField
          label="What do you want?"
          value={want}
          onChangeText={setWant}
          placeholder="e.g. A crochet bag with sunflower colours for my sister"
          multiline
        />

        <MiniLabel text="Budget" />
        {chips(BUDGETS, budget, setBudget)}

        <MiniLabel text="Preferred style" />
        {chips(STYLES, style, setStyle)}

        <MiniLabel text="Need customization?" />
        {chips(['Yes', 'No'], customization, setCustomization)}

        <FormField
          label="Delivery date (optional)"
          value={deliveryDate}
          onChangeText={setDeliveryDate}
          placeholder="e.g. Before 14 February"
        />
        <FormField
          label="Location preference (optional)"
          value={location}
          onChangeText={setLocation}
          placeholder="e.g. Pune, Kolkata"
        />

        <Pressable
          onPress={submit}
          style={({ pressed }) => [styles.findBtn, pressed && { opacity: 0.88 }]}
          accessibilityRole="button"
        >
          <Ionicons name="search" size={17} color={colors.buttonText} />
          <Text style={styles.findBtnText}>Match Me with Creators</Text>
        </Pressable>

        {searched && (
          <>
            <Text style={styles.resultsTitle}>
              {matches.length > 0
                ? `${matches.length} creator${matches.length > 1 ? 's' : ''} matched for you`
                : 'No strong match yet'}
            </Text>
            {matches.length === 0 ? (
              <Text style={styles.noMatch}>
                Try adding craft words like “crochet”, “pottery”, “painting” or “jewellery”, or
                loosen the budget. You can also browse creators directly below.
              </Text>
            ) : null}
            <View style={styles.cards}>
              {matches.map((c) => (
                <CreatorCard
                  key={c.id}
                  creator={c}
                  showEstimate
                  onPress={() => navigation.navigate('Creator', { id: c.id })}
                />
              ))}
              {matches.length === 0
                ? CREATORS.slice(0, 3).map((c) => (
                    <CreatorCard
                      key={c.id}
                      creator={c}
                      showEstimate
                      onPress={() => navigation.navigate('Creator', { id: c.id })}
                    />
                  ))
                : null}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MiniLabel({ text }: { text: string }) {
  return (
    <Text style={styles.miniLabel}>{text}</Text>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  intro: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    lineHeight: 20,
    marginBottom: 14,
  },
  miniLabel: {
    color: light.inkMuted,
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    letterSpacing: 0.4,
    marginTop: 14,
    marginBottom: 6,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 13,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: light.lineStrong,
    backgroundColor: light.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#2E1B10',
    borderColor: '#2E1B10',
  },
  chipText: {
    color: light.inkMuted,
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
  },
  chipTextActive: {
    color: '#FFF8EC',
  },
  findBtn: {
    marginTop: 20,
    height: 52,
    borderRadius: 999,
    backgroundColor: colors.goldGradientStart,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  findBtnText: {
    color: colors.buttonText,
    fontFamily: fonts.sans.bold,
    fontSize: 15,
  },
  resultsTitle: {
    color: light.ink,
    fontFamily: fonts.serif.semibold,
    fontSize: 18,
    marginTop: 26,
  },
  noMatch: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  cards: {
    marginTop: 12,
    gap: 12,
  },
});