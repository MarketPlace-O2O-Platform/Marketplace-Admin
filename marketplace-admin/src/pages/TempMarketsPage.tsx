import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import CreateTempMarketModal from '../components/CreateTempMarketModal';
import CachedImage from '../components/CachedImage';
import { tempMarketAPI } from '../api/tempMarket';
import type { TempMarket, CreateTempMarketRequest } from '../types/store';
import { STORE_MAJOR_LABELS } from '../types/store';

const TempMarketsPage: React.FC = () => {
  const navigate = useNavigate();
  const [markets, setMarkets] = useState<TempMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    loadMarkets();
  }, [currentPage]);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const response = await tempMarketAPI.getTempMarkets({
        page: currentPage,
        size: 50
      });

      setMarkets(response.response.content);
      setTotalPages(response.response.page.totalPages);
    } catch (err) {
      setError('공감 매장 목록을 불러오는데 실패했습니다.');
      console.error('Failed to load temp markets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getImageUrl = (thumbnail: string) => {
    if (thumbnail.startsWith('http')) {
      return thumbnail;
    }
    return `${import.meta.env.VITE_API_BASE_URL || 'https://marketplace.inuappcenter.kr'}/image/tempMarket/${thumbnail}`;
  };

  const handleMarketClick = (marketId: number) => {
    navigate(`/temp-markets/${marketId}`);
  };

  const handleCreateMarket = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleMarketCreated = async (data: CreateTempMarketRequest) => {
    try {
      await tempMarketAPI.createTempMarket(data);
      setIsCreateModalOpen(false);
      // 매장이 생성되면 목록을 다시 로드
      loadMarkets();
      setError(null);
    } catch (err: any) {
      setError('공감 매장 생성에 실패했습니다.');
      console.error('공감 매장 생성 실패:', err);
      throw err; // 모달에서 에러 처리를 위해 다시 throw
    }
  };

  // 검색 필터링된 매장 목록
  const filteredMarkets = markets.filter(market => {
    const matchesSearch = market.marketName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         market.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         market.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
        >
          처음
        </button>
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          이전
        </button>
        {pages}
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          다음
        </button>
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage >= totalPages}
        >
          마지막
        </button>
      </div>
    );
  };

  return (
    <Layout>
      <div className="temp-markets-page">
        <div className="page-header">
          <h1>공감 매장 관리</h1>
          <button className="btn btn-primary" onClick={handleCreateMarket}>
            <span>+</span>
            매장 등록
          </button>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="매장명, 설명, 주소로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="table-container">
          <table className="coupon-table">
            <thead>
              <tr>
                <th>순번</th>
                <th>카테고리</th>
                <th>썸네일</th>
                <th>매장명</th>
                <th>설명</th>
                <th>주소</th>
                <th>공감 수</th>
                <th>숨김 여부</th>
              </tr>
            </thead>
            <tbody>
              {filteredMarkets.map((market, index) => (
                <tr
                  key={market.marketId}
                  className="market-row"
                  onClick={() => handleMarketClick(market.marketId)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{(currentPage - 1) * 50 + index + 1}</td>
                  <td>
                    <span className="store-category">
                      {market.category ? STORE_MAJOR_LABELS[market.category as keyof typeof STORE_MAJOR_LABELS] || market.category : '-'}
                    </span>
                  </td>
                  <td>
                    <div className="store-thumbnail-small">
                      {market.thumbnail ? (
                        <CachedImage
                          src={getImageUrl(market.thumbnail)}
                          alt={`${market.marketName} 썸네일`}
                          className="thumbnail-image-small"
                        />
                      ) : (
                        <div className="thumbnail-placeholder">
                          <span>📷</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="market-name">{market.marketName}</td>
                  <td className="market-description">{market.description}</td>
                  <td className="market-address">{market.address}</td>
                  <td className="cheer-count">{market.cheerCount}</td>
                  <td>
                    {market.isHidden ? (
                      <span className="badge badge-warning">숨김</span>
                    ) : (
                      <span className="badge badge-success">공개</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && <div className="loading">로딩 중...</div>}

        {!loading && filteredMarkets.length === 0 && (
          <div className="empty-state">
            <p>{searchTerm ? '검색 결과가 없습니다.' : '공감 매장이 없습니다.'}</p>
          </div>
        )}

        {!loading && totalPages > 0 && renderPagination()}

        <div className="table-footer">
          <p className="results-info">
            총 {filteredMarkets.length}개의 매장
          </p>
        </div>

        {isCreateModalOpen && (
          <CreateTempMarketModal
            onClose={handleCloseModal}
            onSubmit={handleMarketCreated}
          />
        )}
      </div>
    </Layout>
  );
};

export default TempMarketsPage;