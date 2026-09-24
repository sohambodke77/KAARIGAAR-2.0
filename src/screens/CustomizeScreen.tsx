import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getProduct } from '../data/products';
import { getCreator } from '../data/creators';
import { PageHeader } from '../components/PageHeader';
import { FormField } from '../components/FormField';
import { QtyStepper } from '../components/QtyStepper';
import { useMarket, type Customization } from '../context/MarketContext';
import { colors, fonts, light } from '../theme';
import type { CustomerStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;
type Route = RouteProp<CustomerStackParamList, 'Customize'>;

function chips(options: string[], selected: string, onSelect: (v: string) => void) {
  return (
    <View style={styles.chipWrap}>
      {options.map((o) => (
        <Pressable
          key={o}
          onPress={() => onSelect(o)}
          style={[styles.chip, selected === o && styles.chipActive]}
        >
          <Text style={[styles.chipText, selected === o && styles.chipTextActive]}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function CustomizeScreen() {
  const navigation = useNavigation<Nav>();
  const { id } = useRoute<Route>().params;
  const { addCustomRequest, addToCart } = useMarket();

  const product = getProduct(id);
  const creator = getCreator(product.creatorId);

  const [name, setName] = useState('');
  const [initials, setInitials] = useState('');
  const [message, setMessage] = useState('');
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState(product.sizes[0]);
  const [material, setMaterial] = useState(product.materials[0]);
  const [pattern, setPattern] = useState('Keep the signature style');
  const [referenceNote, setReferenceNote] = useState('');
  const [instructions, setInstructions] = useState('');
  const [qty, setQty] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  const estimate = Math.round(product.price * 1.25 * qty);
  const time = product.estimatedDays + 2;

  if (submitted) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.success}>
          <Ionicons name="checkmark-circle" size={64} color="#8B9B5A" />
          <Text style={styles.successTitle}>Request Sent to {creator.name}</Text>
          <Text style={styles.successBody}>
            Your custom creation request for “{product.name}” is with the maker. They will
            respond with a quote within ~{time} days.
          </Text>
          <View style={styles.successBtns}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.ghostBtnText}>Back to Product</Text>
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('Cart')}
              style={({ pressed }) => [styles.goldBtn, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.goldBtnText}>View Cart</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const customization: Customization = {
    name,
    initials,
    message,
    color,
    size,
    material,
    pattern,
    referenceNote,
    instructions,
  };

  const handleRequest = () => {
    addCustomRequest({
      productId: product.id,
      creatorId: creator.id,
      customization,
      qty,
      budget: String(estimate),
    });
    setSubmitted(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PageHeader title="Customize This Creation" fallback={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.productLine}>
          {product.name} · by {creator.name}
        </Text>

        <FormField label="Name (to add on the creation)" value={name} onChangeText={setName} placeholder="e.g. Aarohi" />
        <FormField label="Initials" value={initials} onChangeText={setInitials} placeholder="e.g. AV" maxLength={8} />
        <FormField
          label="Message on a gift tag" value={message} onChangeText={setMessage}
          placeholder="Write something personal…" multiline />
        <FormField label="Reference / inspiration note" value={referenceNote} onChangeText={setReferenceNote}
          placeholder="Paste a description or Pinterest-style idea…" multiline />
        <FormField label="Special instructions" value={instructions} onChangeText={setInstructions}
          placeholder="Colours, packaging, delivery date…" multiline />

        <MiniLabel text={`Colour · ${color}`} />
        {chips(product.colors, color, setColor)}

        <MiniLabel text={`Size · ${size}`} />
        {chips(product.sizes, size, setSize)}

        <MiniLabel text={`Material · ${material}`} />
        {chips(product.materials, material, setMaterial)}

        <MiniLabel text="Pattern / Style" />
        {chips(['Signature style', 'Plain & minimal', 'Mixed tones'], pattern, setPattern)}

        <View style={styles.qtyRow}>
          <View>
            <Text style={styles.qtyTitle}>Quantity</Text>
            <Text style={styles.qtySub}>{qty === 1 ? 'Single piece' : `${qty} pieces`}</Text>
          </View>
          <QtyStepper qty={qty} onChange={setQty} max={20} />
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Customization Summary</Text>
          <Row label="Base price" value={`₹${product.price.toLocaleString('en-IN')}`} />
          <Row label="Customization (+25%)" value={`+₹${Math.round(product.price * 0.25).toLocaleString('en-IN')}`} />
          <Row label="Quantity" value={`× ${qty}`} />
          <View style={styles.divider} />
          <Row label="Estimated price" value={`₹${estimate.toLocaleString('en-IN')}`} strong />
          <Row label="Estimated creation time" value={`~${time} days`} />
        </View>

        <Pressable
          onPress={handleRequest}
          style={({ pressed }) => [styles.requestBtn, pressed && { opacity: 0.88 }]}
        >
          <Text style={styles.requestBtnText}>Request Custom Creation</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            addToCart(product.id, qty, customization);
            navigation.navigate('Cart');
          }}
          style={({ pressed }) => [styles.cartBtn, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.cartBtnText}>Add this customization to Cart</Text>
        </Pressable>
        <Text style={styles.note}>
          Requesting starts a conversation with the maker. Nothing is charged until the quote is accepted.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, strong && styles.rowLabelStrong]}>{label}</Text>
      <Text style={[styles.rowValue, strong && styles.rowValueStrong]}>{value}</Text>
    </View>
  );
}

function MiniLabel({ text }: { text: string }) {
  return <Text style={styles.miniLabel}>{text}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  productLine: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    marginBottom: 12,
  },
  miniLabel: {
    color: light.inkMuted,
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    letterSpacing: 0.4,
    marginTop: 16,
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
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    backgroundColor: light.surfaceAlt,
    borderRadius: 14,
    padding: 14,
  },
  qtyTitle: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
  },
  qtySub: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 12,
  },
  summary: {
    marginTop: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 89, 0.35)',
    backgroundColor: light.surface,
    padding: 16,
    gap: 10,
  },
  summaryTitle: {
    color: '#A9823A',
    fontFamily: fonts.serif.semibold,
    fontSize: 16,
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowLabel: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13,
  },
  rowLabelStrong: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
  },
  rowValue: {
    color: light.ink,
    fontFamily: fonts.sans.medium,
    fontSize: 13,
  },
  rowValueStrong: {
    fontFamily: fonts.sans.bold,
    color: '#A9823A',
  },
  divider: {
    height: 1,
    backgroundColor: light.line,
  },
  requestBtn: {
    marginTop: 20,
    height: 52,
    borderRadius: 999,
    backgroundColor: colors.goldGradientStart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  requestBtnText: {
    color: colors.buttonText,
    fontFamily: fonts.sans.bold,
    fontSize: 15,
    letterSpacing: 0.3,
  },
  cartBtn: {
    marginTop: 10,
    height: 50,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(212, 163, 89, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBtnText: {
    color: '#A9823A',
    fontFamily: fonts.sans.semibold,
    fontSize: 14,
  },
  note: {
    color: light.inkFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    lineHeight: 17,
    marginTop: 12,
    textAlign: 'center',
  },
  success: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  successTitle: {
    color: light.ink,
    fontFamily: fonts.serif.bold,
    fontSize: 21,
    textAlign: 'center',
    marginTop: 16,
  },
  successBody: {
    color: light.inkMuted,
    fontFamily: fonts.sans.regular,
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
  successBtns: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  ghostBtn: {
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: light.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostBtnText: {
    color: light.ink,
    fontFamily: fonts.sans.semibold,
    fontSize: 13.5,
  },
  goldBtn: {
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 999,
    backgroundColor: colors.goldGradientStart,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goldBtnText: {
    color: colors.buttonText,
    fontFamily: fonts.sans.semibold,
    fontSize: 13.5,
  },
});