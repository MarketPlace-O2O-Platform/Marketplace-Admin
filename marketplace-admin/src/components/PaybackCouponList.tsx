import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { couponApi } from '../api/coupon';
import type { PaybackCouponListItem } from '../types/coupon';

interface PaybackCouponListProps {
  marketId: number;
  marketName: string;
}

const PaybackCouponList: React.FC<PaybackCouponListProps> = ({ marketId, marketName }) => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<PaybackCouponListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [cursor, setCursor] = useState<number | undefined>();
  const [selectedCoupons, setSelectedCoupons] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadCoupons(true);
  }, [marketId]);

  const loadCoupons = async (reset = false) => {
    try {
      setLoading(true);
      const params = {
        pageSize: 30,
        cursor: reset ? undefined : cursor,
        marketId
      };

      const response = await couponApi.getPaybackCouponsByMarket(marketId, params);

      if (reset) {
        setCoupons(response.response.couponResDtos);
      } else {
        setCoupons(prev => [...prev, ...response.response.couponResDtos]);
      }

      setHasNext(response.response.hasNext);

      if (response.response.couponResDtos.length > 0) {
        setCursor(response.response.couponResDtos[response.response.couponResDtos.length - 1].couponId);
      }
    } catch (err) {
      setError('환급쿠폰 목록을 불러오는데 실패했습니다.');
      console.error('Failed to load payback coupons:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasNext && !loading) {
      loadCoupons(false);
    }
  };

  const handleCreateCoupon = () => {
    navigate(`/coupons/create?marketId=${marketId}&couponType=PAYBACK`);
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
    if (!window.confirm('정말로 이 환급쿠폰을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await couponApi.deleteCoupon(couponId);
      setCoupons(prev => prev.filter(coupon => coupon.couponId !== couponId));
      alert('환급쿠폰이 삭제되었습니다.');
    } catch (err) {
      alert('환급쿠폰 삭제에 실패했습니다.');
      console.error('Failed to delete payback coupon:', err);
    }
  };

  const handleCheckboxChange = (couponId: number, checked: boolean) => {
    if (checked) {
      setSelectedCoupons(prev => [...prev, couponId]);
    } else {
      setSelectedCoupons(prev => prev.filter(id => id !== couponId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCoupons(coupons.map(coupon => coupon.couponId));
    } else {
      setSelectedCoupons([]);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCoupons.length === 0) {
      alert('삭제할 쿠폰을 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택된 ${selectedCoupons.length}개의 환급쿠폰을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await couponApi.deletePaybackCoupons(selectedCoupons);
      setCoupons(prev => prev.filter(coupon => !selectedCoupons.includes(coupon.couponId)));
      setSelectedCoupons([]);
      alert(`${selectedCoupons.length}개의 환급쿠폰이 삭제되었습니다.`);
    } catch (err) {
      alert('쿠폰 일괄 삭제에 실패했습니다.');
      console.error('Failed to bulk delete coupons:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (coupon: PaybackCouponListItem) => {
    if (coupon.isHidden) {
      return <span className="badge badge-warning">숨김</span>;
    }
    return <span className="badge badge-success">활성</span>;
  };

  const getMemberIssuedBadge = (isMemberIssued: boolean | null) => {
    if (isMemberIssued === null) {
      return <span className="badge badge-secondary">미설정</span>;
    }
    return isMemberIssued ?
      <span className="badge badge-info">회원발급</span> :
      <span className="badge badge-secondary">일반발급</span>;
  };

  return (
    <div className="payback-coupon-list">
      <div className="section-header">
        <h3>{marketName} 환급쿠폰</h3>
        <div className="header-actions">
          {selectedCoupons.length > 0 && (
            <button
              className="btn btn-danger"
              onClick={handleBulkDelete}
              disabled={isDeleting}
            >
              {isDeleting ? '삭제 중...' : `선택된 ${selectedCoupons.length}개 삭제`}
            </button>
          )}
          <button className="btn btn-primary" onClick={handleCreateCoupon}>
            환급쿠폰 생성
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="table-container">
        <table className="coupon-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedCoupons.length > 0 && selectedCoupons.length === coupons.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th>쿠폰 ID</th>
              <th>쿠폰명</th>
              <th>설명</th>
              <th>상태</th>
              <th>회원발급</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr
                key={coupon.couponId}
                className="coupon-row"
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selectedCoupons.includes(coupon.couponId)}
                    onChange={(e) => handleCheckboxChange(coupon.couponId, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td onClick={() => handleCouponClick(coupon.couponId)}>{coupon.couponId}</td>
                <td className="coupon-name" onClick={() => handleCouponClick(coupon.couponId)}>{coupon.couponName}</td>
                <td className="coupon-description" onClick={() => handleCouponClick(coupon.couponId)}>
                  <div className="description-content">
                    {coupon.couponDescription}
                  </div>
                </td>
                <td onClick={() => handleCouponClick(coupon.couponId)}>{getStatusBadge(coupon)}</td>
                <td onClick={() => handleCouponClick(coupon.couponId)}>{getMemberIssuedBadge(coupon.isMemberIssued)}</td>
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
          <p>이 매장의 환급쿠폰이 없습니다.</p>
          <button className="btn btn-primary" onClick={handleCreateCoupon}>
            첫 번째 환급쿠폰 생성하기
          </button>
        </div>
      )}
    </div>
  );
};

export default PaybackCouponList;