import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { AppStackParamList } from '../navigation/types';
import { colors, fonts, radius, shadow } from '../theme';

export type BottomTabType = 'home' | 'explore' | 'create' | 'orders' | 'profile';

interface BottomNavigationProps {
  activeTab?: BottomTabType;
}

export function BottomNavigation({ activeTab = 'home' }: BottomNavigationProps) {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { width } = useWindowDimensions();

  // Desktop uses top navigation bar
  if (width >= 768) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Home Tab */}
      <Pressable
        onPress={() => navigation.navigate('CustomerHome')}
        style={styles.tabButton}
        accessibilityRole="button"
        accessibilityLabel="Home"
      >
        <Ionicons
          name={activeTab === 'home' ? 'home' : 'home-outline'}
          size={21}
          color={activeTab === 'home' ? colors.charcoal : colors.textMuted}
        />
        <Text style={[styles.tabLabel, activeTab === 'home' && styles.tabLabelActive]}>
          Home
        </Text>
      </Pressable>

      {/* Explore Tab */}
      <Pressable
        onPress={() =>
          navigation.navigate('Category', {
            categoryId: 'crochet',
            categoryName: 'Explore All Crafts',
          })
        }
        style={styles.tabButton}
        accessibilityRole="button"
        accessibilityLabel="Explore Crafts"
      >
        <Ionicons
          name={activeTab === 'explore' ? 'compass' : 'compass-outline'}
          size={21}
          color={activeTab === 'explore' ? colors.charcoal : colors.textMuted}
        />
        <Text style={[styles.tabLabel, activeTab === 'explore' && styles.tabLabelActive]}>
          Explore
        </Text>
      </Pressable>

      {/* Center Create Button (Visually Highlighted) */}
      <View style={styles.centerButtonWrapper}>
        <Pressable
          onPress={() => navigation.navigate('FindMyMaker')}
          style={({ pressed }) => [
            styles.centerButton,
            pressed && styles.centerButtonPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Create Custom Craft with a Maker"
        >
          <Ionicons name="sparkles" size={22} color="#FFFFFF" />
          <Text style={styles.centerButtonLabel}>Create</Text>
        </Pressable>
      </View>

      {/* Orders Tab */}
      <Pressable
        onPress={() => navigation.navigate('Orders')}
        style={styles.tabButton}
        accessibilityRole="button"
        accessibilityLabel="My Orders"
      >
        <Ionicons
          name={activeTab === 'orders' ? 'receipt' : 'receipt-outline'}
          size={21}
          color={activeTab === 'orders' ? colors.charcoal : colors.textMuted}
        />
        <Text style={[styles.tabLabel, activeTab === 'orders' && styles.tabLabelActive]}>
          Orders
        </Text>
      </Pressable>

      {/* Profile Tab */}
      <Pressable
        onPress={() => navigation.navigate('Profile')}
        style={styles.tabButton}
        accessibilityRole="button"
        accessibilityLabel="Profile"
      >
        <Ionicons
          name={activeTab === 'profile' ? 'person' : 'person-outline'}
          size={21}
          color={activeTab === 'profile' ? colors.charcoal : colors.textMuted}
        />
        <Text style={[styles.tabLabel, activeTab === 'profile' && styles.tabLabelActive]}>
          Profile
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    position: 'relative',
    ...shadow.medium,
    zIndex: 90,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    paddingVertical: 6,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as never) : {}),
  },
  tabLabel: {
    fontFamily: fonts.sans.medium,
    fontSize: 11,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.charcoal,
    fontFamily: fonts.sans.semibold,
  },
  centerButtonWrapper: {
    top: -14,
    alignItems: 'center',
    justifyContent: 'center',
    width: 68,
  },
  centerButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.charcoal,
    borderWidth: 2.5,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    ...shadow.card,
    ...(Platform.OS === 'web'
      ? ({
          cursor: 'pointer',
          transition: 'transform 0.15s ease',
        } as never)
      : {}),
  },
  centerButtonPressed: {
    transform: [{ scale: 0.94 }],
    backgroundColor: colors.charcoalSoft,
  },
  centerButtonLabel: {
    fontFamily: fonts.sans.bold,
    fontSize: 9,
    color: colors.goldBright,
    letterSpacing: 0.4,
  },
});
