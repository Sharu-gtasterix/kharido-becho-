
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

const USER_ID_KEY = 'kb_user_id';
const ROLES_KEY = 'kb_roles';
const SELLER_ID_KEY = 'kb_seller_id';
const FINGERPRINT_KEY = 'kb_device_fingerprint';

const SESSION_DATA_KEYS = [USER_ID_KEY, ROLES_KEY, SELLER_ID_KEY, FINGERPRINT_KEY];

const KEYCHAIN_SERVICE = 'kb_session_tokens';
const KEYCHAIN_ACCOUNT = 'kb_session';
const FALLBACK_TOKENS_KEY = 'kb_session_tokens_fallback';

export const TOKEN_EXPIRY_SKEW_MS = 30_000; // fail-safe margin before declaring tokens expired
export const ACCESS_TOKEN_REFRESH_WINDOW_MS = 60_000; // proactive refresh threshold

type StoredTokens = {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: number | null;
  refreshExpiresAt: number | null;
};

export type PersistedSession = StoredTokens & {
  userId: number;
  roles: string[];
  sellerId: number | null;
  fingerprint?: string | null;
};

type SessionListener = (session: PersistedSession | null) => void;
type VoidListener = () => void;

let cachedSession: PersistedSession | null = null;
let isSessionLoaded = false;

const sessionListeners = new Set<SessionListener>();
const unauthorizedListeners = new Set<VoidListener>();

const sanitizeRoles = (roles: unknown): string[] => {
  if (!Array.isArray(roles)) {
    return [];
  }
  return roles.filter((role): role is string => typeof role === 'string' && role.length > 0);
};

const parseRoles = (raw: string | null | undefined) => {
  if (!raw) {
    return [];
  }
  try {
    return sanitizeRoles(JSON.parse(raw));
  } catch {
    return [];
  }
};

const normalizeOptionalString = (value: string | null | undefined) => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toNumber = (value: string | null) => {
  if (!value) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const readTokensFromSecureStorage = async (): Promise<StoredTokens | null> => {
  try {
    const credentials = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
    if (credentials) {
      return JSON.parse(credentials.password) as StoredTokens;
    }
  } catch (error) {
    if (__DEV__) {
      console.warn('[Auth] Failed to read tokens from Keychain', error);
    }
  }

  try {
    const fallbackRaw = await AsyncStorage.getItem(FALLBACK_TOKENS_KEY);
    return fallbackRaw ? (JSON.parse(fallbackRaw) as StoredTokens) : null;
  } catch (error) {
    if (__DEV__) {
      console.warn('[Auth] Failed to read tokens fallback', error);
    }
    return null;
  }
};

const writeTokensToSecureStorage = async (tokens: StoredTokens) => {
  try {
    await Keychain.setGenericPassword(KEYCHAIN_ACCOUNT, JSON.stringify(tokens), {
      service: KEYCHAIN_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    await AsyncStorage.removeItem(FALLBACK_TOKENS_KEY);
    return;
  } catch (error) {
    if (__DEV__) {
      console.warn('[Auth] Failed to persist tokens to Keychain, falling back to AsyncStorage', error);
    }
  }

  try {
    await AsyncStorage.setItem(FALLBACK_TOKENS_KEY, JSON.stringify(tokens));
  } catch (error) {
    if (__DEV__) {
      console.warn('[Auth] Failed to persist tokens fallback', error);
    }
    throw error;
  }
};

const resetSecureTokens = async () => {
  try {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
  } catch (error) {
    if (__DEV__) {
      console.warn('[Auth] Failed to clear Keychain tokens', error);
    }
  } finally {
    await AsyncStorage.removeItem(FALLBACK_TOKENS_KEY);
  }
};

const notifySessionChange = (session: PersistedSession | null) => {
  sessionListeners.forEach((listener) => {
    try {
      listener(session);
    } catch {
      // listeners guard their own failures
    }
  });
};

const notifyUnauthorized = () => {
  unauthorizedListeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // swallow listener errors
    }
  });
};

const buildSessionFromStorage = async (): Promise<PersistedSession | null> => {
  try {
    const [entries, tokens] = await Promise.all([
      AsyncStorage.multiGet(SESSION_DATA_KEYS),
      readTokensFromSecureStorage(),
    ]);

    if (!tokens) {
      return null;
    }

    const mapped = entries.reduce<Record<string, string | null>>((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

    const userId = toNumber(mapped[USER_ID_KEY] ?? null);
    if (userId === null) {
      return null;
    }

    return {
      ...tokens,
      userId,
      roles: parseRoles(mapped[ROLES_KEY]),
      sellerId: toNumber(mapped[SELLER_ID_KEY] ?? null),
      fingerprint: normalizeOptionalString(mapped[FINGERPRINT_KEY]),
    };
  } catch (error) {
    if (__DEV__) {
      console.warn('[Auth] Failed to rebuild session from storage', error);
    }
    return null;
  }
};

export const onSessionChange = (listener: SessionListener) => {
  sessionListeners.add(listener);
  return () => sessionListeners.delete(listener);
};

export const onUnauthorized = (listener: VoidListener) => {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
};

export const isAccessTokenExpired = (session: PersistedSession, skewMs = 0) => {
  if (session.accessExpiresAt === null) {
    return false;
  }
  return session.accessExpiresAt <= Date.now() + Math.max(0, skewMs);
};

export const isRefreshTokenExpired = (session: PersistedSession, skewMs = 0) => {
  if (session.refreshExpiresAt === null) {
    return false;
  }
  return session.refreshExpiresAt <= Date.now() + Math.max(0, skewMs);
};

export const shouldRefreshAccessToken = (session: PersistedSession, windowMs: number) => {
  if (session.accessExpiresAt === null) {
    return false;
  }
  return session.accessExpiresAt <= Date.now() + Math.max(windowMs, 0);
};

export const loadSession = async (): Promise<PersistedSession | null> => {
  if (isSessionLoaded) {
    return cachedSession;
  }

  const session = await buildSessionFromStorage();

  if (session && isRefreshTokenExpired(session)) {
    await clearSession({ emitUnauthorized: true });
    return null;
  }

  cachedSession = session;
  isSessionLoaded = true;
  return cachedSession;
};

export const getCachedSession = () => cachedSession;

export const persistSession = async (session: PersistedSession) => {
  const sanitizedRoles = sanitizeRoles(session.roles);

  cachedSession = {
    ...session,
    roles: sanitizedRoles,
  };
  isSessionLoaded = true;

  const tokens: StoredTokens = {
    accessToken: cachedSession.accessToken,
    refreshToken: cachedSession.refreshToken,
    accessExpiresAt: cachedSession.accessExpiresAt,
    refreshExpiresAt: cachedSession.refreshExpiresAt,
  };

  const dataEntries: [string, string][] = [
    [USER_ID_KEY, String(cachedSession.userId)],
    [ROLES_KEY, JSON.stringify(sanitizedRoles)],
    [SELLER_ID_KEY, cachedSession.sellerId !== null ? String(cachedSession.sellerId) : ''],
    [FINGERPRINT_KEY, cachedSession.fingerprint ?? ''],
  ];

  await Promise.all([writeTokensToSecureStorage(tokens), AsyncStorage.multiSet(dataEntries)]);
  notifySessionChange(cachedSession);
};

export const updateSession = async (patch: Partial<PersistedSession>) => {
  const current = await loadSession();
  if (!current) {
    return null;
  }

  const next: PersistedSession = {
    ...current,
    ...patch,
    roles: patch.roles ?? current.roles,
    sellerId: patch.sellerId ?? current.sellerId,
    fingerprint: patch.fingerprint ?? current.fingerprint,
    accessToken: patch.accessToken ?? current.accessToken,
    refreshToken: patch.refreshToken ?? current.refreshToken,
    accessExpiresAt: patch.accessExpiresAt ?? current.accessExpiresAt,
    refreshExpiresAt: patch.refreshExpiresAt ?? current.refreshExpiresAt,
  };

  await persistSession(next);
  return next;
};

type ClearSessionOptions = {
  emitUnauthorized?: boolean;
};

export const clearSession = async (options: ClearSessionOptions = {}) => {
  cachedSession = null;
  isSessionLoaded = true;

  await Promise.all([resetSecureTokens(), AsyncStorage.multiRemove(SESSION_DATA_KEYS)]);
  notifySessionChange(null);

  if (options.emitUnauthorized) {
    notifyUnauthorized();
  }
};
