import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Fleet overview and KPIs' },
  '/vehicles': { title: 'Vehicles', subtitle: 'Manage your fleet' },
  '/drivers': { title: 'Drivers', subtitle: 'Manage your drivers' },
  '/trips': { title: 'Trips', subtitle: 'Plan and track trips' },
  '/maintenance': { title: 'Maintenance', subtitle: 'Vehicle maintenance logs' },
  '/fuel': { title: 'Fuel Logs', subtitle: 'Track fuel consumption' },
  '/expenses': { title: 'Expenses', subtitle: 'Operational expense tracking' },
  '/reports': { title: 'Reports & Analytics', subtitle: 'Data insights and exports' },
  '/profile': { title: 'Profile', subtitle: 'Manage your account' },
};

const Navbar = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || { title: 'TransitOps', subtitle: '' };

  const now = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="navbar-btn btn-icon"
          onClick={onMenuToggle}
          title="Toggle menu"
          style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}
        >
          ☰
        </button>
        <div className="navbar-title">
          <h1>{pageInfo.title}</h1>
          <p>{pageInfo.subtitle}</p>
        </div>
      </div>

      <div className="navbar-right">
        <span
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            padding: '6px 12px',
            background: 'var(--bg-card)',
            borderRadius: '6px',
            border: '1px solid var(--border)',
          }}
        >
          📅 {now}
        </span>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'var(--bg-card)',
            borderRadius: '8px',
            border: '1px solid var(--border)',
          }}
        >
          <div
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: 'white',
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
            {user?.name?.split(' ')[0]}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
