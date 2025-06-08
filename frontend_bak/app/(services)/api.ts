import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<T> = await apiClient(config);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('userProfile');
      }
      
      const errorMessage = error.response?.data?.detail || error.message;
      throw new Error(errorMessage);
    }
    throw error;
  }
};

export const api = {
  get: <T>(url: string, params?: any) => 
    apiRequest<T>({ method: 'GET', url, params }),
  
  post: <T>(url: string, data?: any) => 
    apiRequest<T>({ method: 'POST', url, data }),
  
  put: <T>(url: string, data?: any) => 
    apiRequest<T>({ method: 'PUT', url, data }),
  
  patch: <T>(url: string, data?: any) => 
    apiRequest<T>({ method: 'PATCH', url, data }),
  
  delete: <T>(url: string) => 
    apiRequest<T>({ method: 'DELETE', url }),
};

export default api;