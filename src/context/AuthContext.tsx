import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LoginResponse, loginUser, logoutUser } from '../api/auth';
import api from '../api/client';
import {
  clearSession,
  getCachedSession,
  loadSession,
  onSessionChange,
  onUnauthorized,
  persistSession,
  PersistedSession,
} from '../utils/storage';

type AuthState = {
  isLoading: boolean;
  isSignedIn: boolean;
  accessToken: string | null;
  userId: number | null;
  sellerId: number | null;
  roles: string[];
};

type AuthContextType = AuthState & {
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INITIAL_STATE: AuthState = {
  isLoading: true,
  isSignedIn: false,
  accessToken: null,
  userId: null,
  sellerId: null,
  roles: [],
};

const sessionToState = (session: PersistedSession | null): AuthState => ({
  isLoading: false,
  isSignedIn: Boolean(session),
  accessToken: session?.accessToken ?? null,
  userId: session?.userId ?? null,
  sellerId: session?.sellerId ?? null,
  roles: session?.roles ?? [],
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(INITIAL_STATE);

  // Restore from storage on app start
  useEffect(() => {
    let isMounted = true;

    const applySession = (session: PersistedSession | null) => {
      if (!isMounted) {
        return;
      }
      setState(sessionToState(session));
    };

    const unsubscribeSession = onSessionChange(applySession);
    const unsubscribeUnauthorized = onUnauthorized(() => applySession(null));

    (async () => {
      const session = await loadSession();
      applySession(session);
    })();

    return () => {
      isMounted = false;
      unsubscribeSession();
      unsubscribeUnauthorized();
    };
  }, []);

  // Login
  const signIn = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const data: LoginResponse = await loginUser({ username: email, password });
      const accessExpiresAt =
        typeof data.expiresIn === 'number' && Number.isFinite(data.expiresIn)
          ? Date.now() + data.expiresIn * 1000
          : null;
      const refreshExpiresAt =
        typeof data.refreshExpiresIn === 'number' && Number.isFinite(data.refreshExpiresIn)
          ? Date.now() + data.refreshExpiresIn * 1000
          : null;

      let sellerId: number | null = null;
      try {
        const sellerRes = await api.get(`/api/v1/sellers/${data.userId}`, {
          headers: {
            Authorization: `Bearer ${data.accessToken}`,
          },
        });
        sellerId = sellerRes.data?.sellerId ?? null;
      } catch (error) {
        if (__DEV__) {
          console.warn('[Auth] Failed to resolve sellerId for user', error);
        }
      }

      await persistSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        accessExpiresAt,
        refreshExpiresAt,
        userId: data.userId,
        roles: data.roles,
        sellerId,
        fingerprint: data.fingerprint ?? null,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  // Logout
  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    const session = getCachedSession();
    const accessToken = session?.accessToken ?? null;
    const fingerprint = session?.fingerprint ?? null;

    try {
      await logoutUser({
        accessToken,
        fingerprint: fingerprint ?? undefined,
      });
    } catch (error) {
      if (__DEV__) {
        console.warn('[Auth] logout failed', error);
      }
      // ignore API failure, still clear local session
    }

    await clearSession();
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      signIn,
      signOut,
    }),
    [signIn, signOut, state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
