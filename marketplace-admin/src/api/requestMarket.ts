import { apiClient } from './config';
import type { RequestMarketListResponse, RequestMarketListParams, EnrollRequestMarketResponse } from '../types/requestMarket';

export const requestMarketAPI = {
  getRequestMarkets: async (params: RequestMarketListParams = {}): Promise<RequestMarketListResponse> => {
    const { page = 1, size = 10 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });

    const response = await apiClient.get<RequestMarketListResponse>(
      `/request-markets?${queryParams.toString()}`
    );
    return response.data;
  },

  enrollRequestMarket: async (id: number): Promise<EnrollRequestMarketResponse> => {
    const response = await apiClient.patch<EnrollRequestMarketResponse>(
      `/request-markets/${id}/enroll`
    );
    return response.data;
  }
};
