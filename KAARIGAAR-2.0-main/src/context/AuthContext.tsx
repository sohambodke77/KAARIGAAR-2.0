import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Role = 'customer' | 'seller';
export type AuthMethod = 'phone' | 'email' | 'google';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  locality: string;
}

export interface User {
  id: string;
  identifier: string;
  method: AuthMethod;
  profile: UserProfile;
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
  signIn: (params: SignInParams) => Promise<void>;
  chooseRole: (role: Role) => Promise<void>;
  switchRole: (role: Role) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
}

const STORAGE = {
  session: '@kaarigaar/session',
  roles: '@kaarigaar/roles',
  activeRole: '@kaarigaar/activeRole',
} as const;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleTransitioning, setRoleTransitioning] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [sessionRaw, rolesRaw, activeRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE.session),
          AsyncStorage.getItem(STORAGE.roles),
          AsyncStorage.getItem(STORAGE.activeRole),
        ]);

        if (sessionRaw) {
          const parsedUser = JSON.parse(sessionRaw);
          if (!parsedUser.profile) {
            parsedUser.profile = {
              name: parsedUser.identifier || 'Sanket Joshi',
              email: parsedUser.identifier?.includes('@') ? parsedUser.identifier : 'sanket.crafts@gmail.com',
              phone: '+91 98220 45678',
              city: 'Pune',
              locality: 'Kothrud',
            };
          }
          setUser(parsedUser);
        }
        if (rolesRaw) setRoles(JSON.parse(rolesRaw));
        if (activeRaw === 'customer' || activeRaw === 'seller') setActiveRole(activeRaw);
      } catch {
        // Start fresh
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      hydrated,
      user,
      activeRole,
      roles,
      roleTransitioning,

      async signIn({ identifier, method, mode, fullName }) {
        const nextUser: User = {
          id: `u_${Date.now().toString(36)}`,
          identifier,
          method,
          profile: {
            name: fullName || (method === 'google' ? 'Sanket Joshi' : identifier.split('@')[0]),
            email: method === 'email' ? identifier : 'sanket.crafts@gmail.com',
            phone: '+91 98220 45678',
            city: 'Pune',
            locality: 'Kothrud',
          },
          createdAt: Date.now(),
        };
        await AsyncStorage.setItem(STORAGE.session, JSON.stringify(nextUser));
        setUser(nextUser);

        if (mode === 'signup') {
          await Promise.all([
            AsyncStorage.removeItem(STORAGE.roles),
            AsyncStorage.removeItem(STORAGE.activeRole),
          ]);
          setRoles([]);
          setActiveRole(null);
        } else {
          // Flow: Login -> Role Selection
          await AsyncStorage.removeItem(STORAGE.activeRole);
          setActiveRole(null);
        }
      },

      async chooseRole(role) {
        const nextRoles = roles.includes(role) ? roles : [...roles, role];
        await AsyncStorage.setItem(STORAGE.roles, JSON.stringify(nextRoles));
        await AsyncStorage.setItem(STORAGE.activeRole, role);
        setRoles(nextRoles);
        setActiveRole(role);
      },

      async switchRole(role) {
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

      async updateProfile(updates) {
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
        await Promise.all([
          AsyncStorage.removeItem(STORAGE.session),
          AsyncStorage.removeItem(STORAGE.activeRole),
        ]);
        setUser(null);
        setActiveRole(null);
      },
    }),
    [hydrated, user, activeRole, roles, roleTransitioning],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}