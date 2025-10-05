// 카카오 지도 API 타입 정의
export interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  category_group_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
  place_url: string;
  distance: string;
}

export interface KakaoSearchStatus {
  OK: string;
  ZERO_RESULT: string;
  ERROR: string;
}

export interface KakaoPlaces {
  keywordSearch: (
    keyword: string,
    callback: (data: KakaoPlace[], status: string) => void
  ) => void;
}

export interface KakaoMaps {
  services: {
    Places: new () => KakaoPlaces;
    Status: KakaoSearchStatus;
  };
}

export interface KakaoGlobal {
  maps: KakaoMaps;
}

declare global {
  interface Window {
    kakao?: KakaoGlobal;
  }
}
