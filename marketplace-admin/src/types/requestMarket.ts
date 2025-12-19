// 요청 매장 관련 타입 정의

export interface RequestMarket {
  id: number;
  name: string;
  address: string;
  count: number;
}

export interface RequestMarketListParams {
  page?: number;
  size?: number;
}

export interface Sort {
  empty: boolean;
  sorted: boolean;
  unsorted: boolean;
}

export interface Pageable {
  sort: Sort;
  offset: number;
  paged: boolean;
  pageNumber: number;
  pageSize: number;
  unpaged: boolean;
}

export interface RequestMarketListResponse {
  message: string;
  response: {
    totalPages: number;
    totalElements: number;
    sort: Sort;
    first: boolean;
    last: boolean;
    size: number;
    content: RequestMarket[];
    number: number;
    numberOfElements: number;
    pageable: Pageable;
    empty: boolean;
  };
}
