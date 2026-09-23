import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Role = 'customer' | 'seller';
export type AuthMethod = 'phone' | 'email' | 'google';

export interface User {
  id: string;
  identifier: string;
  method: AuthMethod;
  createdAt: number;
}

interface SignInParams {
  identifier: string;
  method: AuthMethod;
  mode: 'signin' | 'signup';
}

interface AuthContextValue {
  hydrated: boolean;
  user: User | null;
  activeRole: Role | null;
  roles: Role[];
  signIn: (params: SignInParams) => Promise<void>;
  chooseRole: (role: Role) => Promise<void>;
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

  useEffect(() => {
    (async () => {
      try {
        const [sessionRaw, rolesRaw, activeRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE.session),
          AsyncStorage.getItem(STORAGE.roles),
          AsyncStorage.getItem(STORAGE.activeRole),
        ]);

        if (sessionRaw) setUser(JSON.parse(sessionRaw));
        if (rolesRaw) setRoles(JSON.parse(rolesRaw));
        if (activeRaw === 'customer' || activeRaw === 'seller') setActiveRole(activeRaw);
      } catch {
        // Corrupt or missing storage — start fresh.
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

      async signIn({ identifier, method, mode }) {
        const nextUser: User = {
          id: `u_${Date.now().toString(36)}`,
          identifier,
          method,
          createdAt: Date.now(),
        };
        await AsyncStorage.setItem(STORAGE.session, JSON.stringify(nextUser));
        setUser(nextUser);

        if (mode === 'signup') {
          // A new account begins fresh — let them choose an experience.
          await Promise.all([
            AsyncStorage.removeItem(STORAGE.roles),
            AsyncStorage.removeItem(STORAGE.activeRole),
          ]);
          setRoles([]);
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

      async signOut() {
        await AsyncStorage.removeItem(STORAGE.session);
        setUser(null);
      },
    }),
    [hydrated, user, activeRole, roles],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}