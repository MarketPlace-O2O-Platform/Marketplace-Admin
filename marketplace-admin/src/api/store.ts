import { apiClient } from './config';
import type { StoreListResponse, StoreListParams, StoreDetailResponse } from '../types/store';

export const storeAPI = {
  getStores: async (params: StoreListParams = {}): Promise<StoreListResponse> => {
    const { pageSize = 30, cursor } = params;
    const queryParams = new URLSearchParams({
      pageSize: pageSize.toString()
    });

    if (cursor) {
      queryParams.append('lastPageIndex', cursor.toString());
    }

    const response = await apiClient.get<StoreListResponse>(
      `/admins/markets?${queryParams.toString()}`
    );
    return response.data;
  },

  getStoreById: async (marketId: number): Promise<StoreDetailResponse> => {
    const response = await apiClient.get<StoreDetailResponse>(
      `/admins/markets/${marketId}`
    );
    return response.data;
  }
};