import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { couponApi } from '../api/coupon';
import { storeAPI } from '../api/store';
import type { CreateCouponRequest } from '../types/coupon';
import type { Store } from '../types/store';

const CouponFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const preselectedMarketId = searchParams.get('marketId');

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCouponRequest>({
    couponName: '',
    couponDescription: '',
    deadLine: '',
    stock: 0,
    isHidden: false,
    isAvailable: true,
    isMemberIssued: false,
    couponType: 'GIFT',
    marketId: preselectedMarketId ? parseInt(preselectedMarketId) : 0
  });

  useEffect(() => {
    loadStores();
    if (isEdit && id) {
      loadCoupon(parseInt(id));
    }
  }, [isEdit, id]);

  const loadStores = async () => {
    try {
      const response = await storeAPI.getStores({ pageSize: 1000 });
      setStores(response.response.marketResDtos);
    } catch (err) {
      console.error('Failed to load stores:', err);
    }
  };

  const loadCoupon = async (couponId: number) => {
    try {
      setLoading(true);
      const response = await couponApi.getCoupon(couponId);
      const coupon = response.response;

      setFormData({
        couponName: coupon.couponName,
        couponDescription: coupon.couponDescription,
        deadLine: coupon.deadLine.split('T')[0], // Convert to date format for input
        stock: coupon.stock,
        isHidden: coupon.isHidden,
        isAvailable: coupon.isAvailable,
        isMemberIssued: coupon.isMemberIssued,
        couponType: coupon.couponType,
        marketId: coupon.marketId
      });
    } catch (err) {
      alert('쿠폰 정보를 불러오는데 실패했습니다.');
      navigate('/coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.couponName.trim()) {
      alert('쿠폰명을 입력해주세요.');
      return;
    }

    if (!formData.couponDescription.trim()) {
      alert('쿠폰 설명을 입력해주세요.');
      return;
    }

    if (!formData.deadLine) {
      alert('마감일을 선택해주세요.');
      return;
    }

    if (formData.stock <= 0) {
      alert('재고는 1개 이상이어야 합니다.');
      return;
    }

    if (formData.marketId === 0) {
      alert('매장을 선택해주세요.');
      return;
    }

    try {
      setLoading(true);

      // Convert date to ISO string
      const submitData = {
        ...formData,
        deadLine: new Date(formData.deadLine).toISOString()
      };

      if (isEdit && id) {
        await couponApi.updateCoupon(parseInt(id), submitData);
        alert('쿠폰이 수정되었습니다.');
      } else {
        await couponApi.createCoupon(submitData);
        alert('쿠폰이 생성되었습니다.');
      }

      navigate('/coupons');
    } catch (err) {
      alert(isEdit ? '쿠폰 수정에 실패했습니다.' : '쿠폰 생성에 실패했습니다.');
      console.error('Failed to save coupon:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCancel = () => {
    navigate('/coupons');
  };

  if (loading && isEdit) {
    return (
      <Layout>
        <div className="loading">로딩 중...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="coupon-form-page">
        <div className="page-header">
          <button className="btn btn-secondary" onClick={handleCancel}>
            ← 뒤로가기
          </button>
          <h1>{isEdit ? '쿠폰 수정' : '쿠폰 생성'}</h1>
        </div>

        <form className="coupon-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="couponName">쿠폰명 *</label>
            <input
              type="text"
              id="couponName"
              name="couponName"
              value={formData.couponName}
              onChange={handleInputChange}
              placeholder="쿠폰명을 입력하세요"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="couponDescription">쿠폰 설명 *</label>
            <textarea
              id="couponDescription"
              name="couponDescription"
              value={formData.couponDescription}
              onChange={handleInputChange}
              placeholder="쿠폰 설명을 입력하세요"
              rows={4}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="couponType">쿠폰 타입 *</label>
            <select
              id="couponType"
              name="couponType"
              value={formData.couponType}
              onChange={handleInputChange}
              required
            >
              <option value="GIFT">증정쿠폰</option>
              <option value="PAYBACK">환급쿠폰</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="marketId">매장 *</label>
            <select
              id="marketId"
              name="marketId"
              value={formData.marketId}
              onChange={handleInputChange}
              required
            >
              <option value={0}>매장을 선택하세요</option>
              {stores.map(store => (
                <option key={store.marketId} value={store.marketId}>
                  {store.marketName} - {store.address}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="stock">재고 *</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="deadLine">마감일 *</label>
              <input
                type="date"
                id="deadLine"
                name="deadLine"
                value={formData.deadLine}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleInputChange}
                />
                활성화
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isHidden"
                  checked={formData.isHidden}
                  onChange={handleInputChange}
                />
                숨김
              </label>

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isMemberIssued"
                  checked={formData.isMemberIssued}
                  onChange={handleInputChange}
                />
                회원 발급
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '저장 중...' : (isEdit ? '수정' : '생성')}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CouponFormPage;