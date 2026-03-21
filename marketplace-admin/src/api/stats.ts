import { apiClient } from './config';
import type {
  SignupStatsResponse,
  PaybackCouponStatsResponse,
  RecentPaybackCouponStatsResponse,
  DailySignupStatsResponse,
  TodayStatsResponse,
  VisitorCompareResponse,
  WeeklyAverageResponse,
  RecentVisitorsResponse,
  TopMarketsResponse,
} from '../types/stats';

export const statsAPI = {
  getSignupStats: async (): Promise<SignupStatsResponse> => {
    const response = await apiClient.get<SignupStatsResponse>('/admins/members/stats/signup');
    return response.data;
  },

  getPaybackCouponStats: async (): Promise<PaybackCouponStatsResponse> => {
    const response = await apiClient.get<PaybackCouponStatsResponse>('/admins/payback-coupons/stats');
    return response.data;
  },

  getRecentPaybackCouponStats: async (): Promise<RecentPaybackCouponStatsResponse> => {
    const response = await apiClient.get<RecentPaybackCouponStatsResponse>('/admins/payback-coupons/stats/recent');
    return response.data;
  },

  getDailySignupStats: async (): Promise<DailySignupStatsResponse> => {
    const response = await apiClient.get<DailySignupStatsResponse>('/admins/members/stats/signup/daily');
    return response.data;
  },

  getTodayStats: async (): Promise<TodayStatsResponse> => {
    const response = await apiClient.get<TodayStatsResponse>('/admins/stats/today');
    return response.data;
  },

  compareYesterday: async (): Promise<VisitorCompareResponse> => {
    const response = await apiClient.get<VisitorCompareResponse>('/admins/stats/compare/yesterday');
    return response.data;
  },

  getWeeklyAverage: async (): Promise<WeeklyAverageResponse> => {
    const response = await apiClient.get<WeeklyAverageResponse>('/admins/stats/weekly-average');
    return response.data;
  },

  getRecentVisitors: async (): Promise<RecentVisitorsResponse> => {
    const response = await apiClient.get<RecentVisitorsResponse>('/admins/stats/recent-visitors/7days');
    return response.data;
  },

  getTopMarkets: async (): Promise<TopMarketsResponse> => {
    const response = await apiClient.get<TopMarketsResponse>('/admins/payback-coupons/stats/top-markets');
    return response.data;
  },

  getTopMarketsCompleted: async (): Promise<TopMarketsResponse> => {
    const response = await apiClient.get<TopMarketsResponse>('/admins/payback-coupons/stats/top-markets/completed');
    return response.data;
  },
};
