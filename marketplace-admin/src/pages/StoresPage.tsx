import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import CreateStoreModal from '../components/CreateStoreModal';
import type { Store, CreateStoreRequest } from '../types/store';
import { STORE_MAJOR_LABELS } from '../types/store';
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
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; store: Store | null }>({ isOpen: false, store: null });

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

  const handleStoreCreated = async (data: CreateStoreRequest) => {
    try {
      await storeAPI.createStore(data);
      setIsCreateModalOpen(false);
      // 매장이 생성되면 목록을 다시 로드
      loadStores();
      setError('');
    } catch (err: any) {
      setError('매장 생성에 실패했습니다.');
      console.error('매장 생성 실패:', err);
      throw err; // 모달에서 에러 처리를 위해 다시 throw
    }
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

  const handleDeleteStore = (store: Store) => {
    setDeleteConfirm({ isOpen: true, store });
  };

  const confirmDeleteStore = async () => {
    if (!deleteConfirm.store) return;

    try {
      await storeAPI.deleteStore(deleteConfirm.store.marketId);
      setStores(prev => prev.filter(s => s.marketId !== deleteConfirm.store!.marketId));
      setDeleteConfirm({ isOpen: false, store: null });
      setError('');
    } catch (err: any) {
      setError('매장 삭제에 실패했습니다.');
      console.error('매장 삭제 실패:', err);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, store: null });
  };

  return (
    <Layout>
      <div className="stores-page">
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

        {error && <div className="error-message">{error}</div>}

        <div className="table-container">
          <table className="stores-table">
            <thead>
              <tr>
                <th>순서</th>
                <th>카테고리</th>
                <th>대표사진</th>
                <th>매장명</th>
                <th>매장 설명</th>
                <th>주소</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {loading && stores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="loading">매장 목록을 불러오는 중...</td>
                </tr>
              ) : filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">매장이 없습니다.</td>
                </tr>
              ) : (
                filteredStores.map((store, index) => (
                  <tr key={store.marketId} className="clickable-row" onClick={() => handleStoreDetail(store)}>
                    <td>{store.pageIndex ?? index + 1}</td>
                    <td>
                      <span className="store-category">
                        {store.major ? STORE_MAJOR_LABELS[store.major] : '-'}
                      </span>
                    </td>
                    <td>
                      <div className="store-thumbnail-small">
                        {store.thumbnail ? (
                          <img
                            src={store.thumbnail.startsWith('http') ? store.thumbnail : `${import.meta.env.VITE_API_BASE_URL || 'https://marketplace.inuappcenter.kr'}/image/${store.thumbnail}`}
                            alt={`${store.marketName} 대표사진`}
                            className="thumbnail-image-small"
                          />
                        ) : (
                          <div className="thumbnail-placeholder">
                            <span>📷</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="store-name-cell">
                        <span className="store-name-compact">{store.marketName}</span>
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
                      <div className="action-buttons">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStoreDetail(store);
                          }}
                        >
                          상세보기
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStore(store);
                          }}
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {hasNext && !loading && (
          <div className="load-more">
            <button className="btn btn-outline-primary" onClick={handleLoadMore}>
              더 보기
            </button>
          </div>
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

        {deleteConfirm.isOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>매장 삭제 확인</h3>
              <p>
                정말로 <strong>{deleteConfirm.store?.marketName}</strong> 매장을 삭제하시겠습니까?
                <br />
                삭제된 매장은 복구할 수 없습니다.
              </p>
              <div className="modal-actions">
                <button className="btn btn--secondary" onClick={cancelDelete}>
                  취소
                </button>
                <button className="btn btn--danger" onClick={confirmDeleteStore}>
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StoresPage;