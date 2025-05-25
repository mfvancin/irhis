import { Platform } from 'react-native';

export const APP_NAME = 'IHRIS';

const getBaseUrl = () => {
  if (__DEV__) {
    return 'http://192.168.1.165:8000';
  }
  return 'http://192.168.1.165:8000';
};

export const API_URL = `${getBaseUrl()}/api/v1`;