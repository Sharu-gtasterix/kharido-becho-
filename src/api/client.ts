
import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PORT = 8087;

export const API_BASE_URL =
  Platform.OS === 'android'
    ? `http://10.0.2.2:${PORT}` // Android emulator // //10.0.2.2
    : `http://localhost:${PORT}`; // iOS simulator

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased to 30 seconds (from 15s)
  headers: {
    'Content-Type': 'application/json',
  },
  // Disable automatic transformations for better control
  transformRequest: [(data, headers) => {
    // Don't transform FormData
    if (data instanceof FormData) {
      return data;
    }
    // Transform JSON normally
    if (headers['Content-Type'] === 'application/json') {
      return JSON.stringify(data);
    }
    return data;
  }],
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('kb_access_token');
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('[AUTH] Token read error:', e);
    }

    if (__DEV__) {
      const method = config.method?.toUpperCase();
      const url = `${config.baseURL}${config.url}`;
      console.log(`[REQ] ${method} ${url}`);

      // Log headers for debugging (exclude sensitive data)
      if (config.headers['Content-Type'] === 'multipart/form-data') {
        console.log('[REQ] Uploading file(s)...');
      }
    }

    return config;
  },
  (error) => {
    console.error('[REQ ERROR]', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (res) => {
    if (__DEV__) {
      console.log(`[RES] ${res.status} ${res.config.url}`);
    }
    return res;
  },
  (err) => {
    const status = err?.response?.status;
    const url = err?.config?.url;
    const message = err?.response?.data?.message || err?.message;

    // Enhanced error logging
    if (__DEV__) {
      console.group(`[ERR] ${status || 'NO_STATUS'} ${url}`);
      console.log('Message:', message);
      console.log('Error Code:', err?.code);

      if (err?.response?.data) {
        console.log('Response Data:', err.response.data);
      }

      // Network errors
      if (err?.code === 'ECONNABORTED') {
        console.log('⚠️ Request timeout');
      } else if (err?.code === 'ERR_NETWORK') {
        console.log('⚠️ Network error - check connection');
      } else if (!err?.response) {
        console.log('⚠️ No response from server');
      }

      console.groupEnd();
    }

    // Enhanced error object for better handling
    const enhancedError = {
      ...err,
      isNetworkError: !err?.response && (
        err?.code === 'ERR_NETWORK' ||
        err?.code === 'ECONNABORTED' ||
        err?.message?.toLowerCase().includes('network')
      ),
      isTimeout: err?.code === 'ECONNABORTED',
      statusCode: status,
      errorMessage: message,
    };

    return Promise.reject(enhancedError);
  }
);

export default api;