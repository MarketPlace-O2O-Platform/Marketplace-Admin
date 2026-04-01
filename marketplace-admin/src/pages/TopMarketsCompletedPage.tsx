import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import type { TopMarket } from '../types/stats';
import './TopMarketsPage.css';

const TopMarketsCompletedPage: React.FC = () => {
  const navigate = useNavigate();
  const [markets, setMarkets] = useState<TopMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('marketplace_admin_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'https://marketplace.inuappcenter.kr'}/api/admins/payback-coupons/stats/top-markets/completed`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      setMarkets(data.response || []);
      setError('');
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error('환급 완료 매장 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(markets.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentMarkets = markets.slice(startIndex, endIndex);

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
            <button onClick={loadMarkets} className="btn btn-primary">다시 시도</button>
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
            <h1 className="page-title">💰 환급 완료 매장 전체</h1>
            <p className="page-subtitle">모든 환급 완료 매장을 확인하세요. (총 {markets.length}개)</p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            대시보드로 돌아가기
          </button>
        </div>

        <div className="controls-section">
          <div className="page-size-selector">
            <span>표시 개수:</span>
            <button
              className={`btn-size ${pageSize === 10 ? 'active' : ''}`}
              onClick={() => handlePageSizeChange(10)}
            >
              10개
            </button>
            <button
              className={`btn-size ${pageSize === 30 ? 'active' : ''}`}
              onClick={() => handlePageSizeChange(30)}
            >
              30개
            </button>
            <button
              className={`btn-size ${pageSize === 50 ? 'active' : ''}`}
              onClick={() => handlePageSizeChange(50)}
            >
              50개
            </button>
          </div>
        </div>

        <div className="markets-card">
          <table className="markets-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>매장명</th>
                <th className="text-right">완료 수</th>
              </tr>
            </thead>
            <tbody>
              {currentMarkets.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-gray">데이터가 없습니다.</td>
                </tr>
              ) : (
                currentMarkets.map((market, index) => (
                  <tr key={market.marketId}>
                    <td>
                      <span className="rank-badge">{startIndex + index + 1}</span>
                    </td>
                    <td className="font-medium">{market.marketName}</td>
                    <td className="text-right font-semibold">{market.paybackCount}건</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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

export default TopMarketsCompletedPage;
