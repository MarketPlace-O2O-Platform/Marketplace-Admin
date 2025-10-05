export type StoreMajor =
  | 'FOOD'
  | 'DESSERT'
  | 'SPORT'
  | 'BEAUTY'
  | 'HOSPITAL'
  | 'EDUCATION'
  | 'ETC'
  | 'ALCOHOL'
  | 'KOREAN'
  | 'ASIAN'
  | 'JAPANESE'
  | 'AMERICAN';

export type CreateStoreRequest = {
  marketName: string;
  description: string;
  operationHours: string;
  closedDays: string;
  phoneNumber: string;
  address: string;
  major: StoreMajor;
  images: File[];
};

export type UpdateStoreRequest = {
  marketName: string;
  description: string;
  operationHours: string;
  closedDays: string;
  phoneNumber: string;
  address: string;
  major: StoreMajor;
};

export type Store = {
  marketId: number;
  marketName: string;
  marketDescription: string;
  address: string;
  thumbnail: string;
  isFavorite: boolean;
  isNewCoupon: boolean;
  major?: StoreMajor;
  pageIndex?: number;
  orderNo?: number;
};

// 상세보기용 이미지 타입
export type StoreImage = {
  imageId: number;
  sequence: number;
  name: string;
};

// 상세보기용 매장 타입
export type StoreDetail = {
  marketId: number;
  name: string;
  description: string;
  operationHours: string;
  closedDays: string;
  phoneNumber: string;
  address: string;
  major?: StoreMajor;
  imageResList: StoreImage[];
};

// 상세보기 API 응답 타입
export type StoreDetailResponse = {
  message: string;
  response: StoreDetail;
};

export type StoreListResponse = {
  message: string;
  response: {
    marketResDtos: Store[];
    hasNext: boolean;
  };
};

export type StoreListParams = {
  pageSize?: number;
  cursor?: number; // 실제로는 lastPageIndex로 전송됨 (마지막 매장의 marketId)
};

export type StoreOrderItem = {
  marketId: number;
  orderNo: number;
};

export type UpdateStoresOrderRequest = StoreOrderItem[];

export const STORE_MAJOR_LABELS: Record<StoreMajor, string> = {
  FOOD: '음식점',
  DESSERT: '디저트/카페',
  SPORT: '스포츠/레저',
  BEAUTY: '뷰티/미용',
  HOSPITAL: '병원/약국',
  EDUCATION: '교육/학습',
  ETC: '기타',
  ALCOHOL: '술집/주점',
  KOREAN: '한식',
  ASIAN: '아시안',
  JAPANESE: '일식',
  AMERICAN: '양식'
};