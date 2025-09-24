import React from 'react';
import type { Store } from '../types/store';
import './StoreDetailModal.css';

interface StoreDetailModalProps {
  store: Store;
  isOpen: boolean;
  onClose: () => void;
}

const StoreDetailModal: React.FC<StoreDetailModalProps> = ({ store, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content store-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">매장 상세정보</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="store-detail-content">
            {/* 이미지 섹션 - 상단 */}
            <div className="store-image-section">
              <div className="store-main-thumbnail">
                {store.thumbnail ? (
                  <img src={store.thumbnail} alt={store.marketName} />
                ) : (
                  <div className="thumbnail-placeholder">
                    <div className="placeholder-icon">🏪</div>
                    <div className="placeholder-text">이미지 없음</div>
                  </div>
                )}
              </div>
            </div>

            {/* 정보 섹션 - 하단 */}
            <div className="store-info-section">
              <div className="store-header">
                <h3 className="store-name">{store.marketName}</h3>
                <div className="store-badges">
                  {store.isFavorite && (
                    <span className="badge badge--favorite">⭐ 인기 매장</span>
                  )}
                  {store.isNewCoupon && (
                    <span className="badge badge--coupon">🎫 신규 쿠폰</span>
                  )}
                </div>
              </div>

              <div className="store-details">
                <div className="detail-item">
                  <span className="detail-label">매장 ID</span>
                  <span className="detail-value">{store.marketId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">매장 설명</span>
                  <span className="detail-value">{store.marketDescription}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">주소</span>
                  <span className="detail-value">📍 {store.address}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn--secondary" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreDetailModal;