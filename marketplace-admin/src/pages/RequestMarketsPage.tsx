import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import type { RequestMarket } from '../types/requestMarket';
import { requestMarketAPI } from '../api/requestMarket';
import './RequestMarketsPage.css';

const RequestMarketsPage: React.FC = () => {
  const [requestMarkets, setRequestMarkets] = useState<RequestMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const loadRequestMarkets = async (page: number) => {
    try {
      setLoading(true);
      const response = await requestMarketAPI.getRequestMarkets({ page, size: pageSize });

      setRequestMarkets(response.response.content);
      setTotalPages(response.response.totalPages);
      setTotalElements(response.response.totalElements);
      setCurrentPage(page);
      setError('');
    } catch (err: any) {
      setError('요청 매장 목록을 불러오는데 실패했습니다.');
      console.error('요청 매장 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequestMarkets(1);
  }, []);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadRequestMarkets(page);
    }
  };

  const renderPagination = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (currentPage > 1) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="pagination-btn"
        >
          이전
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    if (currentPage < totalPages) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="pagination-btn"
        >
          다음
        </button>
      );
    }

    return pages;
  };

  return (
    <Layout>
      <div className="request-markets-page">
        <div className="page-header">
          <div className="page-header-content">
            <div>
              <h1 className="page-title">요청 매장 관리</h1>
              <p className="page-description">회원들이 요청한 매장을 관리합니다.</p>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="table-container">
          <table className="request-markets-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>매장명</th>
                <th>주소</th>
                <th>요청 횟수</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="loading">요청 매장 목록을 불러오는 중...</td>
                </tr>
              ) : requestMarkets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">요청된 매장이 없습니다.</td>
                </tr>
              ) : (
                requestMarkets.map((market) => (
                  <tr key={market.id}>
                    <td>{market.id}</td>
                    <td>
                      <div className="market-name-cell">
                        <span className="market-name">{market.name}</span>
                      </div>
                    </td>
                    <td>{market.address}</td>
                    <td>
                      <span className="count-badge">{market.count}회</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 0 && (
          <div className="pagination">
            {renderPagination()}
          </div>
        )}

        <div className="table-footer">
          <p className="results-info">
            총 {totalElements}개의 요청 매장 (페이지 {currentPage}/{totalPages})
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default RequestMarketsPage;
