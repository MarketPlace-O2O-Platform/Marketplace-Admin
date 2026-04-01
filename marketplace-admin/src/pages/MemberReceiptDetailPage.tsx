import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { couponApi } from '../api/coupon';
import './MemberReceiptDetailPage.css';

interface Receipt {
  memberPaybackId: number;
  couponName: string;
  issuedAt: string;
  receiptSubmittedAt: string;
  receipt: string;
  isPayback: boolean;
}

interface MemberReceiptData {
  memberId: number;
  account: string;
  accountNumber: string;
  receipts: Receipt[];
}

const MemberReceiptDetailPage: React.FC = () => {
  const { memberId } = useParams<{ memberId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<MemberReceiptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadMemberReceipts();
  }, [memberId]);

  const loadMemberReceipts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('marketplace_admin_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'https://marketplace.inuappcenter.kr'}/api/admins/payback-coupons/receipts/members/${memberId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const result = await response.json();
      setData(result.response);
      setError('');
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error('회원 영수증 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleReceiptClick = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
  };

  const handlePaybackReceiptClick = (memberPaybackId: number) => {
    navigate(`/payback-receipts/${memberPaybackId}`);
  };

  const handleQuickComplete = async (memberPaybackId: number) => {
    if (!window.confirm('이 영수증에 대한 환급 처리를 완료하시겠습니까?')) {
      return;
    }

    try {
      setProcessingId(memberPaybackId);
      await couponApi.completePayback(memberPaybackId);
      alert('환급 처리가 완료되었습니다.');
      await loadMemberReceipts(); // 데이터 갱신
      setSelectedReceipt(null); // 모달 닫기
    } catch (err) {
      alert('환급 처리에 실패했습니다.');
      console.error('Quick payback failed:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const getImageUrl = (receiptUrl: string) => {
    if (!receiptUrl) return '';
    if (receiptUrl.startsWith('http')) return receiptUrl;
    return `${import.meta.env.VITE_API_BASE_URL || 'https://marketplace.inuappcenter.kr'}/image/receipt/${receiptUrl}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('계좌번호가 복사되었습니다.');
    }).catch(() => {
      alert('복사에 실패했습니다.');
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="member-receipt-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="member-receipt-container">
          <div className="error-message">
            <h3>데이터 로드 실패</h3>
            <p>{error || '데이터를 찾을 수 없습니다.'}</p>
            <button onClick={loadMemberReceipts} className="btn btn-primary">다시 시도</button>
          </div>
        </div>
      </Layout>
    );
  }

  // 환급 완료/대기로 그룹화
  const completedReceipts = data.receipts.filter(r => r.isPayback);
  const pendingReceipts = data.receipts.filter(r => !r.isPayback);

  return (
    <Layout>
      <div className="member-receipt-container">
        <header className="dashboard-header">
          <div className="header-left">
            <button onClick={() => navigate(-1)} className="btn-back">
              ←
            </button>
            <div>
              <h1 className="dashboard-title">회원 영수증 상세</h1>
              <p className="dashboard-subtitle">회원 학번(ID): <strong>{data.memberId}</strong></p>
            </div>
          </div>
        </header>

        <div className="summary-compact-grid">
          <div className="compact-card info-card">
            <div className="compact-card-header">
              <h3 className="card-title">계좌 정보</h3>
              <span className="compact-icon">💳</span>
            </div>
            <div className="account-info-content">
              <div className="info-row">
                <span className="info-label">은행</span>
                <span className="info-value">{data.account}</span>
              </div>
              <div className="info-row">
                <div className="account-number-wrapper">
                  <span className="info-label">계좌번호</span>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(data.accountNumber)}
                    title="계좌번호 복사"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
                <span className="info-value highlight">{data.accountNumber}</span>
              </div>
            </div>
          </div>

          <div className="compact-card stat-card pending">
            <div className="compact-card-header">
              <h3 className="card-title">환급 대기</h3>
              <span className="compact-icon warning">⏳</span>
            </div>
            <div className="stat-content">
              <p className="metric-value-sm color-warning">{pendingReceipts.length}</p>
              <span className="metric-unit">건</span>
            </div>
          </div>

          <div className="compact-card stat-card completed">
            <div className="compact-card-header">
              <h3 className="card-title">환급 완료</h3>
              <span className="compact-icon success">✅</span>
            </div>
            <div className="stat-content">
              <p className="metric-value-sm color-success">{completedReceipts.length}</p>
              <span className="metric-unit">건</span>
            </div>
          </div>
        </div>

        <div className="receipt-lists-section">
          {pendingReceipts.length > 0 && (
            <div className="receipt-group">
              <h3 className="section-title">⏳ 환급 대기 목록</h3>
              <div className="receipt-card-grid">
                {pendingReceipts.map((receipt) => (
                  <div key={receipt.memberPaybackId} className="receipt-vertical-card">
                    <div className="receipt-card-image" onClick={() => handleReceiptClick(receipt)}>
                      <img src={getImageUrl(receipt.receipt)} alt="영수증" />
                      <div className="zoom-overlay">🔍 크게보기</div>
                    </div>
                    <div className="receipt-card-body">
                      <div className="receipt-card-info">
                        <h4 className="item-coupon-name">{receipt.couponName}</h4>
                        <p className="meta-value-sm">📅 {formatDateTime(receipt.receiptSubmittedAt)}</p>
                      </div>
                      <div className="receipt-card-actions">
                        <button 
                          onClick={() => handlePaybackReceiptClick(receipt.memberPaybackId)} 
                          className="btn btn-secondary btn-flex"
                        >
                          상세
                        </button>
                        <button 
                          onClick={() => handleQuickComplete(receipt.memberPaybackId)} 
                          className="btn btn-success btn-flex"
                          disabled={processingId === receipt.memberPaybackId}
                        >
                          {processingId === receipt.memberPaybackId ? '처리중' : '환급 완료'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {completedReceipts.length > 0 && (
            <div className="receipt-group" style={{ marginTop: '32px' }}>
              <h3 className="section-title">✅ 환급 완료 목록</h3>
              <div className="receipt-card-grid">
                {completedReceipts.map((receipt) => (
                  <div key={receipt.memberPaybackId} className="receipt-vertical-card completed-item">
                    <div className="receipt-card-image" onClick={() => handleReceiptClick(receipt)}>
                      <img src={getImageUrl(receipt.receipt)} alt="영수증" />
                    </div>
                    <div className="receipt-card-body">
                      <div className="receipt-card-info">
                        <h4 className="item-coupon-name">{receipt.couponName}</h4>
                        <p className="meta-value-sm">📅 {formatDateTime(receipt.receiptSubmittedAt)}</p>
                      </div>
                      <div className="receipt-card-actions">
                        <span className="status-tag tag-success">완료됨</span>
                        <button 
                          onClick={() => handlePaybackReceiptClick(receipt.memberPaybackId)} 
                          className="btn btn-secondary btn-flex"
                        >
                          상세
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {data.receipts.length === 0 && (
          <div className="dashboard-card empty-state">
            <p>영수증 데이터가 없습니다.</p>
          </div>
        )}

        {selectedReceipt && (
          <div className="receipt-modal" onClick={() => setSelectedReceipt(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-row">
                <h3 className="modal-title">{selectedReceipt.couponName}</h3>
                <div className="modal-header-btns">
                  {!selectedReceipt.isPayback && (
                    <button 
                      className="btn btn-success btn-sm"
                      onClick={() => handleQuickComplete(selectedReceipt.memberPaybackId)}
                      disabled={processingId === selectedReceipt.memberPaybackId}
                    >
                      {processingId === selectedReceipt.memberPaybackId ? '처리중...' : '환급 완료 처리'}
                    </button>
                  )}
                  <button className="modal-close-icon" onClick={() => setSelectedReceipt(null)}>✕</button>
                </div>
              </div>
              <div className="modal-body-image">
                <img src={getImageUrl(selectedReceipt.receipt)} alt="영수증" />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MemberReceiptDetailPage;
