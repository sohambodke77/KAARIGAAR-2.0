import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { CreatorStackParamList } from './types';
import { light } from '../theme';

import { CreatorDashboardScreen } from '../screens/CreatorDashboardScreen';
import { CreatorProductsScreen } from '../screens/CreatorProductsScreen';
import { CreatorProductNewScreen } from '../screens/CreatorProductNewScreen';
import { CreatorOrdersScreen } from '../screens/CreatorOrdersScreen';
import { CreatorCustomRequestsScreen } from '../screens/CreatorCustomRequestsScreen';
import { CreatorMessagesScreen } from '../screens/CreatorMessagesScreen';
import { CreatorAnalyticsScreen } from '../screens/CreatorAnalyticsScreen';
import { CreatorProfileScreen } from '../screens/CreatorProfileScreen';

const Stack = createNativeStackNavigator<CreatorStackParamList>();

export function CreatorNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: light.bg } }}
    >
      <Stack.Screen name="Dashboard" component={CreatorDashboardScreen} />
      <Stack.Screen name="Products" component={CreatorProductsScreen} />
      <Stack.Screen name="ProductNew" component={CreatorProductNewScreen} />
      <Stack.Screen name="CreatorOrders" component={CreatorOrdersScreen} />
      <Stack.Screen name="CustomRequests" component={CreatorCustomRequestsScreen} />
      <Stack.Screen name="Messages" component={CreatorMessagesScreen} />
      <Stack.Screen name="Analytics" component={CreatorAnalyticsScreen} />
      <Stack.Screen name="CreatorProfile" component={CreatorProfileScreen} />
    </Stack.Navigator>
  );
}