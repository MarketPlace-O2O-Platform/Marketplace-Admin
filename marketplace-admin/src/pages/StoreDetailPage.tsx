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
            <div className="header-actions">
              <button className="btn btn--secondary" onClick={handleEditStore}>수정</button>
              <button className="btn btn--danger" onClick={handleDeleteStore}>삭제</button>
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
                  <img
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
                  <div className="detail-items">
                    <div className="detail-item">
                      <span className="detail-label">매장 설명</span>
                      <div className="detail-value description">
                        {store.description}
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">주소</span>
                      <div className="detail-value address">
                        📍 {store.address}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 추가 정보 섹션들 */}
                <div className="detail-group">
                  <h3 className="detail-group-title">운영 정보</h3>
                  <div className="detail-items">
                    <div className="detail-item">
                      <span className="detail-label">운영 시간</span>
                      <div className="detail-value">
                        {store.operationHours}
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">휴무일</span>
                      <div className="detail-value">{store.closedDays}</div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">연락처</span>
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