import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { couponApi } from '../api/coupon';
import type { CouponListItem } from '../types/coupon';

const CouponsPage: React.FC = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState<CouponListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'GIFT' | 'PAYBACK'>('GIFT');
  const [hasNext, setHasNext] = useState(false);
  const [cursor, setCursor] = useState<number | undefined>();
  const [selectedCoupons, setSelectedCoupons] = useState<Set<number>>(new Set());
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);

  const loadCoupons = async (reset = false) => {
    try {
      setLoading(true);
      const params = {
        pageSize: 30,
        cursor: reset ? undefined : cursor
      };

      let response;
      if (activeTab === 'GIFT') {
        response = await couponApi.getCoupons(params);
      } else {
        response = await couponApi.getPaybackCoupons(params);
      }

      if (reset) {
        setCoupons(response.response.couponResDtos as CouponListItem[]);
      } else {
        setCoupons(prev => [...prev, ...(response.response.couponResDtos as CouponListItem[])]);
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
    setCursor(undefined);
    setSelectedCoupons(new Set());
    loadCoupons(true);
  }, [activeTab]);

  const handleTabChange = (tab: 'GIFT' | 'PAYBACK') => {
    setActiveTab(tab);
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

  const handleToggleVisibility = async (couponId: number, isHidden: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    const action = isHidden ? '공개' : '숨김';

    try {
      if (activeTab === 'GIFT') {
        await couponApi.toggleGiftCouponVisibility(couponId);
      } else {
        await couponApi.togglePaybackCouponVisibility(couponId);
      }

      // 상태 업데이트
      setCoupons(prev => prev.map(coupon =>
        coupon.couponId === couponId
          ? { ...coupon, isHidden: !isHidden }
          : coupon
      ));

      alert(`쿠폰이 ${action} 처리되었습니다.`);
    } catch (err) {
      alert(`쿠폰 ${action} 처리에 실패했습니다.`);
      console.error('Failed to toggle coupon visibility:', err);
    }
  };

  const handleSelectCoupon = (couponId: number, checked: boolean) => {
    setSelectedCoupons(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(couponId);
      } else {
        newSet.delete(couponId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCoupons(new Set(coupons.map(coupon => coupon.couponId)));
    } else {
      setSelectedCoupons(new Set());
    }
  };

  const handleBatchDelete = () => {
    if (selectedCoupons.size === 0) {
      alert('삭제할 쿠폰을 선택해주세요.');
      return;
    }
    setShowBatchDeleteModal(true);
  };

  const confirmBatchDelete = async () => {
    const couponIds = Array.from(selectedCoupons);

    try {
      if (activeTab === 'GIFT') {
        await couponApi.deleteCoupons(couponIds);
      } else {
        await couponApi.deletePaybackCoupons(couponIds);
      }

      setCoupons(prev => prev.filter(coupon => !selectedCoupons.has(coupon.couponId)));
      setSelectedCoupons(new Set());
      setShowBatchDeleteModal(false);
      alert(`${couponIds.length}개의 쿠폰이 삭제되었습니다.`);
    } catch (err) {
      alert('일괄 삭제에 실패했습니다.');
      console.error('Failed to batch delete coupons:', err);
    }
  };

  const handleBatchToggleVisibility = async (hide: boolean) => {
    if (selectedCoupons.size === 0) {
      alert('선택된 쿠폰이 없습니다.');
      return;
    }

    const couponIds = Array.from(selectedCoupons);
    const action = hide ? '숨김' : '공개';

    if (!window.confirm(`선택된 ${couponIds.length}개의 쿠폰을 ${action} 처리하시겠습니까?`)) {
      return;
    }

    try {
      // 개별 처리를 순차적으로 실행
      for (const couponId of couponIds) {
        if (activeTab === 'GIFT') {
          await couponApi.toggleGiftCouponVisibility(couponId);
        } else {
          await couponApi.togglePaybackCouponVisibility(couponId);
        }
      }

      // 상태 업데이트 - 선택된 쿠폰들의 isHidden 상태를 토글
      setCoupons(prev => prev.map(coupon =>
        selectedCoupons.has(coupon.couponId)
          ? { ...coupon, isHidden: !coupon.isHidden }
          : coupon
      ));

      setSelectedCoupons(new Set());
      alert(`${couponIds.length}개의 쿠폰이 ${action} 처리되었습니다.`);
    } catch (err) {
      alert(`일괄 ${action} 처리에 실패했습니다.`);
      console.error('Failed to batch toggle coupon visibility:', err);
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
          <div className="header-actions">
            {selectedCoupons.size > 0 && (
              <>
                <button
                  className="btn btn-warning"
                  onClick={() => handleBatchToggleVisibility(true)}
                >
                  👁️‍🗨️ 선택 숨김 ({selectedCoupons.size})
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => handleBatchToggleVisibility(false)}
                >
                  👁️ 선택 공개 ({selectedCoupons.size})
                </button>
                <button className="btn btn-danger" onClick={handleBatchDelete}>
                  선택 삭제 ({selectedCoupons.size})
                </button>
              </>
            )}
            <button className="btn btn-primary" onClick={handleCreateCoupon}>
              쿠폰 생성
            </button>
          </div>
        </div>

        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'GIFT' ? 'active' : ''}`}
            onClick={() => handleTabChange('GIFT')}
          >
            증정 쿠폰
          </button>
          <button
            className={`tab-button ${activeTab === 'PAYBACK' ? 'active' : ''}`}
            onClick={() => handleTabChange('PAYBACK')}
          >
            환급 쿠폰
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="table-container">
          <table className="coupon-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedCoupons.size === coupons.length && coupons.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
                <th>순번</th>
                <th>쿠폰명</th>
                <th>설명</th>
                <th>매장명</th>
                {activeTab === 'GIFT' && <th>재고</th>}
                {activeTab === 'GIFT' && <th>마감일</th>}
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
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedCoupons.has(coupon.couponId)}
                      onChange={(e) => handleSelectCoupon(coupon.couponId, e.target.checked)}
                    />
                  </td>
                  <td>{coupons.indexOf(coupon) + 1}</td>
                  <td className="coupon-name">{coupon.couponName}</td>
                  <td className="coupon-description">
                    <div className="description-content">
                      {coupon.couponDescription}
                    </div>
                  </td>
                  <td className="market-name">{coupon.marketName}</td>
                  {activeTab === 'GIFT' && <td>{coupon.stock}개</td>}
                  {activeTab === 'GIFT' && <td>{formatDate(coupon.deadLine)}</td>}
                  <td>{getStatusBadge(coupon)}</td>
                  <td className="action-cell">
                    <div className="action-buttons">
                      <button
                        className={`btn btn-sm ${coupon.isHidden ? 'btn-success' : 'btn-warning'}`}
                        onClick={(e) => handleToggleVisibility(coupon.couponId, coupon.isHidden, e)}
                        title={coupon.isHidden ? '공개하기' : '숨기기'}
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
            <p>쿠폰이 없습니다.</p>
          </div>
        )}

        {showBatchDeleteModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>일괄 삭제 확인</h3>
              <p>
                선택한 <strong>{selectedCoupons.size}개의 쿠폰</strong>을 삭제하시겠습니까?
                <br />
                삭제된 쿠폰은 복구할 수 없습니다.
              </p>
              <div className="modal-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowBatchDeleteModal(false)}
                >
                  취소
                </button>
                <button className="btn btn-danger" onClick={confirmBatchDelete}>
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

export default CouponsPage;