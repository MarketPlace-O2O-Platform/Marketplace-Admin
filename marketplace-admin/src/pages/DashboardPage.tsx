import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area
} from 'recharts';
import { statsAPI } from '../api/stats';
import type { TodayStats, VisitorCompare, TopMarket, DailySignupStat } from '../types/stats';
import './DashboardPage.css';

interface TopReceiptMember {
  memberId: number;
  receiptCount: number;
  completedCount: number;
  pendingCount: number;
}

interface BreakdownStat {
  label: string;
  count: number;
}

interface ReceiptSubmissionStats {
  startDate: string;
  endDate: string;
  totalCount: number;
  breakdown: BreakdownStat[];
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [todayStats, setTodayStats] = useState<TodayStats | null>(null);
  const [visitorCompare, setVisitorCompare] = useState<VisitorCompare | null>(null);
  const [weeklyAverage, setWeeklyAverage] = useState<number | null>(null);
  const [recentVisitors, setRecentVisitors] = useState<{ date: string; visitors: number }[]>([]);
  const [signupStats, setSignupStats] = useState<{ totalMemberCount: number; todaySignupCount: number; sevenDayChangeCount: number } | null>(null);
  const [dailySignups, setDailySignups] = useState<DailySignupStat[]>([]);
  const [paybackStats, setPaybackStats] = useState<{ avgCouponDownloadPerMember: number; paybackRate: number } | null>(null);
  const [recentPaybackStats, setRecentPaybackStats] = useState<{ recentSevenDaysMemberCount: number; avgPaybackCouponDownloadPerMember: number } | null>(null);
  const [topMarkets, setTopMarkets] = useState<TopMarket[]>([]);
  const [topMarketsPeriod, setTopMarketsPeriod] = useState<string>('WEEK');
  const [topMarketsCompleted, setTopMarketsCompleted] = useState<TopMarket[]>([]);
  const [topMarketsCompletedPeriod, setTopMarketsCompletedPeriod] = useState<string>('WEEK');
  const [topReceiptMembers, setTopReceiptMembers] = useState<TopReceiptMember[]>([]);
  const [receiptPeriod, setReceiptPeriod] = useState<string>('WEEK'); // 기본값 WEEK
  const [receiptSubmissionStats, setReceiptSubmissionStats] = useState<ReceiptSubmissionStats | null>(null);
  const [receiptSubmissionPeriod, setReceiptSubmissionPeriod] = useState<string>('7D');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAllStats();
    loadTopMarkets(topMarketsPeriod);
    loadTopMarketsCompleted(topMarketsCompletedPeriod);
    loadTopReceiptMembers(receiptPeriod);
    loadReceiptSubmissionStats('7D');
  }, []);

  const loadAllStats = async () => {
    try {
      setLoading(true);
      const [
        todayRes, compareRes, weeklyRes, recentVisitorsRes,
        signupRes, dailySignupRes,
        paybackRes, recentPaybackRes,
      ] = await Promise.all([
        statsAPI.getTodayStats(),
        statsAPI.compareYesterday(),
        statsAPI.getWeeklyAverage(),
        statsAPI.getRecentVisitors(),
        statsAPI.getSignupStats(),
        statsAPI.getDailySignupStats(),
        statsAPI.getPaybackCouponStats(),
        statsAPI.getRecentPaybackCouponStats(),
      ]);

      setTodayStats(todayRes.response);
      setVisitorCompare(compareRes.response);
      setWeeklyAverage(weeklyRes.response);
      setRecentVisitors(
        Object.entries(recentVisitorsRes.response)
          .map(([date, visitors]) => ({ date, visitors: visitors as number }))
          .sort((a, b) => a.date.localeCompare(b.date))
      );
      setSignupStats(signupRes.response);
      setDailySignups(dailySignupRes.response.dailyStats);
      setPaybackStats(paybackRes.response);
      setRecentPaybackStats(recentPaybackRes.response);
      setError('');
    } catch (err) {
      setError('통계 데이터를 불러오는데 실패했습니다.');
      console.error('통계 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTopMarkets = async (period: string) => {
    try {
      const token = localStorage.getItem('marketplace_admin_token');
      const query = period ? `?period=${period}` : '';
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://marketplace.inuappcenter.kr'}/api/admins/payback-coupons/stats/top-markets${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTopMarkets(data.response || []);
    } catch (err) {
      console.error('환급 쿠폰 발급 매장 로드 실패:', err);
    }
  };

  const handleTopMarketsPeriodChange = (period: string) => {
    setTopMarketsPeriod(period);
    loadTopMarkets(period);
  };

  const loadTopMarketsCompleted = async (period: string) => {
    try {
      const token = localStorage.getItem('marketplace_admin_token');
      const query = period ? `?period=${period}` : '';
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://marketplace.inuappcenter.kr'}/api/admins/payback-coupons/stats/top-markets/completed${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTopMarketsCompleted(data.response || []);
    } catch (err) {
      console.error('환급 완료 매장 로드 실패:', err);
    }
  };

  const handleTopMarketsCompletedPeriodChange = (period: string) => {
    setTopMarketsCompletedPeriod(period);
    loadTopMarketsCompleted(period);
  };

  const loadTopReceiptMembers = async (period: string) => {
    try {
      const token = localStorage.getItem('marketplace_admin_token');
      const query = period ? `?period=${period}` : '';
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://marketplace.inuappcenter.kr'}/api/admins/payback-coupons/stats/top-members/receipt${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTopReceiptMembers(data.response);
    } catch (err) {
      console.error('영수증 우수 회원 로드 실패:', err);
    }
  };

  const handlePeriodChange = (period: string) => {
    setReceiptPeriod(period);
    loadTopReceiptMembers(period);
  };

  const loadReceiptSubmissionStats = async (period: string, start?: string, end?: string) => {
    try {
      const token = localStorage.getItem('marketplace_admin_token');
      let query = '';

      if (start && end) {
        query = `?startDate=${start}&endDate=${end}`;
      } else {
        query = `?period=${period}`;
      }

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://marketplace.inuappcenter.kr'}/api/admins/payback-coupons/stats/receipt-submissions${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setReceiptSubmissionStats(data.response);
    } catch (err) {
      console.error('영수증 제출 통계 로드 실패:', err);
    }
  };

  const handleReceiptSubmissionPeriodChange = (period: string) => {
    setReceiptSubmissionPeriod(period);
    setCustomStartDate('');
    setCustomEndDate('');
    loadReceiptSubmissionStats(period);
  };

  const handleCustomDateSearch = () => {
    if (!customStartDate || !customEndDate) {
      alert('시작일과 종료일을 모두 선택해주세요.');
      return;
    }
    if (customStartDate > customEndDate) {
      alert('종료일은 시작일보다 빠를 수 없습니다.');
      return;
    }
    setReceiptSubmissionPeriod('CUSTOM');
    loadReceiptSubmissionStats('', customStartDate, customEndDate);
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const renderTrend = (value: number | undefined, suffix: string = '') => {
    if (value === undefined || value === null) return <span className="trend-box trend-neutral">-</span>;
    if (value > 0) {
      return <span className="trend-box trend-positive">▲ {value.toFixed(1)}% {suffix}</span>;
    }
    if (value < 0) {
      return <span className="trend-box trend-negative">▼ {Math.abs(value).toFixed(1)}% {suffix}</span>;
    }
    return <span className="trend-box trend-neutral">— 0%</span>;
  };

  if (loading) {
    return (
      <Layout>
        <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="dashboard-container">
          <div className="dashboard-error">
            <h3>데이터 로드 실패</h3>
            <p>{error}</p>
            <button onClick={loadAllStats} className="btn btn-primary">다시 시도</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1 className="dashboard-title">대시보드</h1>
          <p className="dashboard-subtitle">오늘의 주요 지표와 트렌드를 확인하세요. (최종 업데이트: {new Date().toLocaleString()})</p>
        </header>

        {/* Top KPI Cards */}
        <div className="grid-4">
          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">총 회원수</h3>
              <div className="icon-box">👥</div>
            </div>
            <p className="metric-value">{signupStats?.totalMemberCount.toLocaleString() ?? 0}</p>
            <div className="metric-sub">
              {signupStats && signupStats.sevenDayChangeCount > 0 ? (
                <span style={{color: '#059669'}}>+{signupStats.sevenDayChangeCount}</span>
              ) : (
                <span>{signupStats?.sevenDayChangeCount ?? 0}</span>
              )}
              <span>지난 7일간</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">오늘 방문자</h3>
              <div className="icon-box">📉</div>
            </div>
            <p className="metric-value">{todayStats?.uniqueVisitors.toLocaleString() ?? 0}</p>
            <div className="metric-sub">
              {renderTrend(visitorCompare?.changeRate)}
              <span>전일 대비</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">오늘 신규 가입</h3>
              <div className="icon-box">✨</div>
            </div>
            <p className="metric-value">{signupStats?.todaySignupCount.toLocaleString() ?? 0}</p>
            <div className="metric-sub">
              <span>오늘 가입한 회원</span>
            </div>
          </div>

          <div className="dashboard-card">
            <div className="card-header">
              <h3 className="card-title">오늘 쿠폰 현황</h3>
              <div className="icon-box">🎫</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <p className="metric-value">{todayStats?.paybackDownloads.toLocaleString() ?? 0}</p>
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>다운</span>
            </div>
            <div className="metric-sub">
              <span style={{ color: '#059669', fontWeight: 600 }}>영수증 제출 {(todayStats as any)?.receiptSubmissions?.toLocaleString() ?? 0}건</span>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}> (실사용)</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid-2">
          <div className="dashboard-card">
            <h3 className="section-title">주간 방문자 추이</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={recentVisitors} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 12}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 12}}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                    cursor={{stroke: '#e5e7eb'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorVisitors)" 
                    name="방문자 수"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dashboard-card">
            <h3 className="section-title">일별 신규 가입자</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={dailySignups} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 12}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 12}}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                    cursor={{fill: '#f3f4f6'}}
                  />
                  <Bar 
                    dataKey="signupCount" 
                    fill="#10b981" 
                    radius={[4, 4, 0, 0]}
                    name="가입자 수"
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
        </div>
      </div>

      <div className="dashboard-card">
        <div className="card-header">
          <h3 className="section-title">영수증 제출 추이</h3>
          <div className="card-header-actions" style={{ flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <div className="period-selector">
              <button 
                className={`btn-period ${receiptSubmissionPeriod === '7D' ? 'active' : ''}`}
                onClick={() => handleReceiptSubmissionPeriodChange('7D')}
              >
                7일
              </button>
              <button 
                className={`btn-period ${receiptSubmissionPeriod === '1M' ? 'active' : ''}`}
                onClick={() => handleReceiptSubmissionPeriodChange('1M')}
              >
                1달
              </button>
              <button 
                className={`btn-period ${receiptSubmissionPeriod === '3M' ? 'active' : ''}`}
                onClick={() => handleReceiptSubmissionPeriodChange('3M')}
              >
                3달
              </button>
            </div>
            <div className="date-input-group">
              <input 
                type="date" 
                className="date-input"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
              <span style={{ color: '#6b7280', fontSize: '12px' }}>~</span>
              <input 
                type="date" 
                className="date-input"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
              <button className="btn-period active" onClick={handleCustomDateSearch} style={{ border: '1px solid #e5e7eb' }}>조회</button>
            </div>
          </div>
        </div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={receiptSubmissionStats?.breakdown || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9ca3af', fontSize: 12}}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#9ca3af', fontSize: 12}}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
                cursor={{fill: '#f3f4f6'}}
              />
              <Bar 
                dataKey="count" 
                fill="#8b5cf6" 
                radius={[4, 4, 0, 0]}
                name="제출 수"
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid-4">
          <div className="dashboard-card">
            <h3 className="card-title">주간 평균 방문</h3>
            <p className="metric-value large">{weeklyAverage?.toFixed(0) ?? 0}명</p>
          </div>
          <div className="dashboard-card">
            <h3 className="card-title">환급 완료율</h3>
            <p className="metric-value large">{paybackStats?.paybackRate.toFixed(1) ?? 0}%</p>
            <div className="progress-bg">
              <div className="progress-fill" style={{width: `${paybackStats?.paybackRate ?? 0}%`}}></div>
            </div>
          </div>
          <div className="dashboard-card">
            <h3 className="card-title">인당 평균 다운로드</h3>
            <p className="metric-value large">{paybackStats?.avgCouponDownloadPerMember.toFixed(1) ?? 0}개</p>
          </div>
          <div className="dashboard-card">
            <h3 className="card-title">최근 가입자 활동성</h3>
            <p className="metric-value large">{recentPaybackStats?.avgPaybackCouponDownloadPerMember.toFixed(1) ?? 0}개</p>
            <div className="metric-sub">
              <span>최근 7일 가입자 평균 다운</span>
            </div>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid-2" style={{ marginBottom: 0 }}>
          <div className="dashboard-card">
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <h3 className="section-title">🏆 환급 쿠폰 발급 전체</h3>
              <div className="card-header-actions" style={{ gap: '12px' }}>
                <div className="period-selector">
                  <button 
                    className={`btn-period ${topMarketsPeriod === 'DAY' ? 'active' : ''}`}
                    onClick={() => handleTopMarketsPeriodChange('DAY')}
                  >
                    1일
                  </button>
                  <button 
                    className={`btn-period ${topMarketsPeriod === 'WEEK' ? 'active' : ''}`}
                    onClick={() => handleTopMarketsPeriodChange('WEEK')}
                  >
                    1주
                  </button>
                  <button 
                    className={`btn-period ${topMarketsPeriod === 'MONTH' ? 'active' : ''}`}
                    onClick={() => handleTopMarketsPeriodChange('MONTH')}
                  >
                    1달
                  </button>
                  <button 
                    className={`btn-period ${topMarketsPeriod === '' ? 'active' : ''}`}
                    onClick={() => handleTopMarketsPeriodChange('')}
                  >
                    전체
                  </button>
                </div>
                <button
                  onClick={() => navigate('/top-markets-issued')}
                  className="btn-more"
                >
                  더보기 →
                </button>
              </div>
            </div>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th className="dashboard-th">순위</th>
                  <th className="dashboard-th">매장명</th>
                  <th className="dashboard-th text-right">발급 수</th>
                </tr>
              </thead>
              <tbody>
                {topMarkets.slice(0, 5).map((market, index) => (
                  <tr key={market.marketId}>
                    <td className="dashboard-td">
                      <span className="rank-badge">{index + 1}</span>
                    </td>
                    <td className="dashboard-td font-medium">{market.marketName}</td>
                    <td className="dashboard-td text-right font-semibold">{market.paybackCount}건</td>
                  </tr>
                ))}
                {topMarkets.length === 0 && (
                  <tr>
                    <td colSpan={3} className="dashboard-td text-center text-gray">데이터가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="dashboard-card">
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <h3 className="section-title">💰 환급 완료 매장 전체</h3>
              <div className="card-header-actions" style={{ gap: '12px' }}>
                <div className="period-selector">
                  <button 
                    className={`btn-period ${topMarketsCompletedPeriod === 'DAY' ? 'active' : ''}`}
                    onClick={() => handleTopMarketsCompletedPeriodChange('DAY')}
                  >
                    1일
                  </button>
                  <button 
                    className={`btn-period ${topMarketsCompletedPeriod === 'WEEK' ? 'active' : ''}`}
                    onClick={() => handleTopMarketsCompletedPeriodChange('WEEK')}
                  >
                    1주
                  </button>
                  <button 
                    className={`btn-period ${topMarketsCompletedPeriod === 'MONTH' ? 'active' : ''}`}
                    onClick={() => handleTopMarketsCompletedPeriodChange('MONTH')}
                  >
                    1달
                  </button>
                  <button 
                    className={`btn-period ${topMarketsCompletedPeriod === '' ? 'active' : ''}`}
                    onClick={() => handleTopMarketsCompletedPeriodChange('')}
                  >
                    전체
                  </button>
                </div>
                <button
                  onClick={() => navigate('/top-markets-issued')}
                  className="btn-more"
                >
                  더보기 →
                </button>
              </div>
            </div>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th className="dashboard-th">순위</th>
                  <th className="dashboard-th">매장명</th>
                  <th className="dashboard-th text-right">완료 수</th>
                </tr>
              </thead>
              <tbody>
                {topMarketsCompleted.slice(0, 5).map((market, index) => (
                  <tr key={market.marketId}>
                    <td className="dashboard-td">
                      <span className="rank-badge">{index + 1}</span>
                    </td>
                    <td className="dashboard-td font-medium">{market.marketName}</td>
                    <td className="dashboard-td text-right font-semibold">{market.paybackCount}건</td>
                  </tr>
                ))}
                {topMarketsCompleted.length === 0 && (
                  <tr>
                    <td colSpan={3} className="dashboard-td text-center text-gray">데이터가 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Receipt Members Section */}
        <div className="dashboard-card" style={{ marginTop: '24px' }}>
          <div className="card-header">
            <h3 className="section-title">🧾 영수증 인증 우수 회원</h3>
            <div className="card-header-actions" style={{ gap: '12px' }}>
              <div className="period-selector">
                <button 
                  className={`btn-period ${receiptPeriod === 'DAY' ? 'active' : ''}`}
                  onClick={() => handlePeriodChange('DAY')}
                >
                  1일
                </button>
                <button 
                  className={`btn-period ${receiptPeriod === 'WEEK' ? 'active' : ''}`}
                  onClick={() => handlePeriodChange('WEEK')}
                >
                  1주
                </button>
                <button 
                  className={`btn-period ${receiptPeriod === 'MONTH' ? 'active' : ''}`}
                  onClick={() => handlePeriodChange('MONTH')}
                >
                  1달
                </button>
                <button 
                  className={`btn-period ${receiptPeriod === '' ? 'active' : ''}`}
                  onClick={() => handlePeriodChange('')}
                >
                  전체
                </button>
              </div>
              <button
                onClick={() => window.location.href = '/top-receipt-members'}
                className="btn-more"
              >
                더보기 →
              </button>
            </div>
          </div>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th className="dashboard-th">순위</th>
                <th className="dashboard-th">회원 학번</th>
                <th className="dashboard-th text-right">전체</th>
                <th className="dashboard-th text-right">완료</th>
                <th className="dashboard-th text-right">대기</th>
                <th className="dashboard-th text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {topReceiptMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="dashboard-td text-center text-gray">데이터가 없습니다.</td>
                </tr>
              ) : (
                topReceiptMembers.slice(0, 5).map((member, index) => (
                  <tr key={member.memberId}>
                    <td className="dashboard-td">
                      <span className="rank-badge">{index + 1}</span>
                    </td>
                    <td className="dashboard-td font-medium">{member.memberId}</td>
                    <td className="dashboard-td text-right">{member.receiptCount}회</td>
                    <td className="dashboard-td text-right color-success">{member.completedCount}건</td>
                    <td className="dashboard-td text-right">
                      <span className={`status-tag ${member.pendingCount > 0 ? 'tag-warning' : 'tag-neutral'}`}>
                        {member.pendingCount}건
                      </span>
                    </td>
                    <td className="dashboard-td text-right">
                      <button 
                        onClick={() => navigate(`/receipt-members/${member.memberId}`)}
                        className="btn-xs-link"
                      >
                        처리하기 →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
