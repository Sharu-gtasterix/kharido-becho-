import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './config';
import {
  ACCESS_TOKEN_REFRESH_WINDOW_MS,
  clearSession,
  isAccessTokenExpired,
  isRefreshTokenExpired,
  loadSession,
  PersistedSession,
  shouldRefreshAccessToken,
  TOKEN_EXPIRY_SKEW_MS,
  updateSession,
} from '../utils/storage';
import { refreshAuthTokens } from './auth';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30 seconds (from 15s)
  headers: {
    'Content-Type': 'application/json',
  },
  transformRequest: [
    (data, headers) => {
      if (data instanceof FormData) {
        return data;
      }
      if (headers && headers['Content-Type'] === 'application/json') {
        return JSON.stringify(data);
      }
      return data;
    },
  ],
});

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const isRefreshEndpoint = (url?: string | null) =>
  !!url && url.toLowerCase().includes('/jwt/refresh');

const canAttachAuth = (config: InternalAxiosRequestConfig) => {
  if (isRefreshEndpoint(config.url)) {
    return false;
  }
  if (config.headers && 'x-skip-authorization' in config.headers) {
    return false;
  }
  return true;
};

let refreshPromise: Promise<PersistedSession | null> | null = null;

const refreshSession = async (session: PersistedSession) => {
  if (isRefreshTokenExpired(session, TOKEN_EXPIRY_SKEW_MS)) {
    await clearSession({ emitUnauthorized: true });
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const response = await refreshAuthTokens({
          refreshToken: session.refreshToken,
          fingerprint: session.fingerprint ?? undefined,
        });

        const accessExpiresAt =
          typeof response.expiresIn === 'number' && Number.isFinite(response.expiresIn)
            ? Date.now() + response.expiresIn * 1000
            : null;

        const refreshExpiresAt =
          typeof response.refreshExpiresIn === 'number' &&
          Number.isFinite(response.refreshExpiresIn)
            ? Date.now() + response.refreshExpiresIn * 1000
            : session.refreshExpiresAt;

        const fingerprint =
          response.fingerprint !== undefined ? response.fingerprint : session.fingerprint ?? null;

        return (
          (await updateSession({
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            accessExpiresAt,
            refreshExpiresAt,
            fingerprint,
          })) ?? null
        );
      } catch (error) {
        await clearSession({ emitUnauthorized: true });
        throw error;
      } finally {
        refreshPromise = null;
      }
    })();
  }

  return refreshPromise;
};

const ensureActiveSession = async (): Promise<PersistedSession | null> => {
  let session = await loadSession();
  if (!session) {
    return null;
  }

  if (isRefreshTokenExpired(session, TOKEN_EXPIRY_SKEW_MS)) {
    await clearSession({ emitUnauthorized: true });
    return null;
  }

  if (isAccessTokenExpired(session, TOKEN_EXPIRY_SKEW_MS)) {
    try {
      session = await refreshSession(session);
    } catch (error) {
      if (__DEV__) {
        console.warn('[AUTH] Forced refresh failed', error);
      }
      return null;
    }
  } else if (shouldRefreshAccessToken(session, ACCESS_TOKEN_REFRESH_WINDOW_MS)) {
    try {
      const refreshed = await refreshSession(session);
      if (refreshed) {
        session = refreshed;
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('[AUTH] Preemptive refresh failed', error);
      }
    }
  }

  return session ?? null;
};

// Request interceptor - Add auth token and proactively refresh when needed
api.interceptors.request.use(
  async (config) => {
    if (canAttachAuth(config)) {
      const session = await ensureActiveSession();
      if (session?.accessToken) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
    }

    if (__DEV__) {
      const method = config.method?.toUpperCase();
      const url = `${config.baseURL ?? ''}${config.url ?? ''}`;
      console.log(`[REQ] ${method} ${url}`);

      if (config.headers?.['Content-Type'] === 'multipart/form-data') {
        console.log('[REQ] Uploading file(s)...');
      }
    }

    return config;
  },
  (error) => {
    console.error('[REQ ERROR]', (error as AxiosError)?.message);
    return Promise.reject(error);
  }
);

const shouldRetryRequest = (config: RetriableRequestConfig | undefined, status?: number) => {
  if (!config || config._retry) {
    return false;
  }

  if (!status || (status !== 401 && status !== 403)) {
    return false;
  }

  if (!canAttachAuth(config)) {
    return false;
  }

  if (isRefreshEndpoint(config.url)) {
    return false;
  }

  return true;
};

// Response interceptor - Handle errors and retry once on unauthorized responses
api.interceptors.response.use(
  (res) => {
    if (__DEV__) {
      console.log(`[RES] ${res.status} ${res.config.url}`);
    }
    return res;
  },
  async (err: AxiosError) => {
    const config = err.config as RetriableRequestConfig | undefined;
    const status = err?.response?.status;
    const url = config?.url;
    const message = err?.response?.data?.message || err?.message;

    if (shouldRetryRequest(config, status)) {
      config._retry = true;
      try {
        const baseSession = await loadSession();
        const refreshed = baseSession ? await refreshSession(baseSession) : null;
        if (refreshed?.accessToken) {
          config.headers = config.headers ?? {};
          config.headers.Authorization = `Bearer ${refreshed.accessToken}`;
          return api(config);
        }
      } catch (refreshError) {
        if (__DEV__) {
          console.warn('[AUTH] Refresh on 401 failed', refreshError);
        }
      }
    }

    if (status === 401 || status === 403) {
      await clearSession({ emitUnauthorized: true });
    }

    if (__DEV__) {
      console.group(`[ERR] ${status || 'NO_STATUS'} ${url}`);
      console.log('Message:', message);
      console.log('Error Code:', err?.code);

      if (err?.response?.data) {
        console.log('Response Data:', err.response.data);
      }

      if (err?.code === 'ECONNABORTED') {
        console.log('[TIMEOUT] Request timeout');
      } else if (err?.code === 'ERR_NETWORK') {
        console.log('[NETWORK] Network error - check connection');
      } else if (!err?.response) {
        console.log('[NO RESPONSE] No response from server');
      }

      console.groupEnd();
    }

    const enhancedError = {
      ...err,
      isNetworkError:
        !err?.response &&
        (err?.code === 'ERR_NETWORK' ||
          err?.code === 'ECONNABORTED' ||
          err?.message?.toLowerCase().includes('network')),
      isTimeout: err?.code === 'ECONNABORTED',
      statusCode: status,
      errorMessage: message,
    };

    return Promise.reject(enhancedError);
  }
);

export default api;
