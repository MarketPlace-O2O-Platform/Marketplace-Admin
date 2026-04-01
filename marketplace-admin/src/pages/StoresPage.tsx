import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import Layout from '../components/Layout';
import CreateStoreModal from '../components/CreateStoreModal';
import type { Store, CreateStoreRequest, UpdateStoresOrderRequest } from '../types/store';
import { STORE_MAJOR_LABELS } from '../types/store';
import { storeAPI } from '../api/store';
import './StoresPage.css';

const StoresPage: React.FC = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStores, setEditingStores] = useState<Store[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; store: Store | null }>({ isOpen: false, store: null });

  const loadStores = async () => {
    try {
      setLoading(true);
      // 페이지네이션 구현을 위해 충분한 양을 가져오거나, 백엔드 사양에 맞춰 호출합니다.
      const response = await storeAPI.getStores({ pageSize: 100 }); 
      setStores(response.response.marketResDtos);
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

  // 페이지네이션 관련 로직 추가
  const totalPages = Math.ceil(filteredStores.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentStores = filteredStores.slice(startIndex, startIndex + pageSize);

  const getPageNumbers = () => {
    const pages = [];
    const maxPages = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxPages - 1);
    if (end - start < maxPages - 1) start = Math.max(1, end - maxPages + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
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

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(editingStores);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setEditingStores(items);
  };

  const handleSaveOrder = async () => {
    try {
      const orderData: UpdateStoresOrderRequest = editingStores.map((store, index) => ({
        marketId: store.marketId,
        orderNo: index + 1
      }));
      await storeAPI.updateStoresOrder(orderData);
      setIsEditMode(false);
      loadStores(); // 순서 저장 후 목록 새로고침
      setError('');
    } catch (err) {
      setError('노출 순서 변경에 실패했습니다.');
      console.error('노출 순서 변경 실패:', err);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingStores([]);
  };

  const handleStartEdit = () => {
    setViewMode('list');
    setIsEditMode(true);
    setEditingStores(sortedStores);
  };

  // 노출 순서대로 정렬된 매장 목록
  const sortedStores = [...filteredStores].sort((a, b) => {
    if (a.orderNo === undefined && b.orderNo === undefined) return 0;
    if (a.orderNo === undefined) return 1;
    if (b.orderNo === undefined) return -1;
    return a.orderNo - b.orderNo;
  });

  // 표시할 매장 목록 (편집 모드일 때는 editingStores 사용)
  const displayStores = isEditMode ? editingStores : currentStores;

  return (
    <Layout>
      <div className="stores-page">
        <div className="page-header">
          <div className="page-header-content">
            <div>
              <h1 className="page-title">매장관리</h1>
              <p className="page-description">등록된 매장을 관리하고 새로운 매장을 추가합니다.</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div className="view-mode-toggle">
                <button
                  className={`btn-icon ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => !isEditMode && setViewMode('list')}
                  title="리스트 뷰"
                  disabled={isEditMode}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                </button>
                <button
                  className={`btn-icon ${viewMode === 'card' ? 'active' : ''}`}
                  onClick={() => !isEditMode && setViewMode('card')}
                  title="카드 뷰"
                  disabled={isEditMode}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                </button>
              </div>
              {isEditMode ? (
                <>
                  <button className="btn btn--secondary" onClick={handleCancelEdit}>
                    취소
                  </button>
                  <button className="btn btn--primary" onClick={handleSaveOrder}>
                    순서 저장
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn--secondary" onClick={handleStartEdit}>
                    노출 순서 편집
                  </button>
                  <button className="btn btn--primary" onClick={handleCreateStore}>
                    <span>+</span>
                    매장 등록
                  </button>
                </>
              )}
            </div>
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
          {/* 페이지 크기 선택기 추가 */}
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

        {error && <div className="error-message">{error}</div>}

        {isEditMode && (
          <div className="edit-mode-notice">
            <span>📝 드래그하여 매장 순서를 변경하세요</span>
          </div>
        )}

        {viewMode === 'list' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="table-container">
            <table className="stores-table">
              <thead>
                <tr>
                  {isEditMode && <th style={{ width: '40px' }}>⋮⋮</th>}
                  <th>순서</th>
                  <th>카테고리</th>
                  <th>대표사진</th>
                  <th>매장명</th>
                  <th>매장 설명</th>
                  <th>주소</th>
                  {!isEditMode && <th>작업</th>}
                </tr>
              </thead>
              <Droppable droppableId="stores" isDropDisabled={!isEditMode}>
                {(provided) => (
                  <tbody {...provided.droppableProps} ref={provided.innerRef}>
                    {loading && stores.length === 0 ? (
                      <tr>
                        <td colSpan={isEditMode ? 7 : 8} className="loading">매장 목록을 불러오는 중...</td>
                      </tr>
                    ) : displayStores.length === 0 ? (
                      <tr>
                        <td colSpan={isEditMode ? 7 : 8} className="empty-state">매장이 없습니다.</td>
                      </tr>
                    ) : (
                      displayStores.map((store, index) => (
                        <Draggable
                          key={store.marketId}
                          draggableId={store.marketId.toString()}
                          index={index}
                          isDragDisabled={!isEditMode}
                        >
                          {(provided, snapshot) => (
                            <tr
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...(isEditMode ? provided.dragHandleProps : {})}
                              className={`${!isEditMode ? 'clickable-row' : ''} ${snapshot.isDragging ? 'dragging-row' : ''}`}
                              onClick={!isEditMode ? () => handleStoreDetail(store) : undefined}
                              style={{
                                ...provided.draggableProps.style,
                                cursor: isEditMode ? 'grab' : 'pointer'
                              }}
                            >
                              {isEditMode && (
                                <td className="drag-handle-cell">
                                  <div className="drag-handle-icon">⋮⋮</div>
                                </td>
                              )}
                              <td>{index + 1}</td>
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
                              {!isEditMode && (
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
                              )}
                            </tr>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </tbody>
                )}
              </Droppable>
            </table>
          </div>
        </DragDropContext>
        ) : (
          <div className="stores-grid">
            {loading && stores.length === 0 ? (
              <div className="loading-state">매장 목록을 불러오는 중...</div>
            ) : displayStores.length === 0 ? (
              <div className="empty-state">매장이 없습니다.</div>
            ) : (
              displayStores.map((store) => (
                <div
                  key={store.marketId}
                  className="store-card-item"
                  onClick={() => handleStoreDetail(store)}
                >
                  <div className="store-card-image">
                    {store.thumbnail ? (
                      <img
                        src={store.thumbnail.startsWith('http') ? store.thumbnail : `${import.meta.env.VITE_API_BASE_URL || 'https://marketplace.inuappcenter.kr'}/image/${store.thumbnail}`}
                        alt={store.marketName}
                      />
                    ) : (
                      <div className="thumbnail-placeholder">
                        <span>📷</span>
                      </div>
                    )}
                  </div>
                  <div className="store-card-content">
                    <div className="store-card-header">
                      <span className="store-card-category">
                        {store.major ? STORE_MAJOR_LABELS[store.major] : '-'}
                      </span>
                    </div>
                    <h3 className="store-card-title">{store.marketName}</h3>
                    <p className="store-card-desc">{store.marketDescription}</p>
                    <div className="store-card-footer">
                      <div className="store-card-address">
                        📍 {store.address}
                      </div>
                      <div className="store-card-actions">
                        <button
                          className="btn-icon-only"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteStore(store);
                          }}
                          title="삭제"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 더보기 버튼 제거 및 페이지네이션 추가 */}
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

        <div className="table-footer">
          <p className="results-info">
            총 {displayStores.length}개의 매장
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