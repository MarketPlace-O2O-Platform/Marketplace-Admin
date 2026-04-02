import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import './Layout.css';

// 깔끔한 SVG 아이콘 컴포넌트 정의
const Icons = {
  Dashboard: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
  ),
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
  ),
  Stores: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18v-8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8z"></path><path d="M3 7h18a2 2 0 0 1 2 2v2H1v-2a2 2 0 0 1 2-2z"></path><path d="M8 21V7"></path><path d="M16 21V7"></path></svg>
  ),
  Coupons: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0l-3.91 2.1a1.93 1.93 0 0 0-.94 1.73l.15 4.42a1.93 1.93 0 0 0 .94 1.73l12.35 6.61a1.93 1.93 0 0 0 1.81 0l3.91-2.1a1.93 1.93 0 0 0 .94-1.73l-.15-4.42a1.93 1.93 0 0 0-.94-1.73Z"></path><path d="M8 2v20"></path><circle cx="12" cy="12" r="2"></circle></svg>
  ),
  TempMarkets: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
  ),
  RequestMarkets: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
  ),
  PaybackReceipts: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"></path><path d="M14 8H8"></path><path d="M16 12H8"></path><path d="M13 16H8"></path></svg>
  ),
  Logout: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
  ),
  MenuOpen: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
  ),
  Rabbit: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 12v.2a7.8 7.8 0 0 1-1.3 4.6l-3 4.2h-5.4l-3-4.2a7.8 7.8 0 0 1-1.3-4.6V12"/></svg>
  ),
  ChevronLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
  ),
  ChevronRight: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6 6-6 6"/></svg>
  ),
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(() => {
    // 모바일 환경에서는 기본적으로 접힌 상태
    return window.innerWidth <= 768;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getUser = () => {
    const token = localStorage.getItem('marketplace_admin_token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return { studentId: payload.sub, role: payload.role };
    } catch {
      return null;
    }
  };

  const user = getUser();

  const handleLogout = () => {
    localStorage.removeItem('marketplace_admin_token');
    navigate('/login', { replace: true });
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const menuItems = [
    { path: '/dashboard', label: '대시보드', icon: <Icons.Dashboard /> },
    { path: '/users', label: '유저관리', icon: <Icons.Users /> },
    { path: '/stores', label: '매장관리', icon: <Icons.Stores /> },
    { path: '/coupons', label: '쿠폰관리', icon: <Icons.Coupons /> },
    { path: '/temp-markets', label: '공감매장', icon: <Icons.TempMarkets /> },
    { path: '/request-markets', label: '요청매장', icon: <Icons.RequestMarkets /> },
    { path: '/payback-receipts', label: '환급영수증', icon: <Icons.PaybackReceipts /> },
  ];

  const currentItem = menuItems.find(item => location.pathname.startsWith(item.path));
  const pageTitle = currentItem ? currentItem.label : '쿠러미 관리자';

  return (
    <div className={`layout-container ${collapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-area">
            <div className="logo-icon"><Icons.Rabbit /></div>
            <span className="logo-text"> 쿠러미 관리자</span>
          </div>
          <button className="sidebar-toggle-btn" onClick={toggleSidebar} title={collapsed ? "펼치기" : "접기"}>
            {collapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
          </button>
        </div>

        <div className="user-profile-section">
          <div className="user-card">
            <div className="user-avatar-circle">
              <Icons.Users />
            </div>
            <div className="user-info-text">
              <span className="user-id">{user?.studentId || 'Admin'}</span>
              <span className="user-role-badge">
                {user?.role === 'ROLE_ADMIN' ? '관리자' : '매니저'}
              </span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <div className="nav-icon-wrapper">{item.icon}</div>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item logout-btn" title="로그아웃" style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer' }}>
            <div className="nav-icon-wrapper"><Icons.Logout /></div>
            <span className="nav-label">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-wrapper">
        <header className="top-header">
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Icons.Menu />
          </button>
          <h2 className="header-page-title">{pageTitle}</h2>
          <Link to="/dashboard" className="mobile-home-link" title="대시보드로 이동">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </Link>
        </header>

        <main className="content-area">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;