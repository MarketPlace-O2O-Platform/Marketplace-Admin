import React, { useState, useEffect } from 'react';
import type { StoreDetail, StoreMajor, UpdateStoreRequest } from '../types/store';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
              <input
                type="text"
                id="marketName"
                name="marketName"
                value={formData.marketName}
                onChange={handleChange}
                required
              />
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
              required
            />
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
  );
};

export default EditStoreModal;