export type CouponType = 'GIFT' | 'PAYBACK';

// 실제 API 응답 구조에 맞는 쿠폰 타입 (목록용)
export type CouponListItem = {
  couponId: number;
  couponName: string;
  couponDescription: string;
  deadLine: string;
  stock: number;
  isHidden: boolean;
  marketId: number;
  marketName: string;
};

// 쿠폰 상세 정보 타입 (제공된 DTO 기준)
export type Coupon = {
  couponId: number;
  couponName: string;
  couponDescription: string;
  deadLine: string;
  stock: number;
  isHidden: boolean;
  isAvailable: boolean;
  isMemberIssued: boolean;
  couponType: CouponType;
  marketId: number;
  marketName: string;
  address: string;
  thumbnail: string;
  couponCreatedAt: string;
  issuedCount: number;
};

export type CreateCouponRequest = {
  couponName: string;
  couponDescription: string;
  deadLine: string;
  stock: number;
  isHidden: boolean;
  isAvailable: boolean;
  isMemberIssued: boolean;
  couponType: CouponType;
  marketId: number;
};

export type UpdateCouponRequest = Partial<CreateCouponRequest>;

export type CouponResponse = {
  message: string;
  response: Coupon;
};

export type CouponListResponse = {
  message: string;
  response: {
    couponResDtos: CouponListItem[];
    hasNext: boolean;
  };
};

export type CouponListParams = {
  pageSize?: number;
  cursor?: number;
  couponType?: CouponType;
  marketId?: number;
};

// 환급쿠폰 목록 타입 (다른 응답 구조)
export type PaybackCouponListItem = {
  couponId: number;
  couponName: string;
  couponDescription: string;
  isHidden: boolean;
  isMemberIssued: boolean | null;
  couponType: CouponType;
};

// 환급쿠폰 목록 응답 타입
export type PaybackCouponListResponse = {
  message: string;
  response: {
    couponResDtos: PaybackCouponListItem[];
    hasNext: boolean;
  };
};

// 환급쿠폰 상세 타입
export type PaybackCoupon = {
  couponId: number;
  couponName: string;
  couponDescription: string;
  isHidden: boolean;
  isMemberIssued: boolean | null;
  couponType: CouponType;
  marketId: number;
  marketName: string;
};

// 환급쿠폰 상세 응답 타입
export type PaybackCouponResponse = {
  message: string;
  response: PaybackCoupon;
};

export const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  GIFT: '증정쿠폰',
  PAYBACK: '환급쿠폰'
};