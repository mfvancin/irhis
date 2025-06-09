import { Platform } from 'react-native';

export const APP_NAME = 'IHRIS';

const getBaseUrl = () => {
  // TODO: Consider making this configurable, e.g., via environment variables
  if (__DEV__) {
    // For development, use the local network IP of your backend server
    // This should be your local machine's IP where the backend is running
    return 'http://192.168.1.190:8000';
  }
  // For production, use the deployed Render URL
  // IMPORTANT: Replace this with your actual Render service URL
  return 'https://irhis-backend.onrender.com';
};

export const API_URL = getBaseUrl();