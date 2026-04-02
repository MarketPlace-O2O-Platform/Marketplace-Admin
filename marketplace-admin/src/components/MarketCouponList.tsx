import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { couponApi } from '../api/coupon';
import type { CouponListItem } from '../types/coupon';
import PaybackCouponList from './PaybackCouponList';

interface MarketCouponListProps {
  marketId: number;
  marketName: string;
}

// 기존 증정쿠폰 컴포넌트를 분리
const GiftCouponList: React.FC<MarketCouponListProps> = ({ marketId }) => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<CouponListItem[]>([]);
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

      const response = await couponApi.getCoupons(params);

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
      setError('증정쿠폰 목록을 불러오는데 실패했습니다.');
      console.error('Failed to load gift coupons:', err);
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
    navigate(`/coupons/create?marketId=${marketId}&couponType=GIFT`);
  };

  const handleCouponClick = (couponId: number) => {
    navigate(`/coupons/${couponId}?from=store&marketId=${marketId}`);
  };

  const handleEditCoupon = (couponId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/coupons/${couponId}/edit?from=store&marketId=${marketId}`);
  };

  const handleDeleteCoupon = async (couponId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('정말로 이 증정쿠폰을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await couponApi.deleteCoupon(couponId);
      setCoupons(prev => prev.filter(coupon => coupon.couponId !== couponId));
      alert('증정쿠폰이 삭제되었습니다.');
    } catch (err) {
      alert('증정쿠폰 삭제에 실패했습니다.');
      console.error('Failed to delete gift coupon:', err);
    }
  };

  const handleToggleVisibility = async (couponId: number, isHidden: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    const action = isHidden ? '공개' : '숨김';
    if (!window.confirm(`이 증정쿠폰을 ${action} 처리하시겠습니까?`)) {
      return;
    }

    try {
      await couponApi.toggleGiftCouponVisibility(couponId);
      setCoupons(prev => prev.map(coupon =>
        coupon.couponId === couponId
          ? { ...coupon, isHidden: !isHidden }
          : coupon
      ));
      alert(`증정쿠폰이 ${action} 처리되었습니다.`);
    } catch (err) {
      alert(`증정쿠폰 ${action} 처리에 실패했습니다.`);
      console.error('Failed to toggle gift coupon visibility:', err);
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

    if (!window.confirm(`선택된 ${selectedCoupons.length}개의 증정쿠폰을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      await couponApi.deleteCoupons(selectedCoupons);
      setCoupons(prev => prev.filter(coupon => !selectedCoupons.includes(coupon.couponId)));
      setSelectedCoupons([]);
      alert(`${selectedCoupons.length}개의 증정쿠폰이 삭제되었습니다.`);
    } catch (err) {
      alert('쿠폰 일괄 삭제에 실패했습니다.');
      console.error('Failed to bulk delete coupons:', err);
    } finally {
      setIsDeleting(false);
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
    <div className="gift-coupon-list">
      <div className="section-header">
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
            증정쿠폰 생성
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
              <th>순번</th>
              <th>쿠폰명</th>
              <th>설명</th>
              <th>재고</th>
              <th>마감일</th>
              <th>상태</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon, index) => (
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
                <td onClick={() => handleCouponClick(coupon.couponId)}>{index + 1}</td>
                <td className="coupon-name" onClick={() => handleCouponClick(coupon.couponId)}>{coupon.couponName}</td>
                <td className="coupon-description" onClick={() => handleCouponClick(coupon.couponId)}>
                  <div className="description-content">
                    {coupon.couponDescription}
                  </div>
                </td>
                <td onClick={() => handleCouponClick(coupon.couponId)}>{coupon.stock}개</td>
                <td onClick={() => handleCouponClick(coupon.couponId)}>{formatDate(coupon.deadLine)}</td>
                <td onClick={() => handleCouponClick(coupon.couponId)}>{getStatusBadge(coupon)}</td>
                <td className="action-cell">
                  <div className="action-buttons">
                    <button
                      className={`btn btn-sm ${coupon.isHidden ? 'btn-success' : 'btn-warning'}`}
                      onClick={(e) => handleToggleVisibility(coupon.couponId, coupon.isHidden, e)}
                      title={coupon.isHidden ? '공개' : '숨기기'}
                    >
                      {coupon.isHidden ? '👁️' : '👁️‍🗨️'}
                    </button>
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
          <p>이 매장의 증정쿠폰이 없습니다.</p>
          <button className="btn btn-primary" onClick={handleCreateCoupon}>
            첫 번째 증정쿠폰 생성하기
          </button>
        </div>
      )}
    </div>
  );
};

// 메인 컴포넌트에서 탭 관리
const MarketCouponList: React.FC<MarketCouponListProps> = ({ marketId, marketName }) => {
  const [activeTab, setActiveTab] = useState<'gift' | 'payback'>('gift');

  return (
    <div className="market-coupon-list">
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'gift' ? 'active' : ''}`}
          onClick={() => setActiveTab('gift')}
        >
          증정쿠폰
        </button>
        <button
          className={`tab-button ${activeTab === 'payback' ? 'active' : ''}`}
          onClick={() => setActiveTab('payback')}
        >
          환급쿠폰
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'gift' && (
          <GiftCouponList marketId={marketId} marketName={marketName} />
        )}
        {activeTab === 'payback' && (
          <PaybackCouponList marketId={marketId} marketName={marketName} />
        )}
      </div>
    </div>
  );
};

export default MarketCouponList;