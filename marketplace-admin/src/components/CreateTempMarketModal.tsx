import React, { useState } from 'react';
import type { CreateTempMarketRequest } from '../types/store';
import type { KakaoPlace } from '../types/kakao';
import { STORE_MAJOR_LABELS } from '../types/store';
import './CreateStoreModal.css';

interface CreateTempMarketModalProps {
  onClose: () => void;
  onSubmit: (data: CreateTempMarketRequest) => Promise<void>;
}

const CreateTempMarketModal: React.FC<CreateTempMarketModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateTempMarketRequest>({
    category: 'FOOD',
    marketName: '',
    description: '',
    address: '',
    file: undefined
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchResults, setSearchResults] = useState<KakaoPlace[]>([]);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSearchByStoreName = () => {
    if (!formData.marketName.trim()) {
      alert('매장명을 먼저 입력해주세요.');
      return;
    }

    const searchWithKakao = () => {
      const kakao = window.kakao;
      if (!kakao || !kakao.maps || !kakao.maps.services) {
        return false;
      }

      const ps = new kakao.maps.services.Places();

      ps.keywordSearch(formData.marketName, (data: KakaoPlace[], status: string) => {
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

  const handleSelectPlace = (place: KakaoPlace) => {
    const address = place.road_address_name || place.address_name;
    setFormData(prev => ({ ...prev, address: address }));

    // 주소 에러 제거
    if (errors.address) {
      setErrors(prev => ({ ...prev, address: '' }));
    }

    setShowSearchModal(false);
    setSearchResults([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));

      if (errors.file) {
        setErrors(prev => ({ ...prev, file: '' }));
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, file: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.category.trim()) {
      newErrors.category = '카테고리를 입력해주세요.';
    }
    if (!formData.marketName.trim()) {
      newErrors.marketName = '매장명을 입력해주세요.';
    }
    if (!formData.description.trim()) {
      newErrors.description = '매장 설명을 입력해주세요.';
    }
    if (!formData.address.trim()) {
      newErrors.address = '주소를 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('공감 매장 생성 실패:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-container">
          <div className="modal-header">
            <h2 className="modal-title">새 공감 매장 등록</h2>
            <button className="modal-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                카테고리 <span className="required">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="form-input"
              >
                {Object.entries(STORE_MAJOR_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span className="form-error">{errors.category}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                매장명 <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  name="marketName"
                  value={formData.marketName}
                  onChange={handleInputChange}
                  className={`form-input ${errors.marketName ? 'form-input--error' : ''}`}
                  placeholder="매장명을 입력하세요"
                />
                <button
                  type="button"
                  onClick={handleSearchByStoreName}
                  className="btn btn--secondary"
                  style={{ whiteSpace: 'nowrap', padding: '0 16px' }}
                >
                  매장 검색
                </button>
              </div>
              {errors.marketName && (
                <span className="form-error">{errors.marketName}</span>
              )}
            </div>

            <div className="form-group form-group--full">
              <label className="form-label">
                매장 설명 <span className="required">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className={`form-textarea ${errors.description ? 'form-input--error' : ''}`}
                placeholder="매장에 대한 간단한 설명을 입력하세요"
                rows={3}
              />
              {errors.description && (
                <span className="form-error">{errors.description}</span>
              )}
            </div>

            <div className="form-group form-group--full">
              <label className="form-label">
                주소 <span className="required">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className={`form-input ${errors.address ? 'form-input--error' : ''}`}
                placeholder="매장명으로 검색하거나 직접 입력하세요"
              />
              <p className="form-help">* 해당 주소로 어플 내 지도에 표시됩니다. 정확한 주소를 입력해주세요. (카카오맵 API 사용)</p>
              {errors.address && (
                <span className="form-error">{errors.address}</span>
              )}
            </div>

            <div className="form-group form-group--full">
              <label className="form-label">
                썸네일 이미지
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={`form-file ${errors.file ? 'form-input--error' : ''}`}
              />
              <p className="form-help">썸네일 이미지를 선택하세요.</p>
              {formData.file && (
                <div className="selected-images">
                  <div className="selected-image-item">
                    <img
                      src={URL.createObjectURL(formData.file)}
                      alt="썸네일"
                      className="selected-image-preview"
                    />
                    <div className="selected-image-info">
                      <span className="image-name">{formData.file.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="remove-image-btn"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
              {errors.file && (
                <span className="form-error">{errors.file}</span>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn--secondary"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '등록 중...' : '매장 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>

    {/* 매장 검색 결과 모달 */}
    {showSearchModal && (
      <div
        className="modal-overlay"
        onClick={() => setShowSearchModal(false)}
        style={{
          zIndex: 1001,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          className="modal-container"
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            backgroundColor: 'white',
            borderRadius: '12px',
            overflow: 'hidden'
          }}
        >
          <div className="modal-header">
            <h2 className="modal-title">매장 검색 결과 ({searchResults.length}개)</h2>
            <button className="modal-close-btn" onClick={() => setShowSearchModal(false)}>
              ✕
            </button>
          </div>
          <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto' }}>
            {searchResults.length > 0 ? (
              searchResults.map((place, index) => (
                <div
                  key={place.id || index}
                  style={{
                    padding: '16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: 'white'
                  }}
                  onClick={() => handleSelectPlace(place)}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px', color: '#1e293b' }}>
                    {place.place_name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>
                    📍 {place.road_address_name || place.address_name}
                  </div>
                  {place.category_name && (
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      🏷️ {place.category_name}
                    </div>
                  )}
                  {place.phone && (
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      📞 {place.phone}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#94a3b8'
              }}>
                검색 결과가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default CreateTempMarketModal;
