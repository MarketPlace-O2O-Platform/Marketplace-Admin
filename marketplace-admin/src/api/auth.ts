import { apiClient } from './config';
import type { LoginRequest, LoginResponse } from '../types/auth';

export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/members', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    // 로그아웃 API가 있다면 여기서 호출
    // await apiClient.post('/auth/logout');
  }
};