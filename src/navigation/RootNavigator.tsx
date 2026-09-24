import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  DefaultTheme,
  NavigationContainer,
  useNavigation,
  type LinkingOptions,
  type Theme,
} from '@react-navigation/native';
import { createNativeStackNavigator, type NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect } from 'react';

import { useAuth } from '../context/AuthContext';
import { colors, light } from '../theme';
import {
  type AppStackParamList,
  type AuthStackParamList,
  type OnboardingStackParamList,
  type RootParamList,
} from './types';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { RoleScreen } from '../screens/RoleScreen';
import { CustomerNavigator } from './CustomerNavigator';
import { CreatorNavigator } from './CreatorNavigator';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const navTheme: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.gold,
    background: colors.background,
    card: colors.background,
    text: colors.cream,
    border: colors.line,
    notification: colors.gold,
  },
};

const darkStackOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.background },
} as const;

export const linking: LinkingOptions<RootParamList> = {
  prefixes: [],
  config: {
    screens: {
      Welcome: 'login',
      ChooseRole: 'role-selection',
      Customer: {
        screens: {
          Tabs: {
            screens: {
              HomeTab: 'home',
              ExploreTab: 'explore',
              CreateTab: 'create',
              OrdersTab: 'my-orders',
              ProfileTab: 'my-profile',
            },
          },
          Category: 'category/:id',
          Product: 'product/:id',
          Creator: 'creator/:id',
          Customize: 'customize/:id',
          FindMyMaker: 'find-my-maker',
          Stories: 'stories',
          StoryDetail: 'stories/:id',
          Cart: 'cart',
          Checkout: 'checkout',
          OrderDetail: 'orders/:orderId',
          Wishlist: 'wishlist',
          Settings: 'settings',
        },
      },
      Creator: {
        screens: {
          Dashboard: 'creator',
          Products: 'creator/products',
          ProductNew: 'creator/products/new',
          CreatorOrders: 'creator/orders',
          CustomRequests: 'creator/custom-requests',
          Messages: 'creator/messages',
          Analytics: 'creator/analytics',
          CreatorProfile: 'creator/profile',
        },
      },
    },
  },
};

export function RootNavigator() {
  const { hydrated, user, activeRole } = useAuth();

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.gold} size="small" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      {!user ? <AuthFlow /> : !activeRole ? <OnboardingFlow /> : <AppFlow />}
    </NavigationContainer>
  );
}

function AuthFlow() {
  return (
    <AuthStack.Navigator screenOptions={darkStackOptions}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    </AuthStack.Navigator>
  );
}

function OnboardingFlow() {
  return (
    <OnboardingStack.Navigator screenOptions={darkStackOptions}>
      <OnboardingStack.Screen name="ChooseRole" component={RoleScreen} />
    </OnboardingStack.Navigator>
  );
}

function AppFlow() {
  const { activeRole } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  useEffect(() => {
    if (activeRole === 'customer') {
      navigation.reset({ index: 0, routes: [{ name: 'Customer' }] });
    } else if (activeRole === 'seller') {
      navigation.reset({ index: 0, routes: [{ name: 'Creator' }] });
    }
  }, [activeRole, navigation]);

  return (
    <AppStack.Navigator
      initialRouteName={activeRole === 'customer' ? 'Customer' : 'Creator'}
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: light.bg } }}
    >
      <AppStack.Screen name="Customer" component={CustomerNavigator} />
      <AppStack.Screen name="Creator" component={CreatorNavigator} />
    </AppStack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});