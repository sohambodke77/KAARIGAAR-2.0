import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
};

export type OnboardingStackParamList = {
  ChooseRole: undefined;
};

export type CustomerTabParamList = {
  HomeTab: undefined;
  ExploreTab: { q?: string } | undefined;
  CreateTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

export type CustomerStackParamList = {
  Tabs: NavigatorScreenParams<CustomerTabParamList>;
  Category: { id: string };
  Product: { id: string };
  Creator: { id: string };
  Customize: { id: string };
  FindMyMaker: undefined;
  Stories: undefined;
  StoryDetail: { id: string };
  Cart: undefined;
  Checkout: undefined;
  OrderDetail: { orderId: string };
  Wishlist: undefined;
  Settings: undefined;
};

export type CreatorStackParamList = {
  Dashboard: undefined;
  Products: undefined;
  ProductNew: undefined;
  CreatorOrders: undefined;
  CustomRequests: undefined;
  Messages: undefined;
  Analytics: undefined;
  CreatorProfile: undefined;
};

export type AppStackParamList = {
  Customer: NavigatorScreenParams<CustomerStackParamList>;
  Creator: NavigatorScreenParams<CreatorStackParamList>;
};

export type RootParamList = AuthStackParamList &
  OnboardingStackParamList &
  AppStackParamList;