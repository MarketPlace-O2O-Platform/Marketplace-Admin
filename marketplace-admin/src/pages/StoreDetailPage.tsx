import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import MarketCouponList from '../components/MarketCouponList';
import type { StoreDetail } from '../types/store';
import { storeAPI } from '../api/store';
import './StoreDetailPage.css';

const StoreDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [store, setStore] = useState<StoreDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'info' | 'coupons'>('info');

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
              <h1 className="page-title">매장 상세정보</h1>
            </div>
            <div className="header-actions">
              <button className="btn btn--secondary">수정</button>
              <button className="btn btn--danger">삭제</button>
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
              <div className="store-header-section">
                <div className="store-title-area">
                  <h2 className="store-title">{store.name}</h2>
                </div>
                <div className="store-id-area">
                  <span className="store-id-label">매장 ID</span>
                  <span className="store-id-value">{store.marketId}</span>
                </div>
              </div>

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

{store.imageResList && store.imageResList.length > 1 && (
                  <div className="detail-group">
                    <h3 className="detail-group-title">이미지 갤러리</h3>
                    <div className="detail-items">
                      <div className="detail-item">
                        <span className="detail-label">매장 이미지</span>
                        <div className="detail-value">
                          <div className="image-gallery">
                            {store.imageResList.map((image, index) => (
                              <div key={image.imageId} className="gallery-item">
                                <img
                                  src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/images/${image.name}`}
                                  alt={`${store.name} 이미지 ${index + 1}`}
                                  className="gallery-image"
                                />
                                <span className="image-sequence">#{image.sequence}</span>
                              </div>
                            ))}
                          </div>
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
      </div>
    </Layout>
  );
};

export default StoreDetailPage;