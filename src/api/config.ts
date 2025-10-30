import { Platform } from 'react-native';

const PORT = 8087;

export const API_BASE_URL =
  Platform.OS === 'android'
    ? `http://10.0.2.2:${PORT}`
    : `http://localhost:${PORT}`;
