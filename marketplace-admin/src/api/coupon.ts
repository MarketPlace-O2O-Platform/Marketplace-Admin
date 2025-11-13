import { apiClient } from './config';
import type {
  CouponResponse,
  CouponListResponse,
  CouponListParams,
  PaybackCouponListResponse,
  PaybackCouponResponse,
  CreateGiftCouponRequest,
  CreatePaybackCouponRequest,
  UpdateGiftCouponRequest,
  UpdatePaybackCouponRequest,
  PaybackReceiptListResponse,
  PaybackReceiptListParams,
  PaybackReceiptDetailResponse,
  PaybackCompleteResponse
} from '../types/coupon';

export const couponApi = {
  // 쿠폰 목록 조회 (전체)
  getCoupons: async (params: CouponListParams = {}): Promise<CouponListResponse> => {
    const { pageSize = 30, cursor, couponType, marketId } = params;
    const queryParams = new URLSearchParams();

    queryParams.append('pageSize', pageSize.toString());
    if (cursor) queryParams.append('cursor', cursor.toString());
    if (couponType) queryParams.append('couponType', couponType);
    if (marketId) queryParams.append('marketId', marketId.toString());

    const response = await apiClient.get(`/admins/coupons?${queryParams.toString()}`);
    return response.data;
  },

  // 특정 쿠폰 조회
  getCoupon: async (couponId: number): Promise<CouponResponse> => {
    const response = await apiClient.get(`/admins/coupons/${couponId}`);
    return response.data;
  },

  // 증정쿠폰 생성
  createGiftCoupon: async (marketId: number, data: CreateGiftCouponRequest): Promise<CouponResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('marketId', marketId.toString());

    const response = await apiClient.post(`/admins/coupons?${queryParams.toString()}`, data);
    return response.data;
  },

  // 환급쿠폰 생성
  createPaybackCoupon: async (marketId: number, data: CreatePaybackCouponRequest): Promise<PaybackCouponResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append('marketId', marketId.toString());

    const response = await apiClient.post(`/admins/coupons/payback?${queryParams.toString()}`, data);
    return response.data;
  },

  // 증정쿠폰 수정
  updateGiftCoupon: async (couponId: number, data: UpdateGiftCouponRequest): Promise<CouponResponse> => {
    const response = await apiClient.put(`/admins/coupons/${couponId}`, data);
    return response.data;
  },

  // 환급쿠폰 수정
  updatePaybackCoupon: async (couponId: number, data: UpdatePaybackCouponRequest): Promise<PaybackCouponResponse> => {
    const response = await apiClient.put(`/admins/coupons/payback/${couponId}`, data);
    return response.data;
  },

  // 쿠폰 삭제 (증정쿠폰)
  deleteCoupon: async (couponId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/admins/coupons/${couponId}`);
    return response.data;
  },

  // 환급쿠폰 삭제
  deletePaybackCoupon: async (couponId: number): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/admins/coupons/payback/${couponId}`);
    return response.data;
  },

  // 환급쿠폰 목록 조회
  getPaybackCoupons: async (params: CouponListParams = {}): Promise<PaybackCouponListResponse> => {
    const { pageSize = 30, cursor, marketId } = params;
    const queryParams = new URLSearchParams();

    queryParams.append('pageSize', pageSize.toString());
    if (cursor) queryParams.append('cursor', cursor.toString());
    if (marketId) queryParams.append('marketId', marketId.toString());

    const response = await apiClient.get(`/admins/coupons/payback?${queryParams.toString()}`);
    return response.data;
  },

  // 매장별 환급쿠폰 목록 조회
  getPaybackCouponsByMarket: async (marketId: number, params: Omit<CouponListParams, 'marketId'> = {}): Promise<PaybackCouponListResponse> => {
    return couponApi.getPaybackCoupons({ ...params, marketId });
  },

  // 환급쿠폰 상세 조회
  getPaybackCoupon: async (couponId: number): Promise<PaybackCouponResponse> => {
    const response = await apiClient.get(`/admins/coupons/payback/${couponId}`);
    return response.data;
  },

  // 증정쿠폰 일괄 삭제
  deleteCoupons: async (couponIds: number[]): Promise<{ message: string }> => {
    const response = await apiClient.delete('/admins/coupons/batch', {
      data: couponIds
    });
    return response.data;
  },

  // 환급쿠폰 일괄 삭제
  deletePaybackCoupons: async (couponIds: number[]): Promise<{ message: string }> => {
    const response = await apiClient.delete('/admins/coupons/payback/batch', {
      data: couponIds
    });
    return response.data;
  },

  // 증정쿠폰 숨김/공개 처리
  toggleGiftCouponVisibility: async (couponId: number): Promise<{ message: string }> => {
    const response = await apiClient.put(`/admins/coupons/${couponId}/hidden`);
    return response.data;
  },

  // 환급쿠폰 숨김/공개 처리
  togglePaybackCouponVisibility: async (couponId: number): Promise<{ message: string }> => {
    const response = await apiClient.put(`/admins/coupons/payback/${couponId}/hidden`);
    return response.data;
  },

  // 증정쿠폰 일괄 숨김/공개 처리
  batchToggleGiftCouponsVisibility: async (couponIds: number[]): Promise<{ message: string }> => {
    const promises = couponIds.map(id => couponApi.toggleGiftCouponVisibility(id));
    await Promise.all(promises);
    return { message: '일괄 처리가 완료되었습니다.' };
  },

  // 환급쿠폰 일괄 숨김/공개 처리
  batchTogglePaybackCouponsVisibility: async (couponIds: number[]): Promise<{ message: string }> => {
    const promises = couponIds.map(id => couponApi.togglePaybackCouponVisibility(id));
    await Promise.all(promises);
    return { message: '일괄 처리가 완료되었습니다.' };
  },

  // 환급 쿠폰 영수증 목록 조회
  getPaybackReceipts: async (params: PaybackReceiptListParams = {}): Promise<PaybackReceiptListResponse> => {
    const { pageSize = 30, lastMemberPaybackId, marketId } = params;
    const queryParams = new URLSearchParams();

    queryParams.append('pageSize', pageSize.toString());
    if (lastMemberPaybackId) queryParams.append('lastMemberPaybackId', lastMemberPaybackId.toString());
    if (marketId) queryParams.append('marketId', marketId.toString());

    const response = await apiClient.get(`/admins/payback-coupons/receipts?${queryParams.toString()}`);
    return response.data;
  },

  // 환급 쿠폰 영수증 상세 조회
  getPaybackReceiptDetail: async (memberPaybackId: number): Promise<PaybackReceiptDetailResponse> => {
    const response = await apiClient.get(`/admins/payback-coupons/receipts/${memberPaybackId}`);
    return response.data;
  },

  // 환급 처리 완료
  completePayback: async (memberPaybackId: number): Promise<PaybackCompleteResponse> => {
    const response = await apiClient.put(`/admins/payback-coupons/complete/${memberPaybackId}`);
    return response.data;
  }
};