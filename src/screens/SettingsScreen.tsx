import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { PageHeader } from '../components/PageHeader';
import { fonts, light } from '../theme';
import type { CustomerStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<CustomerStackParamList>;

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [dark, setDark] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <PageHeader title="Settings" fallback={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <ToggleRow icon="notifications-outline" label="Push notifications" value={push} onChange={setPush} />
          <ToggleRow icon="mail-outline" label="Email updates" value={email} onChange={setEmail} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <ToggleRow icon="moon-outline" label="Dark mode (coming soon)" value={dark} onChange={setDark} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Pressable style={styles.infoRow} accessibilityRole="button">
            <Ionicons name="information-circle-outline" size={19} color="#A9823A" />
            <Text style={styles.infoText}>KARIGAAR · Har Haath Ki Kahani, Aap Tak.</Text>
          </Pressable>
          <Pressable style={styles.infoRow} accessibilityRole="button">
            <Ionicons name="shield-checkmark-outline" size={19} color="#A9823A" />
            <Text style={styles.infoText}>Privacy Policy & Terms</Text>
          </Pressable>
          <Text style={styles.version}>KARIGAAR 1.0 · Demo marketplace build</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleLeft}>
        <Ionicons name={icon} size={19} color="#A9823A" />
        <Text style={styles.toggleLabel}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: 'rgba(212,163,89,0.6)', false: light.lineStrong }}
        thumbColor={value ? '#A9823A' : light.surface}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: light.bg },
  scroll: { padding: 16, paddingBottom: 32 },
  section: {
    backgroundColor: light.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: light.line,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#A9823A',
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: light.line,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleLabel: {
    color: light.ink,
    fontFamily: fonts.sans.medium,
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: light.line,
  },
  infoText: {
    color: light.ink,
    fontFamily: fonts.sans.medium,
    fontSize: 13.5,
    flexShrink: 1,
  },
  version: {
    color: light.inkFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 11.5,
    textAlign: 'center',
    paddingVertical: 10,
  },
});