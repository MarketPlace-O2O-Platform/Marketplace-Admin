import { apiClient } from './config';
import type { RequestMarketListResponse, RequestMarketListParams } from '../types/requestMarket';

export const requestMarketAPI = {
  getRequestMarkets: async (params: RequestMarketListParams = {}): Promise<RequestMarketListResponse> => {
    const { page = 1, size = 10 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });

    const response = await apiClient.get<RequestMarketListResponse>(
      `/api/request-markets?${queryParams.toString()}`
    );
    return response.data;
  }
};
