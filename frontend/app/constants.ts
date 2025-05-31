import { Platform } from 'react-native';

export const APP_NAME = 'IHRIS';

const getBaseUrl = () => {
  if (__DEV__) {
    return 'http://localhost:8000';
  }
  return 'http://localhost:8000';
};

export const API_URL = getBaseUrl();