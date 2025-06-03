import { Platform } from 'react-native';

export const APP_NAME = 'IHRIS';

const getBaseUrl = () => {
  // TODO: Consider making this configurable, e.g., via environment variables
  if (__DEV__) {
    // For development, use the local network IP of your backend server
    // Replace '192.168.0.43' with your actual backend server IP if it changes
    return 'http://192.168.0.43:8000';
  }
  // For production, you'll likely have a different URL
  return 'http://192.168.0.43:8000'; // Or your production API URL
};

export const API_URL = getBaseUrl();