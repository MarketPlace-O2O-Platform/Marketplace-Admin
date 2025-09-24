import React, { useState } from 'react';
import type { CreateStoreRequest } from '../types/store';
import { STORE_MAJOR_LABELS } from '../types/store';
import './CreateStoreModal.css';

interface CreateStoreModalProps {
  onClose: () => void;
  onSubmit: (data: CreateStoreRequest) => Promise<void>;
}

const CreateStoreModal: React.FC<CreateStoreModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateStoreRequest>({
    marketName: '',
    description: '',
    operationHours: '',
    closedDays: '',
    phoneNumber: '',
    address: '',
    major: 'FOOD',
    images: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newFiles] }));

    if (errors.images) {
      setErrors(prev => ({ ...prev, images: '' }));
    }

    // 파일 입력 초기화하여 같은 파일을 다시 선택할 수 있게 함
    e.target.value = '';
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.marketName.trim()) {
      newErrors.marketName = '매장명을 입력해주세요.';
    }
    if (!formData.description.trim()) {
      newErrors.description = '매장 설명을 입력해주세요.';
    }
    if (!formData.operationHours.trim()) {
      newErrors.operationHours = '운영시간을 입력해주세요.';
    }
    if (!formData.closedDays.trim()) {
      newErrors.closedDays = '휴무일을 입력해주세요.';
    }
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = '전화번호를 입력해주세요.';
    } else if (!/^[\d-\s()]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = '올바른 전화번호 형식이 아닙니다.';
    }
    if (!formData.address.trim()) {
      newErrors.address = '주소를 입력해주세요.';
    }
    if (!formData.images || formData.images.length === 0) {
      newErrors.images = '최소 1개의 매장 이미지를 업로드해주세요.';
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
      console.error('매장 생성 실패:', error);
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
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">새 매장 등록</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">
                매장명 <span className="required">*</span>
              </label>
              <input
                type="text"
                name="marketName"
                value={formData.marketName}
                onChange={handleInputChange}
                className={`form-input ${errors.marketName ? 'form-input--error' : ''}`}
                placeholder="매장명을 입력하세요"
              />
              {errors.marketName && (
                <span className="form-error">{errors.marketName}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                업종 <span className="required">*</span>
              </label>
              <select
                name="major"
                value={formData.major}
                onChange={handleInputChange}
                className="form-input"
              >
                {Object.entries(STORE_MAJOR_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
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

            <div className="form-group">
              <label className="form-label">
                운영시간 <span className="required">*</span>
              </label>
              <input
                type="text"
                name="operationHours"
                value={formData.operationHours}
                onChange={handleInputChange}
                className={`form-input ${errors.operationHours ? 'form-input--error' : ''}`}
                placeholder="예: 09:00-21:00"
              />
              {errors.operationHours && (
                <span className="form-error">{errors.operationHours}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                휴무일 <span className="required">*</span>
              </label>
              <input
                type="text"
                name="closedDays"
                value={formData.closedDays}
                onChange={handleInputChange}
                className={`form-input ${errors.closedDays ? 'form-input--error' : ''}`}
                placeholder="예: 일요일, 없음"
              />
              {errors.closedDays && (
                <span className="form-error">{errors.closedDays}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                전화번호 <span className="required">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className={`form-input ${errors.phoneNumber ? 'form-input--error' : ''}`}
                placeholder="예: 032-123-4567"
              />
              {errors.phoneNumber && (
                <span className="form-error">{errors.phoneNumber}</span>
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
                placeholder="전체 주소를 입력하세요"
              />
              {errors.address && (
                <span className="form-error">{errors.address}</span>
              )}
            </div>

            <div className="form-group form-group--full">
              <label className="form-label">
                매장 이미지 <span className="required">*</span>
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className={`form-file ${errors.images ? 'form-input--error' : ''}`}
              />
              <p className="form-help">여러 이미지를 선택하거나 한 번에 하나씩 추가할 수 있습니다.</p>
              {formData.images && formData.images.length > 0 && (
                <div className="selected-images">
                  {Array.from(formData.images).map((file, index) => (
                    <div key={index} className="selected-image-item">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`이미지 ${index + 1}`}
                        className="selected-image-preview"
                      />
                      <div className="selected-image-info">
                        <span className="image-name">{file.name}</span>
                        <span className="image-order">#{index + 1}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="remove-image-btn"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.images && (
                <span className="form-error">{errors.images}</span>
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
  );
};

export default CreateStoreModal;