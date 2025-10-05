import { apiClient } from './config';
import type { StoreListResponse, StoreListParams, StoreDetailResponse, UpdateStoreRequest, CreateStoreRequest, UpdateStoresOrderRequest } from '../types/store';

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
  },

  createStore: async (data: CreateStoreRequest): Promise<StoreDetailResponse> => {
    const formData = new FormData();

    // JSON 데이터를 jsonData로 추가
    const jsonData = {
      marketName: data.marketName,
      description: data.description,
      operationHours: data.operationHours,
      closedDays: data.closedDays,
      phoneNumber: data.phoneNumber,
      address: data.address,
      major: data.major
    };

    formData.append('jsonData', JSON.stringify(jsonData));

    // 이미지 파일들 추가
    if (data.images && data.images.length > 0) {
      data.images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await apiClient.post<StoreDetailResponse>(
      '/admins/markets',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  updateStore: async (marketId: number, data: UpdateStoreRequest): Promise<StoreDetailResponse> => {
    const response = await apiClient.put<StoreDetailResponse>(
      `/admins/markets/${marketId}`,
      data
    );
    return response.data;
  },

  deleteStore: async (marketId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/admins/markets/${marketId}`
    );
    return response.data;
  },

  updateStoreImages: async (
    marketId: number,
    data: {
      deletedImageIds: number[];
      changedSequences: Record<string, number>;
      addedImageSequences: number[];
    },
    images: File[]
  ): Promise<StoreDetailResponse> => {
    const formData = new FormData();

    // JSON 데이터 추가
    formData.append('jsonData', JSON.stringify(data));

    // 이미지 파일들 추가
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('images', image);
      });
    }

    const response = await apiClient.put<StoreDetailResponse>(
      `/admins/markets/${marketId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  updateStoresOrder: async (data: UpdateStoresOrderRequest): Promise<{ message: string }> => {
    const response = await apiClient.patch<{ message: string }>(
      '/admins/markets/order',
      data
    );
    return response.data;
  }
};