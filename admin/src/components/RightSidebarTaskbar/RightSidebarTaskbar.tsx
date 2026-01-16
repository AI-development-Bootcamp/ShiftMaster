import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import abraLogo from '../../assets/abra_logo.svg';
import abraLogoTextWhite from '../../assets/abra_logo_text_white.svg';
import './RightSidebarTaskbar.css';

export interface NavItemConfig {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
}

export interface UserProfile {
  name: string;
  role: string;
  avatarUrl?: string;
}

interface RightSidebarTaskbarProps {
  navItems: NavItemConfig[];
  user: UserProfile;
}

function NavItem({ item }: { item: NavItemConfig }) {
  const location = useLocation();
  const isActive = location.pathname === item.path;

  return (
    <NavLink
      to={item.path}
      className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
      aria-current={isActive ? 'page' : undefined}
    >
      {isActive && <span className="nav-item-indicator" aria-hidden="true" />}
      {item.icon && <span className="nav-item-icon" aria-hidden="true">{item.icon}</span>}
      <span className="nav-item-label">{item.label}</span>
    </NavLink>
  );
}

// Logout Icon
const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export function RightSidebarTaskbar({ navItems, user }: RightSidebarTaskbarProps) {
  const navigate = useNavigate(); // Now using useNavigate

  const handleLogout = () => {
    // In a real app, this would clear auth state
    navigate('/');
  };

  return (
    <aside className="sidebar" aria-label="תפריט ראשי">
      {/* Header section */}
      <div className="sidebar-header">
        <img src={abraLogoTextWhite} alt="לוגו Abra" className="sidebar-logo" />
      </div>

      {/* Navigation section */}
      <nav className="sidebar-nav" role="navigation" aria-label="ניווט ראשי">
        {navItems.map((item) => (
          <NavItem key={item.id} item={item} />
        ))}
      </nav>

      {/* Logout functionality */}
      <div className="sidebar-actions">
        <button
          onClick={handleLogout}
          className="nav-item logout-button"
          aria-label="התנתקות"
        >
          <span className="nav-item-icon" aria-hidden="true"><LogoutIcon /></span>
          <span className="nav-item-label">התנתקות</span>
        </button>
      </div>

      {/* Footer section */}
      <div className="sidebar-footer" role="contentinfo">
        <div className="user-profile">
          <div className="user-avatar" role="img" aria-label={`תמונת פרופיל של ${user.name}`}>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" />
            ) : (
              <img src={abraLogo} alt="" />
            )}
          </div>
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">{user.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
