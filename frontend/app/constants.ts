import { Platform } from 'react-native';

export const APP_NAME = 'IHRIS';

// =================================================================
//  API Configuration Switch
//  Set this to `true` to connect to the live Render backend.
//  Set this to `false` to connect to a local backend for development.
// =================================================================
const USE_PRODUCTION_API = true;

const PRODUCTION_API_URL = 'https://irhis-backend.onrender.com';
const LOCAL_API_URL = 'http://192.168.1.67:8000'; // Replace with your local machine's IP

export const API_URL = USE_PRODUCTION_API ? PRODUCTION_API_URL : LOCAL_API_URL;