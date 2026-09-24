import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import type { CustomerStackParamList, CustomerTabParamList } from './types';
import { colors, fonts, light } from '../theme';

import { CustomerHomeScreen } from '../screens/CustomerHomeScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { CreateHubScreen } from '../screens/CreateHubScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { CustomerProfileScreen } from '../screens/CustomerProfileScreen';
import { CategoryScreen } from '../screens/CategoryScreen';
import { ProductScreen } from '../screens/ProductScreen';
import { CreatorScreen } from '../screens/CreatorScreen';
import { CustomizeScreen } from '../screens/CustomizeScreen';
import { FindMyMakerScreen } from '../screens/FindMyMakerScreen';
import { StoriesScreen } from '../screens/StoriesScreen';
import { StoryDetailScreen } from '../screens/StoryDetailScreen';
import { CartScreen } from '../screens/CartScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { WishlistScreen } from '../screens/WishlistScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const Stack = createNativeStackNavigator<CustomerStackParamList>();

const tabIcons: Record<keyof CustomerTabParamList, keyof typeof Ionicons.glyphMap> = {
  HomeTab: 'home',
  ExploreTab: 'compass',
  CreateTab: 'add-circle',
  OrdersTab: 'receipt-outline',
  ProfileTab: 'person-outline',
};

function CreateCenterIcon({ focused }: { focused: boolean }) {
  return (
    <View style={styles.centerWrap}>
      <LinearGradient
        colors={[colors.goldGradientStart, colors.goldGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.centerBtn, focused && styles.centerBtnActive]}
      >
        <Ionicons name="add" size={28} color={colors.buttonText} />
      </LinearGradient>
      {focused ? <View style={styles.dotLight} /> : null}
    </View>
  );
}

function CustomerTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#A9823A',
        tabBarInactiveTintColor: light.inkFaint,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'CreateTab') return <CreateCenterIcon focused={focused} />;
          return (
            <View style={styles.iconWrap}>
              <Ionicons name={tabIcons[route.name]} size={size} color={color} />
              {focused ? <View style={styles.dot} /> : null}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={CustomerHomeScreen} options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="ExploreTab" component={ExploreScreen} options={{ tabBarLabel: 'Explore' }} />
      <Tab.Screen name="CreateTab" component={CreateHubScreen} options={{ tabBarLabel: 'Create' }} />
      <Tab.Screen name="OrdersTab" component={OrdersScreen} options={{ tabBarLabel: 'Orders' }} />
      <Tab.Screen
        name="ProfileTab"
        component={CustomerProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

export function CustomerNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: light.bg } }}
    >
      <Stack.Screen name="Tabs" component={CustomerTabs} />
      <Stack.Screen name="Category" component={CategoryScreen} />
      <Stack.Screen name="Product" component={ProductScreen} />
      <Stack.Screen name="Creator" component={CreatorScreen} />
      <Stack.Screen name="Customize" component={CustomizeScreen} />
      <Stack.Screen name="FindMyMaker" component={FindMyMakerScreen} />
      <Stack.Screen name="Stories" component={StoriesScreen} />
      <Stack.Screen name="StoryDetail" component={StoryDetailScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: light.surface,
    borderTopColor: light.line,
    borderTopWidth: 1,
    height: 62,
    paddingBottom: 6,
    paddingTop: 6,
  },
  tabLabel: {
    fontFamily: fonts.sans.semibold,
    fontSize: 11,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#A9823A',
    marginTop: 2,
  },
  dotLight: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#B98A2E',
    marginTop: 1,
  },
  centerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  centerBtnActive: {
    transform: [{ scale: 1.06 }],
  },
});