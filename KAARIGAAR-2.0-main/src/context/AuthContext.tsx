import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  authService,
  type AuthUser,
  type DispatchedOtpNotification,
  type RegisterCustomerParams,
  type RegisterSellerParams,
  type SellerProfileData,
  type UserRole,
} from '../services/authService';

export type Role = UserRole;
export type AuthMethod = 'phone' | 'email' | 'google';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  locality: string;
  avatarUrl?: string;
}

export interface User {
  id: string;
  identifier: string;
  email: string;
  phone: string;
  method: AuthMethod;
  role: Role;
  roles: Role[];
  profile: UserProfile;
  sellerProfile?: SellerProfileData;
  isVerified: boolean;
  createdAt: number;
}

interface SignInParams {
  identifier: string;
  method: AuthMethod;
  mode: 'signin' | 'signup';
  fullName?: string;
}

interface AuthContextValue {
  hydrated: boolean;
  user: User | null;
  activeRole: Role | null;
  roles: Role[];
  roleTransitioning: boolean;
  pendingVerificationUser: AuthUser | null;
  lastDispatchedOtp: DispatchedOtpNotification | null;
  canAccessSellerFeatures: boolean;

  // Modern production authentication
  loginWithCredentials: (identifier: string, password: string) => Promise<{ success: boolean; user: AuthUser }>;
  registerCustomer: (params: RegisterCustomerParams) => Promise<{ user: AuthUser; otp: string }>;
  registerSeller: (params: RegisterSellerParams) => Promise<{ user: AuthUser; otp: string }>;
  verifyOtp: (code: string) => Promise<boolean>;
  resendOtp: () => Promise<string>;
  requestPasswordReset: (identifier: string) => Promise<{ otp: string; target: string }>;
  confirmPasswordReset: (identifier: string, otp: string, newPassword: string) => Promise<boolean>;
  cancelVerification: () => void;
  setPendingVerificationUser: (u: AuthUser | null) => void;

  // Role and Navigation
  chooseRole: (role: Role) => Promise<void>;
  switchRole: (role: Role) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;

  // Backward compatibility
  signIn: (params: SignInParams) => Promise<void>;
}

const STORAGE = {
  session: '@kaarigaar/session',
  roles: '@kaarigaar/roles',
  activeRole: '@kaarigaar/activeRole',
} as const;

function mapAuthUserToAppUser(authUser: AuthUser, method: AuthMethod = 'email'): User {
  return {
    id: authUser.id,
    identifier: authUser.email || authUser.phone,
    email: authUser.email,
    phone: authUser.phone,
    method,
    role: authUser.role,
    roles: authUser.roles || [authUser.role],
    profile: {
      name: authUser.fullName,
      email: authUser.email,
      phone: authUser.phone,
      city: authUser.customerProfile?.city || authUser.sellerProfile?.serviceArea || 'Pune',
      locality: authUser.customerProfile?.locality || 'Kothrud',
      avatarUrl: authUser.avatarUrl,
    },
    sellerProfile: authUser.sellerProfile,
    isVerified: authUser.isVerified,
    createdAt: authUser.createdAt,
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleTransitioning, setRoleTransitioning] = useState(false);
  const [pendingVerificationUser, setPendingVerificationUser] = useState<AuthUser | null>(null);
  const [lastDispatchedOtp, setLastDispatchedOtp] = useState<DispatchedOtpNotification | null>(null);

  // Initialize and hydrate database & session
  useEffect(() => {
    (async () => {
      try {
        await authService.init();

        const [sessionUser, activeRaw, savedRolesRaw, lastOtp] = await Promise.all([
          authService.getSession(),
          AsyncStorage.getItem(STORAGE.activeRole),
          AsyncStorage.getItem(STORAGE.roles),
          authService.getLastDispatchedOtp(),
        ]);

        if (sessionUser) {
          const mapped = mapAuthUserToAppUser(sessionUser);
          setUser(mapped);
          setRoles(mapped.roles);

          if (activeRaw === 'customer' || activeRaw === 'seller') {
            setActiveRole(activeRaw);
          } else {
            setActiveRole(mapped.role);
          }
        } else if (savedRolesRaw) {
          setRoles(JSON.parse(savedRolesRaw));
          if (activeRaw === 'customer' || activeRaw === 'seller') {
            setActiveRole(activeRaw);
          }
        }

        if (lastOtp) {
          setLastDispatchedOtp(lastOtp);
        }
      } catch (err) {
        console.warn('Auth initialization error:', err);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const canAccessSellerFeatures = useMemo(() => {
    if (!user) return false;
    return user.roles.includes('seller') || user.role === 'seller';
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      hydrated,
      user,
      activeRole,
      roles,
      roleTransitioning,
      pendingVerificationUser,
      lastDispatchedOtp,
      canAccessSellerFeatures,

      async loginWithCredentials(identifier: string, password: string) {
        const authUser = await authService.login(identifier, password);
        const mapped = mapAuthUserToAppUser(
          authUser,
          identifier.includes('@') ? 'email' : 'phone'
        );

        // If user is not verified, require verification
        if (!authUser.isVerified) {
          setPendingVerificationUser(authUser);
          const otp = await authService.resendOtp(authUser.id);
          const lastOtp = await authService.getLastDispatchedOtp();
          setLastDispatchedOtp(lastOtp);
          return { success: false, user: authUser };
        }

        setUser(mapped);
        setRoles(mapped.roles);
        const initialRole = mapped.role || (mapped.roles.includes('seller') ? 'seller' : 'customer');
        setActiveRole(initialRole);
        await Promise.all([
          AsyncStorage.setItem(STORAGE.activeRole, initialRole),
          AsyncStorage.setItem(STORAGE.roles, JSON.stringify(mapped.roles)),
        ]);

        return { success: true, user: authUser };
      },

      async registerCustomer(params: RegisterCustomerParams) {
        const { user: registeredUser, otp } = await authService.registerCustomer(params);
        setPendingVerificationUser(registeredUser);
        const lastOtp = await authService.getLastDispatchedOtp();
        setLastDispatchedOtp(lastOtp);
        return { user: registeredUser, otp };
      },

      async registerSeller(params: RegisterSellerParams) {
        const { user: registeredUser, otp } = await authService.registerSeller(params);
        setPendingVerificationUser(registeredUser);
        const lastOtp = await authService.getLastDispatchedOtp();
        setLastDispatchedOtp(lastOtp);
        return { user: registeredUser, otp };
      },

      async verifyOtp(code: string) {
        if (!pendingVerificationUser) {
          throw new Error('No registration or verification session in progress.');
        }

        const verifiedUser = await authService.verifyOtp(pendingVerificationUser.id, code);
        const mapped = mapAuthUserToAppUser(verifiedUser);
        setUser(mapped);
        setRoles(mapped.roles);
        setActiveRole(mapped.role);

        await Promise.all([
          AsyncStorage.setItem(STORAGE.activeRole, mapped.role),
          AsyncStorage.setItem(STORAGE.roles, JSON.stringify(mapped.roles)),
        ]);

        setPendingVerificationUser(null);
        return true;
      },

      async resendOtp() {
        if (!pendingVerificationUser) {
          throw new Error('No pending verification found.');
        }
        const newOtp = await authService.resendOtp(pendingVerificationUser.id);
        const lastOtp = await authService.getLastDispatchedOtp();
        setLastDispatchedOtp(lastOtp);
        return newOtp;
      },

      async requestPasswordReset(identifier: string) {
        const result = await authService.requestPasswordReset(identifier);
        const lastOtp = await authService.getLastDispatchedOtp();
        setLastDispatchedOtp(lastOtp);
        return { otp: result.otp, target: result.target };
      },

      async confirmPasswordReset(identifier: string, otp: string, newPassword: string) {
        await authService.confirmPasswordReset(identifier, otp, newPassword);
        return true;
      },

      cancelVerification() {
        setPendingVerificationUser(null);
      },

      setPendingVerificationUser(u) {
        setPendingVerificationUser(u);
      },

      async chooseRole(role: Role) {
        const nextRoles = roles.includes(role) ? roles : [...roles, role];
        await AsyncStorage.setItem(STORAGE.roles, JSON.stringify(nextRoles));
        await AsyncStorage.setItem(STORAGE.activeRole, role);
        setRoles(nextRoles);
        setActiveRole(role);
      },

      async switchRole(role: Role) {
        setRoleTransitioning(true);
        const nextRoles = roles.includes(role) ? roles : [...roles, role];
        await AsyncStorage.setItem(STORAGE.roles, JSON.stringify(nextRoles));
        await AsyncStorage.setItem(STORAGE.activeRole, role);
        setRoles(nextRoles);
        setActiveRole(role);
        setTimeout(() => {
          setRoleTransitioning(false);
        }, 350);
      },

      async updateProfile(updates: Partial<UserProfile>) {
        if (!user) return;
        const updatedUser: User = {
          ...user,
          profile: {
            ...user.profile,
            ...updates,
          },
        };
        await AsyncStorage.setItem(STORAGE.session, JSON.stringify(updatedUser));
        setUser(updatedUser);
      },

      async signOut() {
        await authService.clearSession();
        setUser(null);
        setActiveRole(null);
        setRoles([]);
        setPendingVerificationUser(null);
      },

      // Legacy fallback (e.g. for Google Auth or quick test)
      async signIn({ identifier, method, mode, fullName }) {
        let authUser = await authService.findUserByIdentifier(identifier);
        if (!authUser) {
          const isPhone = !identifier.includes('@');
          const cleanEmail = isPhone ? `${identifier}@kaarigaar.com` : identifier;
          const cleanPhone = isPhone ? identifier : '9822045678';
          const regResult = await authService.registerCustomer({
            fullName: fullName || (method === 'google' ? 'Google Artisan Member' : 'KARIGAAR Member'),
            email: cleanEmail,
            phone: cleanPhone,
            password: 'Password@123',
            termsConsent: true,
          });
          authUser = regResult.user;
          // Auto verify social
          await authService.verifyOtp(authUser.id, regResult.otp);
        }

        const mapped = mapAuthUserToAppUser(authUser, method);
        setUser(mapped);
        setRoles(mapped.roles);

        if (mode === 'signup') {
          await Promise.all([
            AsyncStorage.removeItem(STORAGE.roles),
            AsyncStorage.removeItem(STORAGE.activeRole),
          ]);
          setRoles([]);
          setActiveRole(null);
        } else {
          const preferredRole = mapped.role || 'customer';
          await AsyncStorage.setItem(STORAGE.activeRole, preferredRole);
          setActiveRole(preferredRole);
        }
      },
    }),
    [hydrated, user, activeRole, roles, roleTransitioning, pendingVerificationUser, lastDispatchedOtp, canAccessSellerFeatures],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}