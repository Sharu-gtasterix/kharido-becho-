import { Platform } from 'react-native';

const PORT = 8087;

export const API_BASE_URL =
  Platform.OS === 'android'
    ? `http://192.168.1.102:${PORT}`
    : `http://localhost:${PORT}`;
