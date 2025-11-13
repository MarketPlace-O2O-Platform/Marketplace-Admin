import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { couponApi } from '../api/coupon';
import type { PaybackReceiptListItem } from '../types/coupon';

const PaybackReceiptsPage: React.FC = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<PaybackReceiptListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [lastMemberPaybackId, setLastMemberPaybackId] = useState<number | undefined>();

  const loadReceipts = async (reset = false) => {
    try {
      setLoading(true);
      const params = {
        pageSize: 30,
        lastMemberPaybackId: reset ? undefined : lastMemberPaybackId
      };

      const response = await couponApi.getPaybackReceipts(params);

      if (reset) {
        setReceipts(response.response.couponResDtos);
      } else {
        setReceipts(prev => [...prev, ...response.response.couponResDtos]);
      }

      setHasNext(response.response.hasNext);

      // Set cursor to the last receipt's memberPaybackId for pagination
      if (response.response.couponResDtos.length > 0) {
        setLastMemberPaybackId(
          response.response.couponResDtos[response.response.couponResDtos.length - 1].memberPaybackId
        );
      }
    } catch (err) {
      setError('환급 쿠폰 영수증 목록을 불러오는데 실패했습니다.');
      console.error('Failed to load payback receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts(true);
  }, []);

  const handleLoadMore = () => {
    if (hasNext && !loading) {
      loadReceipts(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR');
  };

  const getPaybackStatusBadge = (isPayback: boolean) => {
    if (isPayback) {
      return <span className="badge badge-success">환급 완료</span>;
    }
    return <span className="badge badge-warning">환급 대기</span>;
  };

  const handleReceiptClick = (memberPaybackId: number) => {
    navigate(`/payback-receipts/${memberPaybackId}`);
  };

  return (
    <Layout>
      <div className="payback-receipts-page">
        <div className="page-header">
          <h1>환급 쿠폰 관리</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="table-container">
          <table className="coupon-table">
            <thead>
              <tr>
                <th>순번</th>
                <th>회원 ID</th>
                <th>쿠폰명</th>
                <th>발급일시</th>
                <th>영수증 제출일시</th>
                <th>계좌 정보</th>
                <th>환급 여부</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((receipt, index) => (
                <tr
                  key={receipt.memberPaybackId}
                  className="receipt-row"
                  onClick={() => handleReceiptClick(receipt.memberPaybackId)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{index + 1}</td>
                  <td>{receipt.memberId}</td>
                  <td className="coupon-name">{receipt.couponName}</td>
                  <td>{formatDate(receipt.issuedAt)}</td>
                  <td>{formatDate(receipt.receiptSubmittedAt)}</td>
                  <td>
                    <div className="account-info">
                      <div>{receipt.account}</div>
                      <div className="account-number">{receipt.accountNumber}</div>
                    </div>
                  </td>
                  <td>{getPaybackStatusBadge(receipt.isPayback)}</td>
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

        {!loading && receipts.length === 0 && (
          <div className="empty-state">
            <p>제출된 영수증이 없습니다.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PaybackReceiptsPage;