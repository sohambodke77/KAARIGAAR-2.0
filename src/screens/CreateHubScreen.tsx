import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { PRODUCTS } from '../data/products';
import { ProductCover } from '../components/ProductCover';
import { fonts, light } from '../theme';
import type { CustomerStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;

export function CreateHubScreen() {
  const navigation = useNavigation<Nav>();
  const customizable = PRODUCTS.filter((p) => p.customization).slice(0, 8);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Create</Text>
        <Text style={styles.subtitle}>
          Your ideas, made by real hands. Start with a vision or find the maker who fits.
        </Text>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Ionicons name="search-outline" size={22} color="#A9823A" />
          </View>
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>Find My Maker</Text>
            <Text style={styles.featureSub}>
              Describe what you want, set a budget, and get matched with creators.
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('FindMyMaker')}
            style={({ pressed }) => [styles.featureBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.featureBtnText}>Start →</Text>
          </Pressable>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.featureIcon}>
            <Ionicons name="images-outline" size={22} color="#A9823A" />
          </View>
          <View style={styles.featureInfo}>
            <Text style={styles.featureTitle}>Handmade Stories</Text>
            <Text style={styles.featureSub}>
              Stories Carved in Hand & Heart — meet the makers.
            </Text>
          </View>
          <Pressable
            onPress={() => navigation.navigate('Stories')}
            style={({ pressed }) => [styles.featureBtn, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.featureBtnText}>Read →</Text>
          </Pressable>
        </View>

        <Text style={styles.section}>Start customizing a creation</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
          {customizable.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => navigation.navigate('Customize', { id: p.id })}
              style={({ pressed }) => [styles.customCard, pressed && { opacity: 0.9 }]}
            >
              <ProductCover categoryId={p.categoryId} label={p.name} height={90} width={130} />
              <Text style={styles.customName} numberOfLines={2}>{p.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  scroll: { padding: 16, paddingBottom: 32 },
  title: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 24,
  },
  subtitle: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    lineHeight: 20,
    marginTop: 4,
  },
  featureCard: {
    marginTop: 16,
    backgroundColor: light.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: light.line,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(212,163,89,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureInfo: { flex: 1, minWidth: 160, gap: 3 },
  featureTitle: {
    color: light.ink,
    fontFamily: fonts.serif.semibold,
    fontSize: 17,
  },
  featureSub: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    lineHeight: 17,
  },
  featureBtn: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(212,163,89,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureBtnText: {
    color: '#A9823A',
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
  },
  section: {
    color: light.ink,
    fontFamily: fonts.serif.semibold,
    fontSize: 18,
    marginTop: 26,
    marginBottom: 12,
  },
  hList: { gap: 12 },
  customCard: { width: 130, gap: 6 },
  customName: {
    color: light.ink,
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    lineHeight: 16,
  },
});