import axios from 'axios';
import { API_BASE_URL } from './config';

const authClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
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

export type RegisterBody = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  mobileNumber: number | string;
  address: string;
  role: 'BUYER' | 'SELLER' | 'USER';
};

export async function registerUser(body: RegisterBody) {
  const res = await authClient.post('/api/v1/users/register', body);
  return res.data;
}

export type LoginBody = {
  username: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  refreshExpiresIn?: number;
  roles: string[];
  userId: number;
  fingerprint?: string | null;
};

export async function loginUser(body: LoginBody): Promise<LoginResponse> {
  const res = await authClient.post<LoginResponse>('/jwt/login', body);
  return res.data;
}

export type RefreshRequest = {
  refreshToken: string;
  fingerprint?: string;
};

export type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn?: number;
  tokenType: 'Bearer';
  fingerprint?: string | null;
};

export async function refreshAuthTokens(body: RefreshRequest): Promise<RefreshResponse> {
  const res = await authClient.post<RefreshResponse>('/jwt/refresh', body);
  return res.data;
}

export type LogoutResponse = {
  code: string;
  message: string;
};

type LogoutOptions = {
  accessToken?: string | null;
  fingerprint?: string | null;
};

export async function logoutUser(options: LogoutOptions = {}): Promise<LogoutResponse> {
  const headers: Record<string, string> = {};

  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  if (options.fingerprint) {
    headers['X-Device-Fingerprint'] = options.fingerprint;
  }

  const res = await authClient.post<LogoutResponse>('/api/v1/auth/logout', undefined, {
    headers: Object.keys(headers).length > 0 ? headers : undefined,
  });
  return res.data;
}
