import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import CreateStoreModal from '../components/CreateStoreModal';
import type { Store } from '../types/store';
import { storeAPI } from '../api/store';
import './StoresPage.css';

const StoresPage: React.FC = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [hasNext, setHasNext] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadStores = async (cursor?: number, isLoadMore = false) => {
    try {
      console.log('loadStores 호출:', { cursor, isLoadMore });
      if (!isLoadMore) setLoading(true);

      const response = await storeAPI.getStores({ pageSize: 30, cursor });
      console.log('API 응답:', response);

      if (isLoadMore) {
        // 더보기인 경우 기존 목록에 추가 (중복 제거)
        setStores(prev => {
          const newStores = response.response.marketResDtos.filter(
            newStore => !prev.some(existingStore => existingStore.marketId === newStore.marketId)
          );
          return [...prev, ...newStores];
        });
      } else {
        // 처음 로드인 경우 새로 설정
        setStores(response.response.marketResDtos);
      }

      setHasNext(response.response.hasNext);
      setError('');
    } catch (err: any) {
      setError('매장 목록을 불러오는데 실패했습니다.');
      console.error('매장 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.marketName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.marketDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.address.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleCreateStore = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleStoreCreated = (newStore: any) => {
    console.log('새 매장 생성:', newStore);
    setIsCreateModalOpen(false);
    // 매장이 생성되면 목록을 다시 로드
    loadStores();
  };

  const handleStoreDetail = (store: Store) => {
    navigate(`/stores/${store.marketId}`);
  };

  const handleLoadMore = () => {
    console.log('더보기 클릭:', {
      storesLength: stores.length,
      hasNext,
      loading,
      lastMarketId: stores.length > 0 ? stores[stores.length - 1].marketId : null
    });

    if (stores.length > 0 && hasNext && !loading) {
      // 마지막 매장의 marketId를 lastPageIndex로 사용 (무한스크롤)
      const lastStore = stores[stores.length - 1];
      loadStores(lastStore.marketId, true);
    }
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div className="page-header-content">
            <div>
              <h1 className="page-title">매장관리</h1>
              <p className="page-description">등록된 매장을 관리하고 새로운 매장을 추가합니다.</p>
            </div>
            <button className="btn btn--primary" onClick={handleCreateStore}>
              <span>+</span>
              매장 등록
            </button>
          </div>
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

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {loading && stores.length === 0 ? (
          <div className="loading-container">
            <p>매장 목록을 불러오는 중...</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="stores-table">
                <thead>
                  <tr>
                    <th>순서</th>
                    <th>매장명</th>
                    <th>매장 설명</th>
                    <th>주소</th>
                    <th>상태</th>
                    <th>작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStores.map((store, index) => (
                    <tr key={store.marketId}>
                      <td>{store.pageIndex ?? index + 1}</td>
                      <td>
                        <div className="store-name-cell">
                          <span className="store-name">{store.marketName}</span>
                          <span className="store-id">ID: {store.marketId}</span>
                        </div>
                      </td>
                      <td>
                        <div className="store-description-cell" title={store.marketDescription}>
                          {store.marketDescription.length > 50
                            ? `${store.marketDescription.substring(0, 50)}...`
                            : store.marketDescription
                          }
                        </div>
                      </td>
                      <td>{store.address}</td>
                      <td>
                        <div className="store-status">
                          {store.isFavorite && (
                            <span className="status-badge status-badge--favorite">⭐</span>
                          )}
                          {store.isNewCoupon && (
                            <span className="status-badge status-badge--coupon">🎫</span>
                          )}
                          {!store.isFavorite && !store.isNewCoupon && (
                            <span className="status-badge status-badge--normal">-</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn--sm btn--secondary"
                            onClick={() => handleStoreDetail(store)}
                          >
                            상세보기
                          </button>
                          <button className="btn btn--sm btn--danger">삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasNext && (
              <div className="load-more-container">
                <button
                  className="btn btn--secondary load-more-btn"
                  onClick={handleLoadMore}
                  disabled={loading}
                >
                  {loading ? '로딩 중...' : '더 보기'}
                </button>
              </div>
            )}
          </>
        )}

        <div className="table-footer">
          <p className="results-info">
            총 {filteredStores.length}개의 매장
          </p>
        </div>

        {isCreateModalOpen && (
          <CreateStoreModal
            onClose={handleCloseModal}
            onSubmit={handleStoreCreated}
          />
        )}
      </div>
    </Layout>
  );
};

export default StoresPage;