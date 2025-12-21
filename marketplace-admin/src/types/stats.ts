// 통계 관련 타입 정의

export interface SignupStatsResponse {
  message: string;
  response: {
    todaySignupCount: number;
    sevenDayChangeCount: number;
  };
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
