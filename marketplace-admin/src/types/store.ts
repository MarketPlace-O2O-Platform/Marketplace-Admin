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

// 공감 매장 타입
export type TempMarket = {
  marketId: number;
  marketName: string;
  description: string;
  address: string;
  thumbnail: string;
  cheerCount: number;
  isHidden: boolean;
  category?: string; // 선택 사항
};

// 공감 매장 목록 응답 타입
export type TempMarketListResponse = {
  message: string;
  response: {
    content: TempMarket[];
    page: {
      size: number;
      number: number;
      totalElements: number;
      totalPages: number;
    };
  };
};

// 공감 매장 목록 조회 파라미터
export type TempMarketListParams = {
  page?: number;
  size?: number;
};

// 공감 매장 상세 응답 타입
export type TempMarketDetailResponse = {
  message: string;
  response: TempMarket;
};

// 공감 매장 생성 요청 타입
export type CreateTempMarketRequest = {
  category: string;
  marketName: string;
  description: string;
  address: string;
  file?: File;
};

// 공감 매장 수정 요청 타입
export type UpdateTempMarketRequest = {
  marketId: number;
  category: string;
  marketName: string;
  description: string;
  address: string;
  file?: File;
};