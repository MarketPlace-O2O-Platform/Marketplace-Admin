import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { couponApi } from '../api/coupon';
import type { CouponListItem, CouponType } from '../types/coupon';

const CouponsPage: React.FC = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<CouponListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<CouponType | 'ALL'>('ALL');
  const [hasNext, setHasNext] = useState(false);
  const [cursor, setCursor] = useState<number | undefined>();

  const loadCoupons = async (reset = false) => {
    try {
      setLoading(true);
      const params = {
        pageSize: 10,
        cursor: reset ? undefined : cursor,
        couponType: selectedType === 'ALL' ? undefined : selectedType
      };

      const response = await couponApi.getCoupons(params);

      if (reset) {
        setCoupons(response.response.couponResDtos);
      } else {
        setCoupons(prev => [...prev, ...response.response.couponResDtos]);
      }

      setHasNext(response.response.hasNext);

      // Set cursor to the last coupon's ID for pagination
      if (response.response.couponResDtos.length > 0) {
        setCursor(response.response.couponResDtos[response.response.couponResDtos.length - 1].couponId);
      }
    } catch (err) {
      setError('쿠폰 목록을 불러오는데 실패했습니다.');
      console.error('Failed to load coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons(true);
  }, [selectedType]);

  const handleTypeChange = (type: CouponType | 'ALL') => {
    setSelectedType(type);
    setCursor(undefined);
  };

  const handleLoadMore = () => {
    if (hasNext && !loading) {
      loadCoupons(false);
    }
  };

  const handleCreateCoupon = () => {
    navigate('/coupons/create');
  };

  const handleCouponClick = (couponId: number) => {
    navigate(`/coupons/${couponId}`);
  };

  const handleEditCoupon = (couponId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/coupons/${couponId}/edit`);
  };

  const handleDeleteCoupon = async (couponId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('정말로 이 쿠폰을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await couponApi.deleteCoupon(couponId);
      setCoupons(prev => prev.filter(coupon => coupon.couponId !== couponId));
      alert('쿠폰이 삭제되었습니다.');
    } catch (err) {
      alert('쿠폰 삭제에 실패했습니다.');
      console.error('Failed to delete coupon:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getStatusBadge = (coupon: CouponListItem) => {
    if (coupon.isHidden) {
      return <span className="badge badge-warning">숨김</span>;
    }
    return <span className="badge badge-success">활성</span>;
  };

  return (
    <Layout>
      <div className="coupons-page">
        <div className="page-header">
          <h1>쿠폰 관리</h1>
          <button className="btn btn-primary" onClick={handleCreateCoupon}>
            쿠폰 생성
          </button>
        </div>

        <div className="filters">
          <div className="filter-group">
            <label>쿠폰 타입:</label>
            <select
              value={selectedType}
              onChange={(e) => handleTypeChange(e.target.value as CouponType | 'ALL')}
            >
              <option value="ALL">전체</option>
              <option value="GIFT">증정쿠폰</option>
              <option value="PAYBACK">환급쿠폰</option>
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="table-container">
          <table className="coupon-table">
            <thead>
              <tr>
                <th>쿠폰 ID</th>
                <th>쿠폰명</th>
                <th>설명</th>
                <th>매장명</th>
                <th>재고</th>
                <th>마감일</th>
                <th>상태</th>
                <th>액션</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr
                  key={coupon.couponId}
                  className="coupon-row"
                  onClick={() => handleCouponClick(coupon.couponId)}
                >
                  <td>{coupon.couponId}</td>
                  <td className="coupon-name">{coupon.couponName}</td>
                  <td className="coupon-description">
                    <div className="description-content">
                      {coupon.couponDescription}
                    </div>
                  </td>
                  <td className="market-name">{coupon.marketName}</td>
                  <td>{coupon.stock}개</td>
                  <td>{formatDate(coupon.deadLine)}</td>
                  <td>{getStatusBadge(coupon)}</td>
                  <td className="action-cell">
                    <div className="action-buttons">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={(e) => handleEditCoupon(coupon.couponId, e)}
                      >
                        수정
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={(e) => handleDeleteCoupon(coupon.couponId, e)}
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && <div className="loading">로딩 중...</div>}

        {hasNext && !loading && (
          <div className="load-more">
            <button className="btn btn-outline-primary" onClick={handleLoadMore}>
              더 보기
            </button>
          </div>
        )}

        {!loading && coupons.length === 0 && (
          <div className="empty-state">
            <p>쿠폰이 없습니다.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CouponsPage;