import axios from 'axios';
import { authUtils } from '../utils/auth';

const BASE_URL = 'https://marketplace.inuappcenter.kr/api';
//const BASE_URL = 'http://localhost:8080/api';


export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
apiClient.interceptors.request.use((config) => {
  const token = authUtils.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      authUtils.removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);