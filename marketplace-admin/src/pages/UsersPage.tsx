import React, { useState } from 'react';
import Layout from '../components/Layout';
import './UsersPage.css';

interface User {
  id: string;
  studentId: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  status: 'active' | 'inactive';
}

const UsersPage: React.FC = () => {
  const [users] = useState<User[]>([
    {
      id: '1',
      studentId: '202101568',
      name: '김관리자',
      email: 'admin@example.com',
      role: 'ADMIN',
      createdAt: '2024-01-01',
      status: 'active'
    },
    {
      id: '2',
      studentId: '202101234',
      name: '이사용자',
      email: 'user@example.com',
      role: 'USER',
      createdAt: '2024-01-15',
      status: 'active'
    },
    {
      id: '3',
      studentId: '202105678',
      name: '박학생',
      email: 'student@example.com',
      role: 'USER',
      createdAt: '2024-02-01',
      status: 'inactive'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.studentId.includes(searchTerm) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN': return '관리자';
      case 'USER': return '사용자';
      default: return role;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return '활성';
      case 'inactive': return '비활성';
      default: return status;
    }
  };

  return (
    <Layout>
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">유저관리</h1>
          <p className="page-description">시스템에 등록된 사용자를 관리합니다.</p>
        </div>

        <div className="filters-section">
          <div className="search-box">
            <input
              type="text"
              placeholder="이름, 학번, 이메일로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="filter-select"
            >
              <option value="all">모든 권한</option>
              <option value="ADMIN">관리자</option>
              <option value="USER">사용자</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">모든 상태</option>
              <option value="active">활성</option>
              <option value="inactive">비활성</option>
            </select>
          </div>
        </div>

        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>학번</th>
                <th>이름</th>
                <th>이메일</th>
                <th>권한</th>
                <th>상태</th>
                <th>가입일</th>
                <th>작업</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.studentId}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge role-badge--${user.role.toLowerCase()}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-badge--${user.status}`}>
                      {getStatusLabel(user.status)}
                    </span>
                  </td>
                  <td>{user.createdAt}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn--sm btn--secondary">수정</button>
                      <button className="btn btn--sm btn--danger">삭제</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <p className="results-info">
            총 {filteredUsers.length}명의 사용자
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default UsersPage;