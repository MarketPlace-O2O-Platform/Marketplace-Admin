import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import EditTempMarketModal from '../components/EditTempMarketModal';
import CachedImage from '../components/CachedImage';
import { tempMarketAPI } from '../api/tempMarket';
import type { TempMarket, UpdateTempMarketRequest } from '../types/store';
import { STORE_MAJOR_LABELS } from '../types/store';
import './TempMarketDetailPage.css';

const TempMarketDetailPage: React.FC = () => {
  const { tempMarketId } = useParams<{ tempMarketId: string }>();
  const navigate = useNavigate();
  const [market, setMarket] = useState<TempMarket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (tempMarketId) {
      loadMarketDetail();
    }
  }, [tempMarketId]);

  const loadMarketDetail = async () => {
    try {
      setLoading(true);
      const response = await tempMarketAPI.getTempMarketById(Number(tempMarketId));
      setMarket(response.response);
    } catch (err) {
      setError('공감 매장 정보를 불러오는데 실패했습니다.');
      console.error('Failed to load temp market detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (thumbnail: string) => {
    if (thumbnail.startsWith('http')) {
      return thumbnail;
    }
    return `${import.meta.env.VITE_API_BASE_URL || 'https://marketplace.inuappcenter.kr'}/image/tempMarket/${thumbnail}`;
  };

  const handleEditMarket = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleMarketUpdated = async (data: UpdateTempMarketRequest) => {
    try {
      await tempMarketAPI.updateTempMarket(data);
      setIsEditModalOpen(false);
      // 매장 정보를 다시 로드
      await loadMarketDetail();
      setError(null);
    } catch (err: unknown) {
      setError('공감 매장 수정에 실패했습니다.');
      console.error('공감 매장 수정 실패:', err);
      throw err;
    }
  };

  const handleToggleHidden = async () => {
    if (!market) return;

    const action = market.isHidden ? '공개' : '숨김';
    if (!window.confirm(`이 매장을 ${action} 처리하시겠습니까?`)) {
      return;
    }

    try {
      setIsToggling(true);
      await tempMarketAPI.toggleTempMarketHidden(market.marketId);
      // 매장 정보를 다시 로드
      await loadMarketDetail();
      setError(null);
    } catch (err: unknown) {
      setError('공개/숨김 처리에 실패했습니다.');
      console.error('공개/숨김 처리 실패:', err);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDeleteMarket = () => {
    setDeleteConfirm(true);
  };

  const confirmDeleteMarket = async () => {
    if (!market) return;

    try {
      await tempMarketAPI.deleteTempMarket(market.marketId);
      navigate('/temp-markets');
    } catch (err: unknown) {
      setError('공감 매장 삭제에 실패했습니다.');
      console.error('공감 매장 삭제 실패:', err);
      setDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">로딩 중...</div>
      </Layout>
    );
  }

  if (error || !market) {
    return (
      <Layout>
        <div className="error-message">{error || '공감 매장을 찾을 수 없습니다.'}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="temp-market-detail-page">
        <div className="page-header">
          <h1>공감 매장 상세</h1>
          <div className="header-actions">
            <button
              className={`btn ${market.isHidden ? 'btn-primary' : 'btn-secondary'}`}
              onClick={handleToggleHidden}
              disabled={isToggling}
            >
              {isToggling ? '처리 중...' : (market.isHidden ? '공개하기' : '숨김처리')}
            </button>
            <button className="btn btn-primary" onClick={handleEditMarket}>
              수정
            </button>
            <button className="btn btn-danger" onClick={handleDeleteMarket}>
              삭제
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/temp-markets')}>
              목록으로
            </button>
          </div>
        </div>

        <div className="detail-container">
          <div className="detail-section">
            <h2>기본 정보</h2>
            <div className="detail-grid-2col">
              <div className="detail-item">
                <label>매장 ID</label>
                <div>{market.marketId}</div>
              </div>
              {market.category && (
                <div className="detail-item">
                  <label>카테고리</label>
                  <div>{STORE_MAJOR_LABELS[market.category as keyof typeof STORE_MAJOR_LABELS] || market.category}</div>
                </div>
              )}
              <div className="detail-item">
                <label>매장명</label>
                <div>{market.marketName}</div>
              </div>
              <div className="detail-item">
                <label>설명</label>
                <div>{market.description}</div>
              </div>
              <div className="detail-item">
                <label>주소</label>
                <div>{market.address}</div>
              </div>
              <div className="detail-item">
                <label>공감 수</label>
                <div>{market.cheerCount}</div>
              </div>
              <div className="detail-item">
                <label>숨김 여부</label>
                <div>
                  {market.isHidden ? (
                    <span className="badge badge-warning">숨김</span>
                  ) : (
                    <span className="badge badge-success">공개</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h2>썸네일 이미지</h2>
            <div className="market-image-container">
              {market.thumbnail ? (
                <CachedImage
                  src={getImageUrl(market.thumbnail)}
                  alt={`${market.marketName} 썸네일`}
                  className="market-image"
                />
              ) : (
                <div className="thumbnail-placeholder-large">
                  <span>📷</span>
                  <p>이미지 없음</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {isEditModalOpen && market && (
          <EditTempMarketModal
            market={market}
            onClose={handleCloseEditModal}
            onSubmit={handleMarketUpdated}
          />
        )}

        {deleteConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>공감 매장 삭제 확인</h3>
              <p>
                정말로 <strong>{market.marketName}</strong> 매장을 삭제하시겠습니까?
                <br />
                삭제된 매장은 복구할 수 없습니다.
              </p>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={cancelDelete}>
                  취소
                </button>
                <button className="btn btn-danger" onClick={confirmDeleteMarket}>
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

export default TempMarketDetailPage;