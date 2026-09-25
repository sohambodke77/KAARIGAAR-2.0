import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import type { AppStackParamList, AuthStackParamList, OnboardingStackParamList } from './types';

// Screens
import { AddProductScreen } from '../screens/AddProductScreen';
import { CartScreen } from '../screens/CartScreen';
import { CategoryScreen } from '../screens/CategoryScreen';
import { CheckoutScreen } from '../screens/CheckoutScreen';
import { CreatorProfileScreen } from '../screens/CreatorProfileScreen';
import { CustomerHomeScreen } from '../screens/CustomerHomeScreen';
import { CustomizeScreen } from '../screens/CustomizeScreen';
import { FindMyMakerScreen } from '../screens/FindMyMakerScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RoleScreen } from '../screens/RoleScreen';
import { SellerDashboardScreen } from '../screens/SellerDashboardScreen';
import { StoriesScreen } from '../screens/StoriesScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { WishlistScreen } from '../screens/WishlistScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

const navTheme: Theme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.charcoal,
    background: colors.marketplaceBg,
    card: '#FFFFFF',
    text: colors.textPrimary,
    border: colors.cardBorder,
    notification: colors.terracotta,
  },
};

const stackScreenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.marketplaceBg },
} as const;

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
    <NavigationContainer theme={navTheme}>
      {!user ? <AuthFlow /> : !activeRole ? <OnboardingFlow /> : <AppFlow />}
    </NavigationContainer>
  );
}

function AuthFlow() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
    </AuthStack.Navigator>
  );
}

function OnboardingFlow() {
  return (
    <OnboardingStack.Navigator screenOptions={stackScreenOptions}>
      <OnboardingStack.Screen name="ChooseRole" component={RoleScreen} />
    </OnboardingStack.Navigator>
  );
}

function AppFlow() {
  const { activeRole } = useAuth();
  const initial = activeRole === 'seller' ? 'SellerDashboard' : 'CustomerHome';

  return (
    <AppStack.Navigator
      initialRouteName={initial}
      screenOptions={{ ...stackScreenOptions, animation: 'slide_from_right' }}
    >
      {/* Customer Marketplace Screens */}
      <AppStack.Screen name="CustomerHome" component={CustomerHomeScreen} />
      <AppStack.Screen name="Category" component={CategoryScreen} />
      <AppStack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <AppStack.Screen name="Customize" component={CustomizeScreen} />
      <AppStack.Screen name="FindMyMaker" component={FindMyMakerScreen} />
      <AppStack.Screen name="Stories" component={StoriesScreen} />
      <AppStack.Screen name="Cart" component={CartScreen} />
      <AppStack.Screen name="Checkout" component={CheckoutScreen} />
      <AppStack.Screen name="Orders" component={OrdersScreen} />
      <AppStack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <AppStack.Screen name="Wishlist" component={WishlistScreen} />
      <AppStack.Screen name="Profile" component={ProfileScreen} />
      <AppStack.Screen name="CreatorProfile" component={CreatorProfileScreen} />

      {/* Creator Hub Screens */}
      <AppStack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
      <AppStack.Screen name="AddProduct" component={AddProductScreen} />
    </AppStack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.marketplaceBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});