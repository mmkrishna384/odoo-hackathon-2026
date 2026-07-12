import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { path: '/dashboard', icon: '📊', label: 'Dashboard', section: 'OVERVIEW', roles: ['fleet_manager', 'safety_officer', 'financial_analyst'] },
  { path: '/vehicles', icon: '🚛', label: 'Vehicles', section: 'FLEET', roles: ['fleet_manager', 'driver'] },
  { path: '/drivers', icon: '👤', label: 'Drivers', section: 'FLEET', roles: ['safety_officer'] },
  { path: '/trips', icon: '🗺️', label: 'Trips', section: 'OPERATIONS', roles: ['fleet_manager', 'driver'] },
  { path: '/maintenance', icon: '🔧', label: 'Maintenance', section: 'OPERATIONS', roles: ['fleet_manager'] },
  { path: '/fuel', icon: '⛽', label: 'Fuel Logs', section: 'FINANCE', roles: ['financial_analyst'] },
  { path: '/expenses', icon: '💰', label: 'Expenses', section: 'FINANCE', roles: ['financial_analyst'] },
  { path: '/reports', icon: '📈', label: 'Reports', section: 'ANALYTICS', roles: ['fleet_manager', 'financial_analyst'] },
  { path: '/profile', icon: '⚙️', label: 'Profile', section: 'ACCOUNT' },
];

const sections = ['OVERVIEW', 'FLEET', 'OPERATIONS', 'FINANCE', 'ANALYTICS', 'ACCOUNT'];

const getRoleLabel = (role) => {
  const labels = {
    fleet_manager: 'Fleet Manager',
    driver: 'Driver',
    safety_officer: 'Safety Officer',
    financial_analyst: 'Financial Analyst',
  };
  return labels[role] || role;
};

const getRoleBadgeColor = (role) => {
  const colors = {
    fleet_manager: '#6366f1',
    driver: '#10b981',
    safety_officer: '#f59e0b',
    financial_analyst: '#3b82f6',
  };
  return colors[role] || '#64748b';
};

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const filteredNavItems = navItems.filter((item) =>
    !item.roles || (user && item.roles.includes(user.role))
  );

  const renderedSections = sections.filter((s) =>
    filteredNavItems.some((n) => n.section === s)
  );

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 99, display: window.innerWidth <= 768 ? 'block' : 'none'
          }}
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🚛</div>
          <div className="sidebar-logo-text">
            <h2>TransitOps</h2>
            <p>Fleet Management</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {renderedSections.map((section) => {
            const sectionItems = filteredNavItems.filter((n) => n.section === section);
            return (
              <div key={section}>
                <div className="sidebar-section">{section}</div>
                {sectionItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `sidebar-item ${isActive ? 'active' : ''}`
                    }
                    onClick={() => window.innerWidth <= 768 && onClose?.()}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="user-card" title="Click to logout" onClick={logout}>
              <div className="user-avatar">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <h4>{user.name}</h4>
                <p
                  style={{
                    color: getRoleBadgeColor(user.role),
                    fontWeight: 600,
                    fontSize: '11px',
                  }}
                >
                  {getRoleLabel(user.role)}
                </p>
              </div>
              <span style={{ color: '#64748b', fontSize: '14px' }}>↩</span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
