import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import StatsOverview from '../components/StatsOverview';
import type { Member, MemberRole } from '../types/member';
import { memberAPI } from '../api/member';
import { MEMBER_ROLE_LABELS } from '../types/member';
import './MembersPage.css';

const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [hasNext, setHasNext] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<MemberRole | 'ALL'>('ALL');

  const loadMembers = async (lastPageIndex?: number, isLoadMore = false, roleFilter?: MemberRole) => {
    try {
      console.log('loadMembers 호출:', { lastPageIndex, isLoadMore, roleFilter });
      if (!isLoadMore) setLoading(true);

      const response = await memberAPI.getMembers({
        pageSize: 50,
        lastPageIndex,
        role: roleFilter
      });

      console.log('API 응답:', response);

      if (isLoadMore) {
        setMembers(prev => {
          const newMembers = response.response.members.filter(
            newMember => !prev.some(existingMember => existingMember.studentId === newMember.studentId)
          );
          return [...prev, ...newMembers];
        });
      } else {
        setMembers(response.response.members);
      }

      setHasNext(response.response.hasNext);
      setError('');
    } catch (err: any) {
      setError('회원 목록을 불러오는데 실패했습니다.');
      console.error('회원 목록 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const roleFilter = selectedRole === 'ALL' ? undefined : selectedRole;
    loadMembers(undefined, false, roleFilter);
  }, [selectedRole]);

  const filteredMembers = members.filter(member => {
    const matchesSearch = (member.account || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.accountNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.studentId.toString().includes(searchTerm);

    return matchesSearch;
  });

  const handleLoadMore = () => {
    if (members.length > 0 && hasNext && !loading) {
      const lastMember = members[members.length - 1];
      const roleFilter = selectedRole === 'ALL' ? undefined : selectedRole;
      loadMembers(lastMember.studentId, true, roleFilter);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role: string) => {
    const isAdmin = role === 'ROLE_ADMIN';
    return (
      <span className={`badge ${isAdmin ? 'badge-danger' : 'badge-secondary'}`}>
        {MEMBER_ROLE_LABELS[role as keyof typeof MEMBER_ROLE_LABELS] || role}
      </span>
    );
  };

  return (
    <Layout>
      <div className="members-page">
        <div className="page-header">
          <h1>회원 관리</h1>
        </div>

        <StatsOverview />

        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="계정, 계정번호, 학번으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="role-filter">권한:</label>
            <select
              id="role-filter"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as MemberRole | 'ALL')}
              className="role-filter"
            >
              <option value="ALL">전체</option>
              {Object.entries(MEMBER_ROLE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="table-container">
          <table className="members-table">
            <thead>
              <tr>
                <th>학번</th>
                <th>은행</th>
                <th>계좌번호</th>
                <th>응원권</th>
                <th>권한</th>
                <th>가입일</th>
                <th>최종 수정일</th>
              </tr>
            </thead>
            <tbody>
              {loading && members.length === 0 ? (
                <tr>
                  <td colSpan={7} className="loading">회원 목록을 불러오는 중...</td>
                </tr>
              ) : filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-state">회원이 없습니다.</td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.studentId} className="member-row">
                    <td className="student-id">{member.studentId}</td>
                    <td className="account">{member.account || '-'}</td>
                    <td className="account-number">{member.accountNumber || '-'}</td>
                    <td className="cheer-ticket">{member.cheerTicket}개</td>
                    <td>{getRoleBadge(member.role)}</td>
                    <td className="created-at">{formatDate(member.createdAt)}</td>
                    <td className="modified-at">{formatDate(member.modifiedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {hasNext && !loading && (
          <div className="load-more">
            <button className="btn btn-outline-primary" onClick={handleLoadMore}>
              더 보기
            </button>
          </div>
        )}

        <div className="table-footer">
          <p className="results-info">
            총 {filteredMembers.length}명의 회원
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default MembersPage;