import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { couponApi } from '../api/coupon';
import type { Coupon, PaybackCoupon } from '../types/coupon';
import { COUPON_TYPE_LABELS } from '../types/coupon';

const CouponDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [coupon, setCoupon] = useState<Coupon | PaybackCoupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fromStore = searchParams.get('from') === 'store';
  const returnMarketId = searchParams.get('marketId');

  useEffect(() => {
    if (id) {
      loadCoupon(parseInt(id));
    }
  }, [id]);

  const loadCoupon = async (couponId: number) => {
    try {
      setLoading(true);

      // 먼저 환급쿠폰 API로 시도 (실제로는 증정쿠폰 데이터)
      try {
        const response = await couponApi.getPaybackCoupon(couponId);
        setCoupon(response.response);
        return;
      } catch (err) {
        // 환급쿠폰 API 실패시 일반쿠폰 API로 시도 (실제로는 환급쿠폰 데이터)
        console.log('환급쿠폰 API 실패, 일반쿠폰 API로 시도');
      }

      // 일반쿠폰 API로 시도
      try {
        const response = await couponApi.getCoupon(couponId);
        setCoupon(response.response);
        return;
      } catch (err) {
        console.log('일반쿠폰 API도 실패');
        throw err;
      }

    } catch (err) {
      setError('쿠폰 정보를 불러오는데 실패했습니다.');
      console.error('Failed to load coupon:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (fromStore && returnMarketId) {
      navigate(`/coupons/${id}/edit?from=store&marketId=${returnMarketId}`);
    } else {
      navigate(`/coupons/${id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!coupon || !window.confirm('정말로 이 쿠폰을 삭제하시겠습니까?')) {
      return;
    }

    try {
      if (isGiftCoupon(coupon)) {
        await couponApi.deleteCoupon(coupon.couponId);
      } else {
        await couponApi.deletePaybackCoupon(coupon.couponId);
      }
      alert('쿠폰이 삭제되었습니다.');

      if (fromStore && returnMarketId) {
        navigate(`/stores/${returnMarketId}?tab=coupons`);
      } else {
        navigate('/coupons');
      }
    } catch (err) {
      alert('쿠폰 삭제에 실패했습니다.');
      console.error('Failed to delete coupon:', err);
    }
  };

  const handleToggleVisibility = async () => {
    if (!coupon) return;

    const action = coupon.isHidden ? '공개' : '숨김';
    if (!window.confirm(`이 쿠폰을 ${action} 처리하시겠습니까?`)) {
      return;
    }

    try {
      if (isGiftCoupon(coupon)) {
        await couponApi.toggleGiftCouponVisibility(coupon.couponId);
      } else {
        await couponApi.togglePaybackCouponVisibility(coupon.couponId);
      }

      // 상태 업데이트
      setCoupon(prev => prev ? { ...prev, isHidden: !prev.isHidden } : null);
      alert(`쿠폰이 ${action} 처리되었습니다.`);
    } catch (err) {
      alert(`쿠폰 ${action} 처리에 실패했습니다.`);
      console.error('Failed to toggle coupon visibility:', err);
    }
  };

  const handleBack = () => {
    if (fromStore && returnMarketId) {
      navigate(`/stores/${returnMarketId}?tab=coupons`);
    } else {
      navigate('/coupons');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const getStatusBadge = (coupon: Coupon | PaybackCoupon) => {
    // 환급쿠폰의 경우 isAvailable 필드가 없음
    if ('isAvailable' in coupon && !coupon.isAvailable) {
      return <span className="badge badge-danger">비활성</span>;
    }
    if (coupon.isHidden) {
      return <span className="badge badge-warning">숨김</span>;
    }
    return <span className="badge badge-success">활성</span>;
  };

  const getUsageRate = (coupon: Coupon) => {
    if (!coupon.stock || coupon.stock === 0) return 0;
    if (!coupon.issuedCount) return 0;
    return Math.round((coupon.issuedCount / coupon.stock) * 100);
  };

  const isGiftCoupon = (coupon: Coupon | PaybackCoupon): coupon is Coupon => {
    return coupon.couponType === 'GIFT';
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">로딩 중...</div>
      </Layout>
    );
  }

  if (error || !coupon) {
    return (
      <Layout>
        <div className="error-page">
          <h2>오류</h2>
          <p>{error || '쿠폰을 찾을 수 없습니다.'}</p>
          <button className="btn btn-primary" onClick={handleBack}>
            목록으로 돌아가기
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="coupon-detail-page">
        <div className="page-header">
          <button className="btn btn-secondary" onClick={handleBack}>
            ← 뒤로가기
          </button>
          <h1>쿠폰 상세정보</h1>
          <div className="actions" style={{ display: 'flex', gap: '12px' }}>
            <button
              className={`btn ${coupon.isHidden ? 'btn-success' : 'btn-warning'}`}
              onClick={handleToggleVisibility}
            >
              {coupon.isHidden ? '👁️ 공개' : '👁️‍🗨️ 숨기기'}
            </button>
            <button className="btn btn-primary" onClick={handleEdit}>
              수정
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              삭제
            </button>
          </div>
        </div>

        <div className="coupon-detail-content">
          <div className="detail-section">
            <div className="section-header">
              <h2>{coupon.couponName}</h2>
              <div className="badges">
                <span className="badge badge-info">
                  {COUPON_TYPE_LABELS[coupon.couponType] || coupon.couponType || '쿠폰'}
                </span>
                {coupon.isHidden ? (
                  <span className="badge badge-warning">숨김</span>
                ) : (
                  <span className="badge badge-success">활성</span>
                )}
              </div>
            </div>

            <div className="detail-grid" style={{ gap: '16px' }}>
              <div className="detail-item">
                <label>쿠폰 설명</label>
                <div className="description">{coupon.couponDescription}</div>
              </div>

              <div className="detail-row" style={{ gap: '16px' }}>
                <div className="detail-item">
                  <label>매장명</label>
                  <span>{coupon.marketName}</span>
                </div>
                <div className="detail-item">
                  <label>쿠폰 ID</label>
                  <span>#{coupon.couponId}</span>
                </div>
              </div>

              {/* 증정쿠폰의 경우에만 재고/마감일 표시 */}
              {isGiftCoupon(coupon) && (
                <>
                  <div className="detail-row" style={{ gap: '16px' }}>
                    <div className="detail-item">
                      <label>마감일</label>
                      <span>{formatDateOnly(coupon.deadLine)}</span>
                    </div>
                    <div className="detail-item">
                      <label>총 재고</label>
                      <span>{coupon.stock?.toLocaleString() || 0}개</span>
                    </div>
                  </div>

                  <div className="detail-row" style={{ gap: '16px' }}>
                    <div className="detail-item">
                      <label>발급 수량</label>
                      <span>{coupon.issuedCount?.toLocaleString() || 0}개</span>
                    </div>
                    <div className="detail-item">
                      <label>남은 재고</label>
                      <span>{((coupon.stock || 0) - (coupon.issuedCount || 0)).toLocaleString()}개</span>
                    </div>
                  </div>

                  <div className="detail-item">
                    <label>사용률</label>
                    <div className="usage-rate">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${getUsageRate(coupon)}%` }}
                        />
                      </div>
                      <span className="percentage">{getUsageRate(coupon)}%</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {isGiftCoupon(coupon) && coupon.thumbnail && (
            <div className="detail-section">
              <h3>썸네일</h3>
              <div className="thumbnail-container">
                <img
                  src={coupon.thumbnail}
                  alt="쿠폰 썸네일"
                  className="coupon-thumbnail"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CouponDetailPage;