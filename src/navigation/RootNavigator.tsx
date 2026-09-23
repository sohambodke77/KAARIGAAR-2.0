import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import type { AppStackParamList, AuthStackParamList, OnboardingStackParamList } from './types';
import { CustomerHomeScreen } from '../screens/CustomerHomeScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RoleScreen } from '../screens/RoleScreen';
import { SellerDashboardScreen } from '../screens/SellerDashboardScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';

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

const stackScreenOptions = {
  headerShown: false,
  contentStyle: { backgroundColor: colors.background },
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
    <AuthStack.Navigator screenOptions={stackScreenOptions}>
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
      <AppStack.Screen name="CustomerHome" component={CustomerHomeScreen} />
      <AppStack.Screen name="SellerDashboard" component={SellerDashboardScreen} />
      <AppStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
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