export type AuthStackParamList = {
  Welcome: undefined;
};

export type OnboardingStackParamList = {
  ChooseRole: undefined;
};

export type AppStackParamList = {
  CustomerHome: undefined;
  Category: { categoryId: string; categoryName: string };
  ProductDetail: { productId: string };
  Customize: { productId: string };
  FindMyMaker: undefined;
  Stories: undefined;
  Cart: undefined;
  Checkout: undefined;
  Orders: undefined;
  OrderDetail: { orderId: string };
  Wishlist: undefined;
  Profile: undefined;
  CreatorProfile: { creatorId: string };
  SellerDashboard: undefined;
  AddProduct: undefined;
};