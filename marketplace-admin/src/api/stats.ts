import { apiClient } from './config';
import type { SignupStatsResponse, PaybackCouponStatsResponse, RecentPaybackCouponStatsResponse, DailySignupStatsResponse } from '../types/stats';

export const statsAPI = {
  getSignupStats: async (): Promise<SignupStatsResponse> => {
    const response = await apiClient.get<SignupStatsResponse>(
      '/admins/members/stats/signup'
    );
    return response.data;
  },

  getPaybackCouponStats: async (): Promise<PaybackCouponStatsResponse> => {
    const response = await apiClient.get<PaybackCouponStatsResponse>(
      '/admins/payback-coupons/stats'
    );
    return response.data;
  },

  getRecentPaybackCouponStats: async (): Promise<RecentPaybackCouponStatsResponse> => {
    const response = await apiClient.get<RecentPaybackCouponStatsResponse>(
      '/admins/payback-coupons/stats/recent'
    );
    return response.data;
  },

  getDailySignupStats: async (): Promise<DailySignupStatsResponse> => {
    const response = await apiClient.get<DailySignupStatsResponse>(
      '/admins/members/stats/signup/daily'
    );
    return response.data;
  }
};
