import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { couponApi } from '../api/coupon';
import type { PaybackReceiptListItem } from '../types/coupon';
import './PaybackReceiptsPage.css';

const PaybackReceiptsPage: React.FC = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState<PaybackReceiptListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      // 페이지네이션 처리를 위해 넉넉한 데이터를 가져옵니다. 
      // (실제 서비스에서는 백엔드에서 totalCount를 주거나 page/size 파라미터를 지원하는 것이 좋습니다)
      const response = await couponApi.getPaybackReceipts({ pageSize: 200 });
      setReceipts(response.response.couponResDtos);
      setError(null);
    } catch (err) {
      setError('환급 쿠폰 영수증 목록을 불러오는데 실패했습니다.');
      console.error('Failed to load payback receipts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
  }, []);

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

  // 페이지네이션 계산
  const totalPages = Math.ceil(receipts.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentReceipts = receipts.slice(startIndex, startIndex + pageSize);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="payback-receipts-page">
        <div className="page-header">
          <h1>환급 쿠폰 관리</h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="controls-section">
          <div className="page-size-selector">
            <span>표시:</span>
            {[10, 30, 50].map(size => (
              <button
                key={size}
                className={`btn-size ${pageSize === size ? 'active' : ''}`}
                onClick={() => handlePageSizeChange(size)}
              >
                {size}개
              </button>
            ))}
          </div>
        </div>

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
              {currentReceipts.map((receipt, index) => (
                <tr
                  key={receipt.memberPaybackId}
                  className="receipt-row"
                  onClick={() => handleReceiptClick(receipt.memberPaybackId)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>{startIndex + index + 1}</td>
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

        {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            이전
          </button>
          {getPageNumbers().map(page => (
            <button
              key={page}
              className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            다음
          </button>
      </div>
        )}
      </div>
    </Layout>
  );
};
export default PaybackReceiptsPage;