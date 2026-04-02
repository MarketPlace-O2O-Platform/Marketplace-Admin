import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Pagination from '../components/Pagination';
import { couponApi } from '../api/coupon';
import type { PaybackReceiptListItem } from '../types/coupon';
import './PaybackReceiptsPage.css';

interface MemberStat {
  memberId: number;
  receiptCount: number;
  completedCount: number;
  pendingCount: number;
}

const PaybackReceiptsPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'all' | 'member'>('all');
  const [receipts, setReceipts] = useState<PaybackReceiptListItem[]>([]);
  const [memberStats, setMemberStats] = useState<MemberStat[]>([]);
  const [memberPeriod, setMemberPeriod] = useState<string>('TODAY');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('marketplace_admin_token');

      if (viewMode === 'all') {
        const response = await couponApi.getPaybackReceipts({ pageSize: 200 });
        setReceipts(response.response.couponResDtos);
      } else {
        const query = memberPeriod ? `?period=${memberPeriod}` : '';
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://marketplace.inuappcenter.kr'}/api/admins/payback-coupons/stats/top-members/receipt/calendar${query}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setMemberStats(data.response || []);
      }
      setError(null);
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    setCurrentPage(1);
  }, [viewMode, memberPeriod]);

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
  const filteredReceipts = receipts.filter(r => {
    if (statusFilter === 'PENDING') return !r.isPayback;
    if (statusFilter === 'COMPLETED') return r.isPayback;
    return true;
  });

  const currentData = viewMode === 'all' ? filteredReceipts : memberStats;
  const totalPages = Math.ceil((currentData?.length || 0) / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const pagedData = currentData.slice(startIndex, startIndex + pageSize);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleMemberPeriodChange = (period: string) => {
    setMemberPeriod(period);
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="payback-receipts-page">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <h1>환급 쿠폰 관리</h1>
          <div className="view-mode-selector">
            <button
              className={`btn-view-mode ${viewMode === 'member' ? 'active' : ''}`}
              onClick={() => setViewMode('member')}
            >
              회원별 목록보기
            </button>
            <button
              className={`btn-view-mode ${viewMode === 'all' ? 'active' : ''}`}
              onClick={() => setViewMode('all')}
            >
              전체 목록보기
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="controls-section">
          {viewMode === 'member' && (
            <div className="period-selector">
              <button
                className={`btn-period ${memberPeriod === 'TODAY' ? 'active' : ''}`}
                onClick={() => handleMemberPeriodChange('TODAY')}
              >
                오늘
              </button>
              <button
                className={`btn-period ${memberPeriod === 'WEEK' ? 'active' : ''}`}
                onClick={() => handleMemberPeriodChange('WEEK')}
              >
                이번주
              </button>
              <button
                className={`btn-period ${memberPeriod === 'ALL' ? 'active' : ''}`}
                onClick={() => handleMemberPeriodChange('ALL')}
              >
                전체
              </button>
            </div>
          )}
        </div>

        <div className="controls-section" style={{ justifyContent: 'space-between' }}>
          {viewMode === 'all' ? (
            <div className="view-mode-selector">
              <button
                className={`btn-view-mode ${statusFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => { setStatusFilter('ALL'); setCurrentPage(1); }}
              >
                전체
              </button>
              <button
                className={`btn-view-mode ${statusFilter === 'PENDING' ? 'active' : ''}`}
                onClick={() => { setStatusFilter('PENDING'); setCurrentPage(1); }}
              >
                대기
              </button>
              <button
                className={`btn-view-mode ${statusFilter === 'COMPLETED' ? 'active' : ''}`}
                onClick={() => { setStatusFilter('COMPLETED'); setCurrentPage(1); }}
              >
                완료
              </button>
            </div>
          ) : (
            <div className="view-mode-selector">
              <button
                className={`btn-period ${memberPeriod === 'TODAY' ? 'active' : ''}`}
                onClick={() => handleMemberPeriodChange('TODAY')}
              >
                오늘
              </button>
              <button
                className={`btn-view-mode ${memberPeriod === 'WEEK' ? 'active' : ''}`}
                onClick={() => handleMemberPeriodChange('WEEK')}
              >
                1주
              </button>
              <button
                className={`btn-view-mode ${memberPeriod === 'ALL' ? 'active' : ''}`}
                onClick={() => handleMemberPeriodChange('ALL')}
              >
                전체
              </button>
            </div>
          )}
          
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
              {viewMode === 'all' ? (
                <tr>
                  <th className="col-rank">순번</th>
                  <th className="col-id">회원 ID</th>
                  <th className="col-name">쿠폰명</th>
                  <th className="col-date">발급일시</th>
                  <th className="col-date">영수증 제출일시</th>
                  <th className="col-account">계좌 정보</th>
                  <th className="col-status">환급 여부</th>
                </tr>
              ) : (
                <tr>
                  <th className="col-rank">순위</th>
                  <th className="col-id">회원 ID</th>
                  <th className="col-stat text-right">전체 건수</th>
                  <th className="col-stat text-right">완료 건수</th>
                  <th className="col-stat text-right">대기 건수</th>
                  <th className="col-action">관리</th>
                </tr>
              )}
            </thead>
            <tbody>
              {viewMode === 'all' ? (
                (pagedData as PaybackReceiptListItem[]).map((receipt, index) => (
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
                ))
              ) : (
                (pagedData as MemberStat[]).map((stat, index) => (
                  <tr key={stat.memberId}>
                    <td>{startIndex + index + 1}</td>
                    <td className="coupon-name">{stat.memberId}</td>
                    <td className="text-right">{stat.receiptCount}건</td>
                    <td className="text-right" style={{ color: '#059669', fontWeight: 600 }}>{stat.completedCount}건</td>
                    <td className="text-right">
                      <span className={`badge ${stat.pendingCount > 0 ? 'badge-warning' : 'badge-success'}`}>
                        {stat.pendingCount}건 대기
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn-xs-link"
                        onClick={() => navigate(`/receipt-members/${stat.memberId}`)}
                      >
                        상세보기 →
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {loading && <div className="loading">로딩 중...</div>}

        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />
      </div>
    </Layout>
  );
};
export default PaybackReceiptsPage;