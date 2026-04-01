import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import type { TopMarket } from '../types/stats';
import './TopMarketsPage.css';

const TopMarketsIssuedPage: React.FC = () => {
  const navigate = useNavigate();
  const [issuedMarkets, setIssuedMarkets] = useState<TopMarket[]>([]);
  const [completedMarkets, setCompletedMarkets] = useState<TopMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [period, setPeriod] = useState<string>('WEEK');

  useEffect(() => {
    loadAllStats(period);
  }, [period]);

  const loadAllStats = async (selectedPeriod: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('marketplace_admin_token');
      const query = selectedPeriod ? `?period=${selectedPeriod}` : '';
      
      const [issuedRes, completedRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://marketplace.inuappcenter.kr'}/api/admins/payback-coupons/stats/top-markets${query}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://marketplace.inuappcenter.kr'}/api/admins/payback-coupons/stats/top-markets/completed${query}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const issuedData = await issuedRes.json();
      const completedData = await completedRes.json();

      setIssuedMarkets(issuedData.response || []);
      setCompletedMarkets(completedData.response || []);
      setError('');
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error('매장 통계 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    setCurrentPage(1);
  };

  // 페이지네이션 계산
  const maxItems = Math.max(issuedMarkets.length, completedMarkets.length);
  const totalPages = Math.ceil(maxItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  
  const currentIssued = issuedMarkets.slice(startIndex, startIndex + pageSize);
  const currentCompleted = completedMarkets.slice(startIndex, startIndex + pageSize);

  // 페이지 번호 배열 생성 (최대 5개 표시)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // 페이지 크기 변경 시 첫 페이지로 이동
  };

  if (loading) {
    return (
      <Layout>
        <div className="top-markets-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="top-markets-container">
          <div className="error-message">
            <h3>데이터 로드 실패</h3>
            <p>{error}</p>
            <button onClick={() => loadAllStats(period)} className="btn btn-primary">다시 시도</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="top-markets-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">📊 매장 통계 비교 분석</h1>
            <p className="page-subtitle">발급 현황과 완료 현황을 교차 비교할 수 있습니다.</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            대시보드로 돌아가기
          </button>
        </div>

        <div className="controls-section" style={{ justifyContent: 'space-between', marginBottom: '24px' }}>
          <div className="period-selector" style={{ background: '#f3f4f6', padding: '4px', borderRadius: '8px' }}>
            {['DAY', 'WEEK', 'MONTH', ''].map((p) => (
              <button
                key={p}
                className={`btn-period ${period === p ? 'active' : ''}`}
                onClick={() => handlePeriodChange(p)}
              >
                {p === 'DAY' ? '1일' : p === 'WEEK' ? '1주' : p === 'MONTH' ? '1달' : '전체'}
              </button>
            ))}
          </div>
          <div className="page-size-selector">
            <span>표시:</span>
            {[10, 30, 50].map(size => (
              <button
                key={size}
                className={`btn-size ${pageSize === size ? 'active' : ''}`}
                onClick={() => handlePageSizeChange(size)}
              >
                {size}개
              </button>
            ))}
          </div>
        </div>

        <div className="grid-2" style={{ gap: '24px' }}>
          <div className="markets-card">
            <h3 className="section-title" style={{ padding: '16px 20px', margin: 0, borderBottom: '1px solid #f3f4f6' }}>🏆 환급 쿠폰 발급 순위</h3>
            <table className="markets-table">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>매장명</th>
                  <th className="text-right">발급 수</th>
                </tr>
              </thead>
              <tbody>
                {currentIssued.map((market, index) => (
                  <tr key={market.marketId}>
                    <td><span className="rank-badge">{startIndex + index + 1}</span></td>
                    <td className="font-medium">{market.marketName}</td>
                    <td className="text-right font-semibold">{market.paybackCount}건</td>
                  </tr>
                ))}
                {currentIssued.length === 0 && <tr><td colSpan={3} className="text-center text-gray">데이터 없음</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="markets-card">
            <h3 className="section-title" style={{ padding: '16px 20px', margin: 0, borderBottom: '1px solid #f3f4f6' }}>💰 환급 완료 매장 순위</h3>
            <table className="markets-table">
              <thead>
                <tr>
                  <th>순위</th>
                  <th>매장명</th>
                  <th className="text-right">완료 수</th>
                </tr>
              </thead>
              <tbody>
                {currentCompleted.map((market, index) => (
                  <tr key={market.marketId}>
                    <td><span className="rank-badge">{startIndex + index + 1}</span></td>
                    <td className="font-medium">{market.marketName}</td>
                    <td className="text-right font-semibold" style={{ color: '#059669' }}>{market.paybackCount}건</td>
                  </tr>
                ))}
                {currentCompleted.length === 0 && <tr><td colSpan={3} className="text-center text-gray">데이터 없음</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              이전
            </button>
            {getPageNumbers().map(page => (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            <button
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              다음
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TopMarketsIssuedPage;
