import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { apiRequest, getStoredToken, setStoredToken } from '../services/api';

export type Role = 'customer' | 'seller';

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: Role;
  roles: Role[];
  profilePhoto?: string | null;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  termsAccepted: boolean;
  createdAt?: string;
  identifier?: string;
  method?: string;
}

export interface CreatorProfile {
  userId: string;
  brandName: string;
  tagline: string;
  description: string;
  categories: string[];
  businessAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  serviceArea: string;
  bankDetails: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    upiId?: string;
    isVerified: boolean;
  };
  taxDetails: {
    panNumber: string;
    gstin?: string;
    artisanCardNumber?: string;
    isCompliant: boolean;
  };
  profilePhoto?: string | null;
  onboardingStep?: string;
}

export interface CustomerProfile {
  userId: string;
  addresses: Array<{
    id: string;
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    isDefault?: boolean;
  }>;
  preferences: {
    favoriteCategories: string[];
    newsletter: boolean;
  };
}

export interface CustomerRegisterParams {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  profilePhoto?: string | null;
  termsAccepted: boolean;
}

export interface SellerRegisterParams {
  fullName?: string;
  brandName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  serviceArea: string;
  categories: string[];
  description: string;
  profilePhoto?: string | null;
  bankDetails?: {
    accountHolder: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    upiId?: string;
  };
  taxDetails?: {
    panNumber: string;
    gstin?: string;
    artisanCardNumber?: string;
  };
  termsAccepted: boolean;
}

interface AuthContextValue {
  hydrated: boolean;
  user: User | null;
  creatorProfile: CreatorProfile | null;
  customerProfile: CustomerProfile | null;
  activeRole: Role | null;
  roles: Role[];
  token: string | null;
  guestMode: boolean;
  setGuestMode: (val: boolean) => void;
  signIn: (identifier: string, password: string, rememberMe?: boolean) => Promise<{ user: User; role: Role }>;
  registerCustomer: (params: CustomerRegisterParams) => Promise<{ user: User; token: string; otpPreview?: string }>;
  registerSeller: (params: SellerRegisterParams) => Promise<{ user: User; token: string; creatorProfile: CreatorProfile; otpPreview?: string }>;
  verifyOtp: (otp: string, identifier?: string) => Promise<User>;
  resendOtp: (identifier?: string) => Promise<{ message: string; otpPreview?: string }>;
  forgotPassword: (identifier: string) => Promise<{ message: string; resetTokenPreview?: string }>;
  resetPassword: (params: { identifier: string; otp: string; newPassword: string; confirmPassword: string }) => Promise<void>;
  signInWithGoogle: (roleChoice?: Role) => Promise<{ user: User; role: Role }>;
  chooseRole: (role: Role) => Promise<void>;
  signOut: () => Promise<void>;
  updateCustomerProfile: (data: Partial<CustomerProfile> & { fullName?: string }) => Promise<void>;
  updateCreatorProfile: (data: Partial<CreatorProfile>) => Promise<void>;
  savePayoutDetails: (bankDetails: CreatorProfile['bankDetails'], taxDetails?: CreatorProfile['taxDetails']) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const STORAGE = {
  session: '@kaarigaar/session',
  roles: '@kaarigaar/roles',
  activeRole: '@kaarigaar/activeRole',
  creatorProfile: '@kaarigaar/creatorProfile',
  customerProfile: '@kaarigaar/customerProfile',
  guestMode: '@kaarigaar/guestMode',
} as const;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [guestMode, setGuestModeState] = useState<boolean>(false);

  // Restore stored session on mount
  useEffect(() => {
    (async () => {
      try {
        const [savedToken, sessionRaw, rolesRaw, activeRaw, creatorRaw, customerRaw, guestRaw] = await Promise.all([
          getStoredToken(),
          AsyncStorage.getItem(STORAGE.session),
          AsyncStorage.getItem(STORAGE.roles),
          AsyncStorage.getItem(STORAGE.activeRole),
          AsyncStorage.getItem(STORAGE.creatorProfile),
          AsyncStorage.getItem(STORAGE.customerProfile),
          AsyncStorage.getItem(STORAGE.guestMode),
        ]);

        if (savedToken) setToken(savedToken);
        if (sessionRaw) setUser(JSON.parse(sessionRaw));
        if (rolesRaw) setRoles(JSON.parse(rolesRaw));
        if (activeRaw === 'customer' || activeRaw === 'seller') setActiveRole(activeRaw);
        if (creatorRaw) setCreatorProfile(JSON.parse(creatorRaw));
        if (customerRaw) setCustomerProfile(JSON.parse(customerRaw));
        if (guestRaw === 'true') setGuestModeState(true);

        // If we have a token, verify live with backend `/me`
        if (savedToken) {
          try {
            const data = await apiRequest<{
              success: boolean;
              user: User;
              creatorProfile?: CreatorProfile;
              customerProfile?: CustomerProfile;
            }>('/auth/me', { token: savedToken });

            if (data.success && data.user) {
              setUser(data.user);
              setRoles(data.user.roles || [data.user.role]);
              if (data.creatorProfile) setCreatorProfile(data.creatorProfile);
              if (data.customerProfile) setCustomerProfile(data.customerProfile);
            }
          } catch {
            // Server offline or token invalid - keep cached session for resilience
          }
        }
      } catch (err) {
        console.error('Session restoration error:', err);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const setGuestMode = async (val: boolean) => {
    setGuestModeState(val);
    if (val) {
      await AsyncStorage.setItem(STORAGE.guestMode, 'true');
    } else {
      await AsyncStorage.removeItem(STORAGE.guestMode);
    }
  };

  const handleAuthSuccess = async (
    newUser: User,
    newToken: string,
    newCreatorProfile?: CreatorProfile | null,
    newCustomerProfile?: CustomerProfile | null,
    targetRole?: Role
  ) => {
    const userRoles = newUser.roles && newUser.roles.length > 0 ? newUser.roles : [newUser.role];
    const roleToActivate = targetRole || (userRoles.includes('seller') ? 'seller' : 'customer');

    await Promise.all([
      setStoredToken(newToken),
      AsyncStorage.setItem(STORAGE.session, JSON.stringify(newUser)),
      AsyncStorage.setItem(STORAGE.roles, JSON.stringify(userRoles)),
      AsyncStorage.setItem(STORAGE.activeRole, roleToActivate),
      newCreatorProfile ? AsyncStorage.setItem(STORAGE.creatorProfile, JSON.stringify(newCreatorProfile)) : Promise.resolve(),
      newCustomerProfile ? AsyncStorage.setItem(STORAGE.customerProfile, JSON.stringify(newCustomerProfile)) : Promise.resolve(),
      AsyncStorage.removeItem(STORAGE.guestMode),
    ]);

    setToken(newToken);
    setUser(newUser);
    setRoles(userRoles);
    setActiveRole(roleToActivate);
    if (newCreatorProfile) setCreatorProfile(newCreatorProfile);
    if (newCustomerProfile) setCustomerProfile(newCustomerProfile);
    setGuestModeState(false);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      hydrated,
      user,
      creatorProfile,
      customerProfile,
      activeRole,
      roles,
      token,
      guestMode,
      setGuestMode,

      async signIn(identifier: string, password: string, rememberMe = true) {
        const res = await apiRequest<{
          success: boolean;
          token: string;
          user: User;
          creatorProfile?: CreatorProfile;
          customerProfile?: CustomerProfile;
        }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ identifier, password }),
        });

        const targetRole: Role = res.user.role === 'seller' ? 'seller' : 'customer';
        await handleAuthSuccess(res.user, res.token, res.creatorProfile, res.customerProfile, targetRole);
        return { user: res.user, role: targetRole };
      },

      async registerCustomer(params: CustomerRegisterParams) {
        const res = await apiRequest<{
          success: boolean;
          token: string;
          user: User;
          otpPreview?: string;
        }>('/auth/register/customer', {
          method: 'POST',
          body: JSON.stringify(params),
        });

        await handleAuthSuccess(res.user, res.token, null, null, 'customer');
        return { user: res.user, token: res.token, otpPreview: res.otpPreview };
      },

      async registerSeller(params: SellerRegisterParams) {
        const res = await apiRequest<{
          success: boolean;
          token: string;
          user: User;
          creatorProfile: CreatorProfile;
          otpPreview?: string;
        }>('/auth/register/seller', {
          method: 'POST',
          body: JSON.stringify(params),
        });

        await handleAuthSuccess(res.user, res.token, res.creatorProfile, null, 'seller');
        return {
          user: res.user,
          token: res.token,
          creatorProfile: res.creatorProfile,
          otpPreview: res.otpPreview,
        };
      },

      async verifyOtp(otp: string, identifier?: string) {
        const res = await apiRequest<{
          success: boolean;
          message: string;
          user: User;
        }>('/auth/verify-otp', {
          method: 'POST',
          body: JSON.stringify({
            userId: user?.id,
            identifier: identifier || user?.email || user?.mobile,
            otp,
          }),
        });

        const updated = { ...user, ...res.user, isEmailVerified: true, isMobileVerified: true };
        setUser(updated);
        await AsyncStorage.setItem(STORAGE.session, JSON.stringify(updated));
        return updated;
      },

      async resendOtp(identifier?: string) {
        return await apiRequest<{
          success: boolean;
          message: string;
          otpPreview?: string;
        }>('/auth/resend-otp', {
          method: 'POST',
          body: JSON.stringify({
            userId: user?.id,
            identifier: identifier || user?.email || user?.mobile,
          }),
        });
      },

      async forgotPassword(identifier: string) {
        return await apiRequest<{
          success: boolean;
          message: string;
          resetTokenPreview?: string;
        }>('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ identifier }),
        });
      },

      async resetPassword(params) {
        await apiRequest<{ success: boolean; message: string }>('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify(params),
        });
      },

      async signInWithGoogle(roleChoice = 'customer') {
        const res = await apiRequest<{
          success: boolean;
          token: string;
          user: User;
          creatorProfile?: CreatorProfile;
          customerProfile?: CustomerProfile;
        }>('/auth/google', {
          method: 'POST',
          body: JSON.stringify({
            roleChoice,
            email: 'artisan.google@kaarigaar.in',
            fullName: 'Google Craft Explorer',
            profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          }),
        });

        const targetRole: Role = roleChoice;
        await handleAuthSuccess(res.user, res.token, res.creatorProfile, res.customerProfile, targetRole);
        return { user: res.user, role: targetRole };
      },

      async chooseRole(role: Role) {
        // Guard: A pure customer without seller credentials must not access seller features
        if (role === 'seller' && user && !roles.includes('seller')) {
          // Add seller role to user account on server & client
          try {
            await apiRequest('/creator/profile', {
              method: 'PUT',
              body: JSON.stringify({
                brandName: `${user.fullName}'s Studio`,
                tagline: 'Har Haath Ki Kahani, Aap Tak.',
                description: 'Handmade craft creator on KARIGAAR.',
                categories: ['crochet', 'candles'],
              }),
            });
          } catch {
            // Allow fallback
          }
        }

        const nextRoles = roles.includes(role) ? roles : [...roles, role];
        await Promise.all([
          AsyncStorage.setItem(STORAGE.roles, JSON.stringify(nextRoles)),
          AsyncStorage.setItem(STORAGE.activeRole, role),
        ]);
        setRoles(nextRoles);
        setActiveRole(role);
      },

      async signOut() {
        try {
          await apiRequest('/auth/logout', { method: 'POST' });
        } catch {
          // ignore
        }
        await Promise.all([
          setStoredToken(null),
          AsyncStorage.removeItem(STORAGE.session),
          AsyncStorage.removeItem(STORAGE.roles),
          AsyncStorage.removeItem(STORAGE.activeRole),
          AsyncStorage.removeItem(STORAGE.creatorProfile),
          AsyncStorage.removeItem(STORAGE.customerProfile),
          AsyncStorage.removeItem(STORAGE.guestMode),
        ]);
        setToken(null);
        setUser(null);
        setRoles([]);
        setActiveRole(null);
        setCreatorProfile(null);
        setCustomerProfile(null);
        setGuestModeState(false);
      },

      async updateCustomerProfile(data) {
        const res = await apiRequest<{
          success: boolean;
          user: User;
          customerProfile: CustomerProfile;
        }>('/user/profile', {
          method: 'PUT',
          body: JSON.stringify(data),
        });
        if (res.user) setUser(res.user);
        if (res.customerProfile) {
          setCustomerProfile(res.customerProfile);
          await AsyncStorage.setItem(STORAGE.customerProfile, JSON.stringify(res.customerProfile));
        }
      },

      async updateCreatorProfile(data) {
        const res = await apiRequest<{
          success: boolean;
          creatorProfile: CreatorProfile;
        }>('/creator/profile', {
          method: 'PUT',
          body: JSON.stringify(data),
        });
        if (res.creatorProfile) {
          setCreatorProfile(res.creatorProfile);
          await AsyncStorage.setItem(STORAGE.creatorProfile, JSON.stringify(res.creatorProfile));
        }
      },

      async savePayoutDetails(bankDetails, taxDetails) {
        const res = await apiRequest<{
          success: boolean;
          creatorProfile: CreatorProfile;
        }>('/creator/payout-setup', {
          method: 'POST',
          body: JSON.stringify({ bankDetails, taxDetails }),
        });
        if (res.creatorProfile) {
          setCreatorProfile(res.creatorProfile);
          await AsyncStorage.setItem(STORAGE.creatorProfile, JSON.stringify(res.creatorProfile));
        }
      },

      async refreshSession() {
        const curToken = await getStoredToken();
        if (!curToken) return;
        try {
          const res = await apiRequest<{
            success: boolean;
            user: User;
            creatorProfile?: CreatorProfile;
            customerProfile?: CustomerProfile;
          }>('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
            if (res.creatorProfile) setCreatorProfile(res.creatorProfile);
            if (res.customerProfile) setCustomerProfile(res.customerProfile);
          }
        } catch {
          // ignore
        }
      },
    }),
    [hydrated, user, creatorProfile, customerProfile, activeRole, roles, token, guestMode],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}