import { apiClient } from './config';
import type { TempMarketListResponse, TempMarketListParams, TempMarketDetailResponse, CreateTempMarketRequest, UpdateTempMarketRequest } from '../types/store';

export const tempMarketAPI = {
  // 공감 매장 목록 조회
  getTempMarkets: async (params: TempMarketListParams = {}): Promise<TempMarketListResponse> => {
    const { page = 1, size = 50 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });

    const response = await apiClient.get<TempMarketListResponse>(
      `/admins/temp-markets?${queryParams.toString()}`
    );
    return response.data;
  },

  // 공감 매장 상세 조회
  getTempMarketById: async (tempMarketId: number): Promise<TempMarketDetailResponse> => {
    const response = await apiClient.get<TempMarketDetailResponse>(
      `/admins/temp-markets/${tempMarketId}`
    );
    return response.data;
  },

  // 공감 매장 생성
  createTempMarket: async (data: CreateTempMarketRequest): Promise<TempMarketDetailResponse> => {
    const formData = new FormData();

    // JSON 데이터를 jsonData로 추가
    const jsonData = {
      category: data.category,
      marketName: data.marketName,
      description: data.description,
      address: data.address
    };

    formData.append('jsonData', JSON.stringify(jsonData));

    // 이미지 파일 추가
    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await apiClient.post<TempMarketDetailResponse>(
      '/admins/temp-markets',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // 공감 매장 수정
  updateTempMarket: async (data: UpdateTempMarketRequest): Promise<TempMarketDetailResponse> => {
    const formData = new FormData();

    // JSON 데이터를 jsonData로 추가
    const jsonData = {
      category: data.category,
      marketName: data.marketName,
      description: data.description,
      address: data.address
    };

    formData.append('jsonData', JSON.stringify(jsonData));

    // 이미지 파일 추가
    if (data.file) {
      formData.append('file', data.file);
    }

    const response = await apiClient.put<TempMarketDetailResponse>(
      `/admins/temp-markets?marketId=${data.marketId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // 공감 매장 공개/숨김 처리
  toggleTempMarketHidden: async (tempMarketId: number): Promise<TempMarketDetailResponse> => {
    const response = await apiClient.put<TempMarketDetailResponse>(
      `/admins/temp-markets/hidden/${tempMarketId}`
    );
    return response.data;
  },

  // 공감 매장 삭제
  deleteTempMarket: async (tempMarketId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(
      `/admins/temp-markets/${tempMarketId}`
    );
    return response.data;
  }
};