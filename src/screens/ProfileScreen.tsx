import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Avatar } from '../components/Avatar';
import { useAuth, type Role } from '../context/AuthContext';
import { colors, fonts, radius } from '../theme';
import type { AppStackParamList } from '../navigation/types';

const METHOD_LABELS: Record<string, string> = {
  phone: 'Phone number',
  email: 'Email',
  google: 'Google',
};

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { user, activeRole, chooseRole, signOut } = useAuth();

  const displayName =
    user?.method === 'google' ? 'KARIGAAR Member' : (user?.identifier ?? 'KARIGAAR Member');

  const switchTo = async (role: Role) => {
    await chooseRole(role);
    navigation.reset({
      index: 0,
      routes: [{ name: role === 'seller' ? 'SellerDashboard' : 'CustomerHome' }],
    });
  };

  const roles: {
    role: Role;
    icon: 'shopping-outline' | 'palette';
    label: string;
    blurb: string;
  }[] = [
    { role: 'customer', icon: 'shopping-outline', label: 'Customer', blurb: 'Discover handmade' },
    { role: 'seller', icon: 'palette', label: 'Seller / Creator', blurb: 'Turn your craft into a business' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={8}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <Ionicons name="chevron-back" size={22} color={colors.cream} />
          </Pressable>
          <Text style={styles.headerTitle}>Your Profile</Text>
          <View style={styles.backButton} />
        </View>

        <View style={styles.identity}>
          <Avatar label={displayName} size={72} />
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.method}>
            Signed in with {user ? METHOD_LABELS[user.method] : 'KARIGAAR'}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>EXPERIENCE</Text>
        <View style={styles.section}>
          {roles.map((item, index) => {
            const active = activeRole === item.role;
            return (
              <View key={item.role} style={[styles.roleRow, index > 0 && styles.roleDivider]}>
                <View style={styles.roleIcon}>
                  <MaterialCommunityIcons name={item.icon} size={20} color={colors.gold} />
                </View>
                <View style={styles.roleBody}>
                  <Text style={styles.roleName}>{item.label}</Text>
                  <Text style={styles.roleBlurb}>{item.blurb}</Text>
                </View>
                {active ? (
                  <View style={styles.activePill}>
                    <View style={styles.activeDot} />
                    <Text style={styles.activeText}>Active</Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() => switchTo(item.role)}
                    hitSlop={8}
                    style={({ pressed }) => [styles.switchButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.switchText}>Switch</Text>
                    <Ionicons name="arrow-forward" size={13} color={colors.gold} />
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.hint}>You can switch anytime — nothing is locked in.</Text>

        <Pressable
          onPress={signOut}
          style={({ pressed }) => [styles.signOutRow, pressed && styles.pressed]}
        >
          <Ionicons name="log-out-outline" size={18} color={colors.creamDim} />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>

        <Text style={styles.version}>KARIGAAR · व1.0</Text>
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
    paddingTop: 12,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  headerTitle: {
    color: colors.cream,
    fontFamily: fonts.serif.semibold,
    fontSize: 20,
  },
  identity: {
    alignItems: 'center',
    marginTop: 28,
  },
  name: {
    color: colors.cream,
    fontFamily: fonts.serif.bold,
    fontSize: 22,
    marginTop: 14,
  },
  method: {
    color: colors.creamDim,
    fontFamily: fonts.sans.regular,
    fontSize: 13,
    marginTop: 6,
  },
  sectionLabel: {
    color: colors.gold,
    fontFamily: fonts.sans.semibold,
    fontSize: 11,
    letterSpacing: 2.6,
    marginTop: 36,
    marginBottom: 12,
  },
  section: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
  },
  roleDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  roleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.goldDim,
    backgroundColor: colors.goldFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBody: {
    flex: 1,
  },
  roleName: {
    color: colors.cream,
    fontFamily: fonts.sans.semibold,
    fontSize: 14.5,
  },
  roleBlurb: {
    color: colors.creamDim,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    marginTop: 2,
  },
  activePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.goldDim,
    backgroundColor: colors.goldFaint,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
  },
  activeText: {
    color: colors.gold,
    fontFamily: fonts.sans.semibold,
    fontSize: 12,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 30,
    paddingHorizontal: 10,
  },
  switchText: {
    color: colors.gold,
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
  },
  hint: {
    color: colors.creamFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 12.5,
    textAlign: 'center',
    marginTop: 14,
  },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 34,
  },
  signOutText: {
    color: colors.creamDim,
    fontFamily: fonts.sans.semibold,
    fontSize: 14.5,
  },
  version: {
    color: colors.creamFaint,
    fontFamily: fonts.sans.regular,
    fontSize: 11,
    letterSpacing: 1.2,
    textAlign: 'center',
    marginTop: 34,
  },
});