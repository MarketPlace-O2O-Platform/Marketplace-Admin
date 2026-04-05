import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import './TopMarketsPage.css';

interface TopReceiptMember {
  memberId: number;
  receiptCount: number;
  completedCount: number;
  pendingCount: number;
}

const TopReceiptMembersPage: React.FC = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<TopReceiptMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [period, setPeriod] = useState<string>('WEEK');

  useEffect(() => {
    loadMembers(period);
  }, [period]);

  const loadMembers = async (selectedPeriod: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('marketplace_admin_token');
      const query = selectedPeriod ? `?period=${selectedPeriod}` : '';
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'https://marketplace.inuappcenter.kr'}/api/admins/payback-coupons/stats/top-members/receipt${query}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const data = await response.json();
      setMembers(data.response || []);
      setError('');
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error('영수증 우수 회원 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    setCurrentPage(1);
  };

  const handleMemberClick = (memberId: number) => {
    navigate(`/receipt-members/${memberId}`);
  };

  // 페이지네이션 계산
  const totalPages = Math.ceil(members.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentMembers = members.slice(startIndex, endIndex);

  // 페이지 번호 배열 생성 (최대 5개 표시)
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
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <Layout>
        <div className="top-markets-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <div className="loading-spinner"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="top-markets-container">
          <div className="error-message">
            <h3>데이터 로드 실패</h3>
            <p>{error}</p>
            <button onClick={() => loadMembers(period)} className="btn btn-primary">다시 시도</button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="top-markets-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">🧾 영수증 인증 회원 목록</h1>
            <p className="page-subtitle">
              {period === 'DAY' && '최근 1일 '}
              {period === 'WEEK' && '최근 1주 '}
              {period === 'MONTH' && '최근 1달 '}
              {period === '' && '전체 기간 '}
              영수증 인증 회원 (총 {members.length}명)
            </p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary">
            대시보드로 돌아가기
          </button>
        </div>

        <div className="controls-section" style={{ justifyContent: 'space-between' }}>
          <div className="period-selector" style={{ background: '#f3f4f6', padding: '4px', borderRadius: '8px' }}>
            <button
              className={`btn-period ${period === 'DAY' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('DAY')}
            >
              1일
            </button>
            <button
              className={`btn-period ${period === 'WEEK' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('WEEK')}
            >
              1주
            </button>
            <button
              className={`btn-period ${period === 'MONTH' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('MONTH')}
            >
              1달
            </button>
            <button
              className={`btn-period ${period === '' ? 'active' : ''}`}
              onClick={() => handlePeriodChange('')}
            >
              전체
            </button>
          </div>

          <div className="page-size-selector">
            <span>표시 개수:</span>
            <button
              className={`btn-size ${pageSize === 10 ? 'active' : ''}`}
              onClick={() => handlePageSizeChange(10)}
            >
              10개
            </button>
            <button
              className={`btn-size ${pageSize === 30 ? 'active' : ''}`}
              onClick={() => handlePageSizeChange(30)}
            >
              30개
            </button>
            <button
              className={`btn-size ${pageSize === 50 ? 'active' : ''}`}
              onClick={() => handlePageSizeChange(50)}
            >
              50개
            </button>
            <span style={{ marginLeft: '12px', color: '#111827' }}>총: <strong>{members.length}</strong>개</span>
          </div>
        </div>

        <div className="markets-card">
          <table className="markets-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>회원 학번(ID)</th>
                <th className="text-right">전체 인증</th>
                <th className="text-right">환급 완료</th>
                <th className="text-right">미환급 대기</th>
              </tr>
            </thead>
            <tbody>
              {currentMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray">데이터가 없습니다.</td>
                </tr>
              ) : (
                currentMembers.map((member, index) => (
                  <tr
                    key={member.memberId}
                    onClick={() => handleMemberClick(member.memberId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td data-label="순위">
                      <span className="rank-badge">{startIndex + index + 1}</span>
                    </td>
                    <td data-label="회원 학번(ID)" className="font-medium">{member.memberId}</td>
                    <td data-label="전체 인증" className="text-right">{member.receiptCount}회</td>
                    <td data-label="환급 완료" className="text-right" style={{ color: '#059669' }}>{member.completedCount}건</td>
                    <td data-label="미환급 대기" className="text-right">
                      <span className={`status-tag ${member.pendingCount > 0 ? 'tag-warning' : 'tag-neutral'}`}>
                        {member.pendingCount}건
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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

export default TopReceiptMembersPage;
