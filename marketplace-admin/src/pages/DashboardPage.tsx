import React from 'react';
import { authUtils } from '../utils/auth';
import './DashboardPage.css';

const DashboardPage: React.FC = () => {
  const user = authUtils.getUserFromToken();

  const handleLogout = () => {
    authUtils.removeToken();
    window.location.href = '/login';
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">
              🐰 쿠러미 관리자
            </h1>
            <p className="dashboard-subtitle">관리자 대시보드</p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-id">{user?.studentId}</span>
              <span className="user-role">{user?.role}</span>
            </div>
            <button onClick={handleLogout} className="logout-button">
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>환영합니다! 🖤</h2>
          <p>쿠러미 관리자 페이지에 성공적으로 로그인했습니다.</p>
          <div className="user-details">
            <p><strong>학번:</strong> {user?.studentId}</p>
            <p><strong>권한:</strong> {user?.role}</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>총 상품</h3>
              <p className="stat-number">-</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>사용자</h3>
              <p className="stat-number">-</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>주문</h3>
              <p className="stat-number">-</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⚙️</div>
            <div className="stat-content">
              <h3>설정</h3>
              <p className="stat-number">-</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;