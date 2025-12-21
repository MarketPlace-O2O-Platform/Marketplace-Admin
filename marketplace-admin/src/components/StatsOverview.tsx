import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { statsAPI } from '../api/stats';
import type { DailySignupStat } from '../types/stats';
import './StatsOverview.css';

const StatsOverview: React.FC = () => {
  const [signupStats, setSignupStats] = useState<{ todaySignupCount: number; sevenDayChangeCount: number } | null>(null);
  const [paybackStats, setPaybackStats] = useState<{ avgCouponDownloadPerMember: number; paybackRate: number } | null>(null);
  const [recentPaybackStats, setRecentPaybackStats] = useState<{ recentSevenDaysMemberCount: number; avgPaybackCouponDownloadPerMember: number } | null>(null);
  const [dailyStats, setDailyStats] = useState<DailySignupStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    try {
      setLoading(true);
      const [signupRes, paybackRes, recentPaybackRes, dailyRes] = await Promise.all([
        statsAPI.getSignupStats(),
        statsAPI.getPaybackCouponStats(),
        statsAPI.getRecentPaybackCouponStats(),
        statsAPI.getDailySignupStats()
      ]);

      setSignupStats(signupRes.response);
      setPaybackStats(paybackRes.response);
      setRecentPaybackStats(recentPaybackRes.response);
      setDailyStats(dailyRes.response.dailyStats);
      setError('');
    } catch (err: any) {
      setError('통계 데이터를 불러오는데 실패했습니다.');
      console.error('통계 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="stats-overview loading-state">
        <p>통계를 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-overview error-state">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="stats-overview">
      <div className="stats-cards">
        <div className="stat-card stat-card--primary">
          <div className="stat-header">
            <h3 className="stat-label">오늘 가입자</h3>
            <div className="stat-icon-box stat-icon-box--primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>
          <div className="stat-content">
            <p className="stat-value">{signupStats?.todaySignupCount ?? 0}<span className="stat-unit">명</span></p>
            <p className="stat-description">최근 7일 <strong>{signupStats?.sevenDayChangeCount ?? 0}명</strong></p>
          </div>
        </div>

        <div className="stat-card stat-card--info">
          <div className="stat-header">
            <h3 className="stat-label">7일 평균 환급 쿠폰</h3>
            <div className="stat-icon-box stat-icon-box--info">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
          </div>
          <div className="stat-content">
            <p className="stat-value">{recentPaybackStats?.avgPaybackCouponDownloadPerMember.toFixed(1) ?? 0}<span className="stat-unit">개</span></p>
            <p className="stat-description">가입자 <strong>{recentPaybackStats?.recentSevenDaysMemberCount ?? 0}명</strong> 기준</p>
          </div>
        </div>

        <div className="stat-card stat-card--success">
          <div className="stat-header">
            <h3 className="stat-label">평균 쿠폰 다운로드</h3>
            <div className="stat-icon-box stat-icon-box--success">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
          </div>
          <div className="stat-content">
            <p className="stat-value">{paybackStats?.avgCouponDownloadPerMember.toFixed(1) ?? 0}<span className="stat-unit">개</span></p>
            <p className="stat-description">회원당 평균</p>
          </div>
        </div>

        <div className="stat-card stat-card--warning">
          <div className="stat-header">
            <h3 className="stat-label">환급률</h3>
            <div className="stat-icon-box stat-icon-box--warning">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            </div>
          </div>
          <div className="stat-content">
            <p className="stat-value">{paybackStats?.paybackRate.toFixed(1) ?? 0}<span className="stat-unit">%</span></p>
            <p className="stat-description">전체 쿠폰 대비</p>
          </div>
        </div>
      </div>

      <div className="stats-chart-container">
        <h3 className="chart-title">일별 가입자 추이 (최근 8일)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="date"
              stroke="#666"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              stroke="#666"
              tick={{ fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '8px 12px'
              }}
              labelFormatter={(value) => `날짜: ${value}`}
              formatter={(value) => [`${value ?? 0}명`, '가입자']}
            />
            <Line
              type="monotone"
              dataKey="signupCount"
              stroke="#007bff"
              strokeWidth={2}
              dot={{ fill: '#007bff', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsOverview;
