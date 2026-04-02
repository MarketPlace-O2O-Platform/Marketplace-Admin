import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import MarketCouponList from '../components/MarketCouponList';
import EditStoreModal from '../components/EditStoreModal';
import type { StoreDetail, UpdateStoreRequest } from '../types/store';
import { STORE_MAJOR_LABELS } from '../types/store';
import { storeAPI } from '../api/store';
import './StoreDetailPage.css';

const StoreDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [store, setStore] = useState<StoreDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'info' | 'coupons'>(
    searchParams.get('tab') === 'coupons' ? 'coupons' : 'info'
  );
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImageManaging, setIsImageManaging] = useState(false);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [changedSequences, setChangedSequences] = useState<Record<string, number>>({});
  const [newImages, setNewImages] = useState<File[]>([]);
  const [addedImageSequences, setAddedImageSequences] = useState<number[]>([]);

  useEffect(() => {
    if (!id) {
      navigate('/stores');
      return;
    }

    const loadStore = async () => {
      try {
        setLoading(true);
        const response = await storeAPI.getStoreById(parseInt(id));
        setStore(response.response);
        setError('');
      } catch (err: any) {
        setError('매장 정보를 불러오는데 실패했습니다.');
        console.error('매장 상세 정보 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStore();
  }, [id, navigate]);

  const handleBack = () => {
    navigate('/stores');
  };

  const handleDeleteStore = () => {
    setDeleteConfirm(true);
  };

  const confirmDeleteStore = async () => {
    if (!store) return;

    try {
      await storeAPI.deleteStore(store.marketId);
      navigate('/stores');
    } catch (err: any) {
      setError('매장 삭제에 실패했습니다.');
      console.error('매장 삭제 실패:', err);
      setDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(false);
  };

  const handleEditStore = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleUpdateStore = async (data: UpdateStoreRequest) => {
    if (!store) return;

    try {
      const response = await storeAPI.updateStore(store.marketId, data);
      setStore(response.response);
      setIsEditModalOpen(false);
      setError('');
    } catch (err: any) {
      setError('매장 정보 수정에 실패했습니다.');
      console.error('매장 수정 실패:', err);
    }
  };

  const handleImageManage = () => {
    console.log('이미지 관리 모드 토글:', !isImageManaging);
    setIsImageManaging(!isImageManaging);
    if (!isImageManaging) {
      // 이미지 관리 모드 시작시 초기화
      setDeletedImageIds([]);
      setChangedSequences({});
      setNewImages([]);
      setAddedImageSequences([]);
    }
  };

  const handleDeleteImage = (imageId: number) => {
    setDeletedImageIds(prev => [...prev, imageId]);
  };

  const handleUndoDeleteImage = (imageId: number) => {
    setDeletedImageIds(prev => prev.filter(id => id !== imageId));
  };

  const handleSequenceChange = (imageId: number, newSequence: number) => {
    setChangedSequences(prev => ({
      ...prev,
      [imageId]: newSequence
    }));
  };

  const handleAddImages = (files: FileList) => {
    const filesArray = Array.from(files);
    setNewImages(prev => [...prev, ...filesArray]);

    // 새 이미지들의 순서를 자동으로 배정 (기존 이미지 수 + 1부터)
    const existingCount = store?.imageResList.length || 0;
    const newSequences = filesArray.map((_, index) => existingCount + newImages.length + index + 1);
    setAddedImageSequences(prev => [...prev, ...newSequences]);
  };

  const handleSaveImageChanges = async () => {
    if (!store) return;

    try {
      const response = await storeAPI.updateStoreImages(
        store.marketId,
        {
          deletedImageIds,
          changedSequences,
          addedImageSequences
        },
        newImages
      );

      setStore(response.response);
      setIsImageManaging(false);
      setDeletedImageIds([]);
      setChangedSequences({});
      setNewImages([]);
      setAddedImageSequences([]);
      setError('');
      alert('이미지가 성공적으로 업데이트되었습니다.');
    } catch (err: any) {
      setError('이미지 업데이트에 실패했습니다.');
      console.error('이미지 업데이트 실패:', err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="page-container">
          <div className="loading-container">
            <p>매장 정보를 불러오는 중...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !store) {
    return (
      <Layout>
        <div className="page-container">
          <div className="error-container">
            <p>{error || '매장을 찾을 수 없습니다.'}</p>
            <button className="btn btn--primary" onClick={handleBack}>
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <div className="page-header-content">
            <div className="header-navigation">
              <button className="back-btn" onClick={handleBack}>
                ← 목록으로
              </button>
              <h1 className="page-title">
                {store.name}
                <span className="store-id-badge">#{store.marketId}</span>
                {store.major && (
                  <span className="store-category-badge">
                    {STORE_MAJOR_LABELS[store.major]}
                  </span>
                )}
              </h1>
            </div>
          </div>
        </div>

        <div className="store-detail-container">
          {/* 탭 네비게이션 */}
          <div className="tab-navigation">
            <button
              className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              매장 정보
            </button>
            <button
              className={`tab-button ${activeTab === 'coupons' ? 'active' : ''}`}
              onClick={() => setActiveTab('coupons')}
            >
              쿠폰 관리
            </button>
          </div>

          {/* 탭 컨텐츠 */}
          {activeTab === 'info' && (
          <div className="store-detail-card">
            {/* 이미지 섹션 */}
            <div className="store-image-container">
              <div className="store-main-image">
                {store.imageResList && store.imageResList.length > 0 ? (
                  <img className="store-main-image"
                    src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/image/${store.imageResList[0].name}`}
                    alt={store.name}
                  />
                ) : (
                  <div className="image-placeholder">
                    <div className="placeholder-icon">🏪</div>
                    <div className="placeholder-text">이미지 없음</div>
                  </div>
                )}
              </div>
            </div>

            {/* 정보 섹션 */}
            <div className="store-info-container">
              <div className="store-details-section">
                <div className="detail-group">
                  <h3 className="detail-group-title">기본 정보</h3>
                  <div className="detail-items basic-info">
                    <div className="detail-item full-width">
                      <span className="detail-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
                        매장 설명
                      </span>
                      <div className="detail-value description">
                        {store.description}
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        주소
                      </span>
                      <div className="detail-value address">
                        {store.address}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 추가 정보 섹션들 */}
                <div className="detail-group">
                  <h3 className="detail-group-title">운영 정보</h3>
                  <div className="detail-items grid-info">
                    <div className="detail-item">
                      <span className="detail-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        운영 시간
                      </span>
                      <div className="detail-value">
                        {store.operationHours}
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line><line x1="10" y1="14" x2="14" y2="18"></line><line x1="14" y1="14" x2="10" y2="18"></line></svg>
                        휴무일
                      </span>
                      <div className="detail-value">{store.closedDays}</div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.7 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        연락처
                      </span>
                      <div className="detail-value">{store.phoneNumber}</div>
                    </div>
                  </div>
                </div>

{store.imageResList && store.imageResList.length > 0 && (
                  <div className="detail-group">
                    <div className="detail-group-header">
                      <h3 className="detail-group-title">이미지 갤러리 {isImageManaging && '(관리 모드)'}</h3>
                      <button
                        className={`btn btn-sm ${isImageManaging ? 'btn-success' : 'btn-secondary'}`}
                        onClick={handleImageManage}
                      >
                        {isImageManaging ? '관리 완료' : '이미지 관리'}
                      </button>
                    </div>
                    <div className="detail-items">
                      <div className="detail-item">
                        <span className="detail-label">매장 이미지</span>
                        <div className="detail-value">
                          <div className="image-gallery">
                            {store.imageResList.map((image, index) => {
                              const isDeleted = deletedImageIds.includes(image.imageId);
                              const newSequence = changedSequences[image.imageId];

                              return (
                                <div
                                  key={image.imageId}
                                  className={`gallery-item ${isDeleted ? 'deleted' : ''} ${isImageManaging ? 'managing' : ''}`}
                                >
                                  <div className="image-container">
                                    <img
                                      src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/image/${image.name}`}
                                      alt={`${store.name} 이미지 ${index + 1}`}
                                      className="gallery-image"
                                    />
                                    <div className="image-overlay">
                                      {(newSequence || image.sequence) === 1 ? (
                                        <span className="thumbnail-badge">#1 썸네일</span>
                                      ) : (
                                        <span className="image-sequence">
                                          #{newSequence || image.sequence}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {isImageManaging && (
                                    <div className="image-actions" style={{ background: '#f3f4f6', padding: '12px', border: '2px solid #d1d5db', borderRadius: '6px' }}>
                                      {!deletedImageIds.includes(image.imageId) ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                          <input
                                            type="number"
                                            min="1"
                                            value={changedSequences[image.imageId] || image.sequence}
                                            onChange={(e) => handleSequenceChange(image.imageId, parseInt(e.target.value))}
                                            style={{
                                              width: '70px',
                                              padding: '8px',
                                              border: '2px solid #d1d5db',
                                              borderRadius: '4px',
                                              textAlign: 'center',
                                              background: 'white',
                                              fontSize: '14px'
                                            }}
                                          />
                                          <button
                                            style={{
                                              padding: '8px 16px',
                                              backgroundColor: '#dc2626',
                                              color: 'white',
                                              border: '2px solid #dc2626',
                                              borderRadius: '4px',
                                              fontSize: '13px',
                                              fontWeight: '600',
                                              cursor: 'pointer'
                                            }}
                                            onClick={() => {
                                              console.log('삭제 버튼 클릭:', image.imageId);
                                              handleDeleteImage(image.imageId);
                                            }}
                                          >
                                            삭제
                                          </button>
                                        </div>
                                      ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                          <span style={{ fontSize: '14px', color: '#dc2626', fontWeight: '600' }}>삭제 예정</span>
                                          <button
                                            style={{
                                              padding: '8px 16px',
                                              backgroundColor: '#6b7280',
                                              color: 'white',
                                              border: '2px solid #6b7280',
                                              borderRadius: '4px',
                                              fontSize: '13px',
                                              fontWeight: '600',
                                              cursor: 'pointer'
                                            }}
                                            onClick={() => handleUndoDeleteImage(image.imageId)}
                                          >
                                            취소
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                            {/* 새로 추가된 이미지들 */}
                            {newImages.map((file, index) => (
                              <div key={`new-${index}`} className="gallery-item new-image">
                                <div className="image-container">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`새 이미지 ${index + 1}`}
                                    className="gallery-image"
                                  />
                                  <div className="image-overlay">
                                    <span className="image-sequence">
                                      #{addedImageSequences[index] || (store?.imageResList.length || 0) + index + 1}
                                    </span>
                                  </div>
                                </div>
                                {isImageManaging && (
                                  <div className="image-actions">
                                    <button
                                      className="btn btn-xs btn-danger"
                                      onClick={() => {
                                        setNewImages(prev => prev.filter((_, i) => i !== index));
                                        setAddedImageSequences(prev => prev.filter((_, i) => i !== index));
                                      }}
                                    >
                                      삭제
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {isImageManaging && (
                            <div className="image-management-controls">
                              <div className="management-notice">
                                <p>📝 <strong>이미지 관리 안내</strong></p>
                                <ul>
                                  <li>기존 이미지나 썸네일을 삭제하면, 새로 추가한 이미지가 순서대로 자동 배치됩니다.</li>
                                  <li>순서 번호 1번이 썸네일로 설정됩니다.</li>
                                  <li>순서는 숫자로 직접 수정할 수 있습니다.</li>
                                </ul>
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => e.target.files && handleAddImages(e.target.files)}
                                className="file-input"
                              />
                              <div className="management-actions">
                                <button
                                  className="btn btn-primary"
                                  onClick={handleSaveImageChanges}
                                  disabled={deletedImageIds.length === 0 && Object.keys(changedSequences).length === 0 && newImages.length === 0}
                                >
                                  변경사항 저장
                                </button>
                                <button
                                  className="btn btn-secondary"
                                  onClick={handleImageManage}
                                >
                                  취소
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          )}

          {/* 쿠폰 관리 탭 */}
          {activeTab === 'coupons' && (
            <div className="coupon-management-container">
              <MarketCouponList marketId={store.marketId} marketName={store.name} />
            </div>
          )}
        </div>
        
        <div className="page-footer-actions">
          <button className="btn-action edit" onClick={handleEditStore}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            수정하기
          </button>
          <button className="btn-action delete" onClick={handleDeleteStore}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            삭제
          </button>
        </div>


        {deleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>매장 삭제 확인</h3>
              <p>
                정말로 <strong>{store?.name}</strong> 매장을 삭제하시겠습니까?
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

        {isEditModalOpen && store && (
          <EditStoreModal
            store={store}
            onClose={handleCloseEditModal}
            onSubmit={handleUpdateStore}
          />
        )}
      </div>
    </Layout>
  );
};

export default StoreDetailPage;