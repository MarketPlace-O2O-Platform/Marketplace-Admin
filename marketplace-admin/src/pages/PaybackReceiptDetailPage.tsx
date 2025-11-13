import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { couponApi } from '../api/coupon';
import type { PaybackReceiptDetail } from '../types/coupon';
import './PaybackReceiptDetailPage.css';

const PaybackReceiptDetailPage: React.FC = () => {
  const { memberPaybackId } = useParams<{ memberPaybackId: string }>();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<PaybackReceiptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (memberPaybackId) {
      loadReceiptDetail();
    }
  }, [memberPaybackId]);

  const loadReceiptDetail = async () => {
    try {
      setLoading(true);
      const response = await couponApi.getPaybackReceiptDetail(Number(memberPaybackId));
      setReceipt(response.response);
    } catch (err) {
      setError('영수증 상세 정보를 불러오는데 실패했습니다.');
      console.error('Failed to load receipt detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompletePayback = async () => {
    if (!receipt || receipt.isPayback) {
      return;
    }

    if (!window.confirm('환급 처리를 완료하시겠습니까?')) {
      return;
    }

    try {
      setProcessing(true);
      await couponApi.completePayback(Number(memberPaybackId));
      alert('환급 처리가 완료되었습니다.');
      // Reload to show updated status
      await loadReceiptDetail();
    } catch (err) {
      alert('환급 처리에 실패했습니다.');
      console.error('Failed to complete payback:', err);
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const getReceiptImageUrl = (filename: string) => {
    if (filename.startsWith('http')) {
      return filename;
    }
    return `${import.meta.env.VITE_API_BASE_URL || 'https://marketplace.inuappcenter.kr'}/image/receipt/${filename}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">로딩 중...</div>
      </Layout>
    );
  }

  if (error || !receipt) {
    return (
      <Layout>
        <div className="error-message">{error || '영수증을 찾을 수 없습니다.'}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="receipt-detail-page">
        <div className="page-header">
          <h1>환급 쿠폰 영수증 상세</h1>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/payback-receipts')}>
              목록으로
            </button>
            {!receipt.isPayback && (
              <button
                className="btn btn-primary"
                onClick={handleCompletePayback}
                disabled={processing}
              >
                {processing ? '처리 중...' : '환급 처리 완료'}
              </button>
            )}
          </div>
        </div>

        <div className="detail-container">
          <div className="detail-section">
            <h2>기본 정보</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <label>회원 ID</label>
                <div>{receipt.memberId}</div>
              </div>
              <div className="detail-item">
                <label>쿠폰명</label>
                <div>{receipt.couponName}</div>
              </div>
              <div className="detail-item">
                <label>발급일시</label>
                <div>{formatDate(receipt.issuedAt)}</div>
              </div>
              <div className="detail-item">
                <label>영수증 제출일시</label>
                <div>{formatDate(receipt.receiptSubmittedAt)}</div>
              </div>
              <div className="detail-item">
                <label>환급 여부</label>
                <div>
                  {receipt.isPayback ? (
                    <span className="badge badge-success">환급 완료</span>
                  ) : (
                    <span className="badge badge-warning">환급 대기</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="detail-row-container">
            <div className="detail-section">
              <h2>계좌 정보</h2>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>은행</label>
                  <div>{receipt.account}</div>
                </div>
                <div className="detail-item">
                  <label>계좌번호</label>
                  <div>{receipt.accountNumber}</div>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h2>영수증 이미지</h2>
              <div className="receipt-image-container">
                <img
                  src={getReceiptImageUrl(receipt.receipt)}
                  alt="영수증"
                  className="receipt-image"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x600?text=No+Image';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaybackReceiptDetailPage;