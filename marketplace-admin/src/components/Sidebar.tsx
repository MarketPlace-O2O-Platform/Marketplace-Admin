import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { authUtils } from '../utils/auth';
import './Sidebar.css';

interface SidebarProps {
  collapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const user = authUtils.getUserFromToken();

  const handleLogout = () => {
    authUtils.removeToken();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/users',
      label: '유저관리',
      icon: '👥'
    },
    {
      path: '/stores',
      label: '매장관리',
      icon: '🏪'
    },
    {
      path: '/temp-markets',
      label: '공감 매장 관리',
      icon: '❤️'
    },
    {
      path: '/coupons',
      label: '쿠폰관리',
      icon: '🎫'
    },
    {
      path: '/payback-receipts',
      label: '환급 쿠폰 관리',
      icon: '💰'
    }
  ];

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      <div className="sidebar-header">
        <h1 className="sidebar-title">
          {collapsed ? '🐰' : '🐰 쿠러미 관리자'}
        </h1>
        {!collapsed && (
          <div className="user-info">
            <span className="user-id">{user?.studentId}</span>
            <span className="user-role">{user?.role}</span>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'nav-item--active' : ''}`
            }
            title={collapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn" title={collapsed ? '로그아웃' : ''}>
          <span className="logout-icon">↩</span>
          {!collapsed && <span>로그아웃</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;