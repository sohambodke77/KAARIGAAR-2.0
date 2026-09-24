import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';

import { CATEGORIES } from '../data/categories';
import type { Product } from '../data/products';
import { PageHeader } from '../components/PageHeader';
import { FormField } from '../components/FormField';
import { fonts, light } from '../theme';
import type { CreatorStackParamList } from '../navigation/types';

type Nav = NavigationProp<CreatorStackParamList>;

const MY_PRODUCTS_KEY = '@kaarigaar/myProducts';

function generateDescription(name: string, category: string): string {
  const noun = name && name.length > 2 ? name : `a ${category.toLowerCase()} piece`;
  return [
    `Every stitch of “${noun}” begins by hand — nothing here is mass-produced.`,
    `Shaped over ${category.toLowerCase()} craftsmanship and slow-making, this piece carries small,`,
    `human imprint: the maker's rhythm, the thread's story, and an heirloom finish you can feel`,
    `the first time you hold it.`,
    ``,
    `Made to order with love. Ready to ship in about a week. Payments and transactions are`,
    `safe and fully transparent. Handcrafted with pride in India. 🇮🇳`,
  ].join('\n');
}

export function CreatorProductNewScreen() {
  const navigation = useNavigation<Nav>();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('handcrafted');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [days, setDays] = useState('7');
  const [materials, setMaterials] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [description, setDescription] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  const category = CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[0];

  const aiGenerate = () => {
    setAiBusy(true);
    setTimeout(() => {
      setDescription(generateDescription(name.trim(), category.name));
      setAiBusy(false);
    }, 900);
  };

  const publish = async () => {
    if (!name.trim()) {
      setError('Give your product a name.');
      return;
    }
    if (!price || Number(price) <= 0) {
      setError('Enter a valid price (₹).');
      return;
    }
    setError('');
    setPublishing(true);

    const product: Product = {
      id: `MY-${Date.now().toString(36).toUpperCase()}`,
      categoryId,
      creatorId: 'creator-1',
      name: name.trim(),
      price: Math.round(Number(price)),
      rating: 0,
      reviews: 0,
      blurb: description.trim().split('\n')[0] || `${category.name}, made by hand.`,
      description: description.trim() || generateDescription(name.trim(), category.name),
      materials: materials.split(',').map((m) => m.trim()).filter(Boolean),
      dimensions: dimensions.trim() || 'Please ask',
      stock: Math.max(0, Number(stock) || 0),
      customization: true,
      sizes: ['S', 'M', 'L'],
      colors: ['Gold'],
      estimatedDays: Math.max(1, Number(days) || 7),
      feature: 'handmade',
    };

    try {
      const raw = await AsyncStorage.getItem(MY_PRODUCTS_KEY);
      const list = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem(MY_PRODUCTS_KEY, JSON.stringify([product, ...list]));
    } catch {
      // publishing still proceeds for the session
    }
    setPublishing(false);
    navigation.navigate('Products');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PageHeader title="Add New Product" subtitle="List a new creation" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <FormField label="Product Name" value={name} onChangeText={setName} placeholder="e.g. Sunset Macramé Wall Hanging" />

          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.chips}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setCategoryId(c.id)}
                style={[styles.chip, categoryId === c.id && styles.chipActive]}
              >
                <Text style={[styles.chipText, categoryId === c.id && styles.chipTextActive]}>{c.name}</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <FormField label="Price (₹)" value={price} onChangeText={setPrice} keyboardType="number-pad" placeholder="1499" />
            </View>
            <View style={styles.half}>
              <FormField label="Stock" value={stock} onChangeText={setStock} keyboardType="number-pad" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.half}>
              <FormField label="Prep Time (days)" value={days} onChangeText={setDays} keyboardType="number-pad" />
            </View>
            <View style={styles.half}>
              <FormField label="Dimensions" value={dimensions} onChangeText={setDimensions} placeholder="e.g. 40×60 cm" />
            </View>
          </View>

          <FormField label="Materials (comma separated)" value={materials} onChangeText={setMaterials} placeholder="cotton rope, wooden dowel" />

          <View style={styles.labelRow}>
            <Text style={styles.fieldLabel}>Description</Text>
            <Pressable onPress={aiGenerate} disabled={aiBusy} style={({ pressed }) => [styles.aiBtn, pressed && { opacity: 0.85 }]}>
              <Ionicons name="sparkles" size={14} color="#A9823A" />
              <Text style={styles.aiBtnText}>{aiBusy ? 'Generating…' : 'Generate with AI'}</Text>
            </Pressable>
          </View>
          <FormField
            label=""
            value={description}
            onChangeText={setDescription}
            placeholder="Tell the story of your craft. What makes it yours?"
            multiline
            numberOfLines={6}
          />
          {description ? (
            <Text style={styles.aiHint}>
              <Ionicons name="flash-outline" size={12} color="#A9823A" /> AI-assisted draft — you approve what goes live.
            </Text>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            onPress={publish}
            disabled={publishing}
            style={({ pressed }) => [styles.publish, (pressed || publishing) && { opacity: 0.85 }]}
          >
            <Text style={styles.publishText}>{publishing ? 'Publishing…' : 'Publish Listing'}</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  flex: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },
  fieldLabel: {
    color: '#A9823A',
    fontFamily: fonts.sans.semibold,
    fontSize: 11.5,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: light.lineStrong,
    backgroundColor: light.surface,
  },
  chipActive: {
    backgroundColor: 'rgba(212,163,89,0.18)',
    borderColor: 'rgba(212,163,89,0.55)',
  },
  chipText: {
    color: light.inkMuted,
    fontFamily: fonts.sans.medium,
    fontSize: 12.5,
  },
  chipTextActive: { color: '#8A6B2A', fontFamily: fonts.sans.bold },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: { flex: 1 },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(212,163,89,0.16)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  aiBtnText: {
    color: '#A9823A',
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
  },
  aiHint: {
    color: '#8A6B2A',
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    marginTop: 6,
  },
  error: {
    color: light.danger,
    fontFamily: fonts.sans.medium,
    fontSize: 13,
    marginTop: 12,
  },
  publish: {
    marginTop: 20,
    height: 54,
    borderRadius: 999,
    backgroundColor: '#D9A94A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishText: {
    color: '#2A1A10',
    fontFamily: fonts.sans.bold,
    fontSize: 15.5,
    letterSpacing: 0.3,
  },
});