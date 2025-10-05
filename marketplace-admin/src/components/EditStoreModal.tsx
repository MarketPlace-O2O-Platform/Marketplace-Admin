import React, { useState } from 'react';
import type { StoreDetail, UpdateStoreRequest } from '../types/store';
import { STORE_MAJOR_LABELS } from '../types/store';
import './EditStoreModal.css';

interface EditStoreModalProps {
  store: StoreDetail;
  onClose: () => void;
  onSubmit: (data: UpdateStoreRequest) => void;
}

const EditStoreModal: React.FC<EditStoreModalProps> = ({ store, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<UpdateStoreRequest>({
    marketName: store.name,
    description: store.description,
    operationHours: store.operationHours,
    closedDays: store.closedDays,
    phoneNumber: store.phoneNumber,
    address: store.address,
    major: store.major || 'ETC'
  });

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressSearch = () => {
    new (window as any).daum.Postcode({
      oncomplete: function(data: any) {
        // 도로명 주소나 지번 주소를 선택
        const fullAddress = data.roadAddress || data.jibunAddress;
        setFormData(prev => ({ ...prev, address: fullAddress }));
      }
    }).open();
  };

  const handleSearchByStoreName = () => {
    if (!formData.marketName.trim()) {
      alert('매장명을 먼저 입력해주세요.');
      return;
    }

    const searchWithKakao = () => {
      const kakao = (window as any).kakao;
      if (!kakao || !kakao.maps || !kakao.maps.services) {
        return false;
      }

      const ps = new kakao.maps.services.Places();

      ps.keywordSearch(formData.marketName, (data: any[], status: any) => {
        if (status === kakao.maps.services.Status.OK && data.length > 0) {
          setSearchResults(data);
          setShowSearchModal(true);
        } else {
          alert('해당 매장을 찾을 수 없습니다. 다른 검색어를 입력해주세요.');
        }
      });
      return true;
    };

    // 바로 시도
    if (searchWithKakao()) {
      return;
    }

    // 실패시 잠시 대기 후 재시도
    setTimeout(() => {
      if (!searchWithKakao()) {
        alert('카카오 지도 API를 불러오는데 실패했습니다. 페이지를 새로고침 후 다시 시도해주세요.');
      }
    }, 1000);
  };

  const handleSelectPlace = (place: any) => {
    const address = place.road_address_name || place.address_name;
    setFormData(prev => ({ ...prev, address: address }));

    setShowSearchModal(false);
    setSearchResults([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-content edit-store-modal">
          <div className="modal-header">
            <h2>매장 정보 수정</h2>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

        <form onSubmit={handleSubmit} className="edit-store-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="marketName">매장명 *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  id="marketName"
                  name="marketName"
                  value={formData.marketName}
                  onChange={handleChange}
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleSearchByStoreName}
                  className="btn btn-secondary"
                  style={{ whiteSpace: 'nowrap', padding: '0 12px' }}
                >
                  매장 검색
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="major">업종 *</label>
              <select
                id="major"
                name="major"
                value={formData.major}
                onChange={handleChange}
                required
              >
                {Object.entries(STORE_MAJOR_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">매장 설명 *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">주소 *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="매장명으로 검색하거나 직접 입력하세요"
              required
            />
            <p className="form-help" style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>
              * 해당 주소로 어플 내 지도에 표시됩니다. 정확한 주소를 입력해주세요. (카카오맵 API 사용)
            </p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="operationHours">운영시간 *</label>
              <input
                type="text"
                id="operationHours"
                name="operationHours"
                value={formData.operationHours}
                onChange={handleChange}
                placeholder="예: 09:00 - 22:00"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="closedDays">휴무일 *</label>
              <input
                type="text"
                id="closedDays"
                name="closedDays"
                value={formData.closedDays}
                onChange={handleChange}
                placeholder="예: 매주 일요일"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">연락처 *</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="예: 010-1234-5678"
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              취소
            </button>
            <button type="submit" className="btn btn-primary">
              수정
            </button>
          </div>
        </form>
      </div>
    </div>

    {/* 매장 검색 결과 모달 */}
    {showSearchModal && (
      <div className="modal-overlay" onClick={() => setShowSearchModal(false)} style={{ zIndex: 1001 }}>
        <div className="modal-content edit-store-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
          <div className="modal-header">
            <h2>매장 검색 결과</h2>
            <button className="close-btn" onClick={() => setShowSearchModal(false)}>×</button>
          </div>
          <div style={{ padding: '20px', maxHeight: '500px', overflowY: 'auto' }}>
            {searchResults.map((place, index) => (
              <div
                key={place.id}
                style={{
                  padding: '16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onClick={() => handleSelectPlace(place)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
              >
                <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>
                  {place.place_name}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>
                  {place.road_address_name || place.address_name}
                </div>
                {place.category_name && (
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {place.category_name}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default EditStoreModal;