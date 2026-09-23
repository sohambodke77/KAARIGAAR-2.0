import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { ScreenHeader } from '../components/ScreenHeader';
import { colors, fonts, radius } from '../theme';
import type { AppStackParamList } from '../navigation/types';

const STATS = [
  { value: '12', label: 'Orders', icon: 'package-variant-closed' },
  { value: '₹4,820', label: 'Revenue', icon: 'currency-inr' },
  { value: '8', label: 'Products', icon: 'shopping-outline' },
  { value: '4.9★', label: 'Rating', icon: 'star-outline' },
] as const;

const TOOLS = [
  {
    icon: 'package-variant-closed',
    title: 'Products & orders',
    body: 'Manage your catalog and order queue',
  },
  {
    icon: 'clipboard-text-outline',
    title: 'Custom orders',
    body: 'Receive and fulfil custom requests',
  },
  {
    icon: 'bullhorn-outline',
    title: 'Reach customers',
    body: 'Promote your craft to finding hands',
  },
] as const;

export function SellerDashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader onProfile={() => navigation.navigate('Profile')} />

        <View style={styles.greeting}>
          <Text style={styles.label}>SELLER / CREATOR</Text>
          <Text style={styles.title}>Your craft is a{'\n'}business now.</Text>
        </View>

        <View style={styles.statsGrid}>
          {STATS.map((stat) => (
            <View key={stat.label} style={styles.statTile}>
              <MaterialCommunityIcons name={stat.icon} size={18} color={colors.gold} />
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tools}>
          {TOOLS.map((tool, index) => (
            <View key={tool.title} style={[styles.toolRow, index > 0 && styles.toolDivider]}>
              <View style={styles.toolIcon}>
                <MaterialCommunityIcons name={tool.icon} size={20} color={colors.gold} />
              </View>
              <View style={styles.toolBody}>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolBodyText}>{tool.body}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.creamFaint} />
            </View>
          ))}
        </View>

        <Text style={styles.footnote}>Your dashboard is ready. Build your store soon.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 28,
  },
  greeting: {
    marginTop: 34,
  },
  label: {
    color: colors.gold,
    fontFamily: fonts.sans.semibold,
    fontSize: 11,
    letterSpacing: 2.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    color: colors.cream,
    fontFamily: fonts.serif.bold,
    fontSize: 28,
    lineHeight: 37,
  },
  statsGrid: {
    marginTop: 26,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statTile: {
    width: '48%',
    flexGrow: 1,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    padding: 16,
    gap: 6,
  },
  statValue: {
    color: colors.cream,
    fontFamily: fonts.serif.bold,
    fontSize: 22,
  },
  statLabel: {
    color: colors.creamFaint,
    fontFamily: fonts.sans.medium,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  tools: {
    marginTop: 24,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
  },
  toolDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  toolIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.goldDim,
    backgroundColor: colors.goldFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBody: {
    flex: 1,
  },
  toolTitle: {
    color: colors.cream,
    fontFamily: fonts.sans.semibold,
    fontSize: 14.5,
  },
  toolBodyText: {
    color: colors.creamDim,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    marginTop: 2,
  },
  footnote: {
    color: colors.creamFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 30,
  },
});