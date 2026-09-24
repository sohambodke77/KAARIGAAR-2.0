import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

import { getProduct } from '../data/products';

export interface Customization {
  name: string;
  initials: string;
  message: string;
  color: string;
  size: string;
  material: string;
  pattern: string;
  referenceNote: string;
  instructions: string;
}

export interface CartItem {
  key: string;
  productId: string;
  qty: number;
  customization?: Customization;
}

export interface Address {
  name: string;
  phone: string;
  city: string;
  locality: string;
}

export interface OrderItem {
  productId: string;
  qty: number;
  customization?: Customization;
}

export interface Order {
  id: string;
  items: OrderItem[];
  placedAt: number;
  status: 'Processing' | 'Ready to Ship' | 'Shipped' | 'Delivered';
  total: number;
  address: Address;
  isCustomRequest?: boolean;
}

export interface CustomRequest {
  id: string;
  productId: string;
  creatorId: string;
  customization: Customization;
  qty: number;
  createdAt: number;
  status: 'Pending' | 'Accepted' | 'Quoted';
  budget: string;
}

interface MarketContextValue {
  hydrated: boolean;
  wishlist: string[];
  cart: CartItem[];
  orders: Order[];
  customRequests: CustomRequest[];
  savedCreators: string[];
  toggleWishlist: (productId: string) => void;
  toggleSavedCreator: (creatorId: string) => void;
  addToCart: (productId: string, qty?: number, customization?: Customization) => void;
  updateCartQty: (key: string, qty: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  placeOrder: (address: Address) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  addCustomRequest: (req: Omit<CustomRequest, 'id' | 'createdAt' | 'status'>) => void;
  respondToRequest: (id: string, status: CustomRequest['status']) => void;
}

const STORAGE = {
  wishlist: '@kaarigaar/wishlist',
  cart: '@kaarigaar/cart',
  orders: '@kaarigaar/orders',
  customRequests: '@kaarigaar/customRequests',
  savedCreators: '@kaarigaar/savedCreators',
} as const;

const MarketContext = createContext<MarketContextValue | null>(null);

function usePersisted<T>(
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(key);
        if (raw) setValue(JSON.parse(raw));
      } catch {
        // ignore corrupt storage
      } finally {
        setReady(true);
      }
    })();
  }, [key]);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
  }, [key, value, ready]);

  return [value, setValue, ready];
}

export function MarketProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist, wishlistReady] = usePersisted<string[]>(STORAGE.wishlist, []);
  const [cart, setCart, cartReady] = usePersisted<CartItem[]>(STORAGE.cart, []);
  const [orders, setOrders, ordersReady] = usePersisted<Order[]>(STORAGE.orders, []);
  const [customRequests, setCustomRequests, requestsReady] = usePersisted<CustomRequest[]>(STORAGE.customRequests, []);
  const [savedCreators, setSavedCreators, creatorsReady] = usePersisted<string[]>(STORAGE.savedCreators, []);

  const hydrated = wishlistReady && cartReady && ordersReady && requestsReady && creatorsReady;

  const value = useMemo<MarketContextValue>(
    () => ({
      hydrated,
      wishlist,
      cart,
      orders,
      customRequests,
      savedCreators,

      toggleWishlist(productId) {
        setWishlist((prev) =>
          prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
        );
      },

      toggleSavedCreator(creatorId) {
        setSavedCreators((prev) =>
          prev.includes(creatorId) ? prev.filter((id) => id !== creatorId) : [...prev, creatorId],
        );
      },

      addToCart(productId, qty = 1, customization) {
        const key = customization ? `${productId}:${JSON.stringify(customization)}` : productId;
        setCart((prev) => {
          const existing = prev.find((item) => item.key === key);
          if (existing) {
            return prev.map((item) =>
              item.key === key ? { ...item, qty: item.qty + qty } : item,
            );
          }
          return [...prev, { key, productId, qty, customization }];
        });
      },

      updateCartQty(key, qty) {
        setCart((prev) =>
          qty <= 0
            ? prev.filter((item) => item.key !== key)
            : prev.map((item) => (item.key === key ? { ...item, qty } : item)),
        );
      },

      removeFromCart(key) {
        setCart((prev) => prev.filter((item) => item.key !== key));
      },

      clearCart() {
        setCart([]);
      },

      placeOrder(address) {
        const total = cart.reduce((sum, item) => {
          const product = getProduct(item.productId);
          const unit = product.price * (item.customization ? 1.25 : 1);
          return sum + unit * item.qty;
        }, 0);
        const order: Order = {
          id: `ORD-${Date.now().toString(36).toUpperCase()}`,
          items: cart.map(({ productId, qty, customization }) => ({
            productId,
            qty,
            customization,
          })),
          placedAt: Date.now(),
          status: 'Processing',
          total,
          address,
        };
        setOrders((prev) => [order, ...prev]);
        setCart([]);
        return order;
      },

      addCustomRequest(req) {
        const request: CustomRequest = {
          ...req,
          id: `REQ-${Date.now().toString(36).toUpperCase()}`,
          createdAt: Date.now(),
          status: 'Pending',
        };
        setCustomRequests((prev) => [request, ...prev]);
      },

      respondToRequest(id, status) {
        setCustomRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r)),
        );
      },

      updateOrderStatus(orderId, status) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
        );
      },
    }),
    [wishlist, cart, orders, customRequests, savedCreators, setWishlist, setCart, setOrders, setCustomRequests, setSavedCreators, hydrated],
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket(): MarketContextValue {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error('useMarket must be used within MarketProvider');
  return ctx;
}