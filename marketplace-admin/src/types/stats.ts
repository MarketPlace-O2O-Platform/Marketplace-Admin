// 통계 관련 타입 정의

export interface SignupStatsResponse {
  message: string;
  response: {
    totalMemberCount: number;
    todaySignupCount: number;
    sevenDayChangeCount: number;
  };
}

export interface TodayStats {
  date: string;
  uniqueVisitors: number;
  totalPageViews: number;
  newMemberSignups: number;
  couponDownloads: number;
  couponUsages: number;
  paybackDownloads: number;
}

export interface TodayStatsResponse {
  message: string;
  response: TodayStats;
}

export interface VisitorCompare {
  today: number;
  yesterday: number;
  difference: number;
  changeRate: number;
}

export interface VisitorCompareResponse {
  message: string;
  response: VisitorCompare;
}

export interface WeeklyAverageResponse {
  message: string;
  response: number;
}

export interface RecentVisitorsResponse {
  message: string;
  response: Record<string, number>;
}

export interface TopMarket {
  marketId: number;
  marketName: string;
  paybackCount: number;
}

export interface TopMarketsResponse {
  message: string;
  response: TopMarket[];
}

export interface PaybackCouponStatsResponse {
  message: string;
  response: {
    avgCouponDownloadPerMember: number;
    paybackRate: number;
  };
}

export interface RecentPaybackCouponStatsResponse {
  message: string;
  response: {
    recentSevenDaysMemberCount: number;
    avgPaybackCouponDownloadPerMember: number;
  };
}

export interface DailySignupStat {
  date: string;
  signupCount: number;
}

export interface DailySignupStatsResponse {
  message: string;
  response: {
    dailyStats: DailySignupStat[];
  };
}
