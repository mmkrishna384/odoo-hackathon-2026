import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const ROLE_LABELS = {
  fleet_manager: 'Fleet Manager',
  driver: 'Driver',
  safety_officer: 'Safety Officer',
  financial_analyst: 'Financial Analyst',
};

const ROLE_COLORS = {
  fleet_manager: '#6366f1',
  driver: '#10b981',
  safety_officer: '#f59e0b',
  financial_analyst: '#3b82f6',
};

const ROLE_PERMISSIONS = {
  fleet_manager: ['View Dashboard', 'Manage Vehicles', 'Manage Drivers', 'Manage Trips', 'Manage Maintenance', 'View Fuel Logs', 'View Expenses', 'View Reports', 'Manage Users'],
  driver: ['View Dashboard', 'View Trips', 'View Vehicles'],
  safety_officer: ['View Dashboard', 'View Vehicles', 'View Drivers', 'View Trips', 'Manage Maintenance', 'View Reports'],
  financial_analyst: ['View Dashboard', 'View Expenses', 'View Fuel Logs', 'View Reports'],
};

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', email: user?.email || '' });
  const [passwordForm, setPasswordForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data);
      setMessage({ type: 'success', text: '✅ Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    if (passwordForm.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }
    setLoading(true);
    try {
      await authAPI.updateProfile({ password: passwordForm.password });
      setPasswordForm({ password: '', confirmPassword: '' });
      setMessage({ type: 'success', text: '✅ Password changed successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const permissions = ROLE_PERMISSIONS[user?.role] || [];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>⚙️ Profile</h2>
          <p>Manage your account settings</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        {/* Profile Card */}
        <div>
          <div className="card" style={{ textAlign: 'center', padding: 32 }}>
            <div
              style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, fontWeight: 700, color: 'white', margin: '0 auto 16px',
                boxShadow: '0 4px 20px var(--primary-glow)',
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{user?.name}</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>{user?.email}</p>
            <span
              style={{
                padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                background: `${ROLE_COLORS[user?.role]}22`,
                color: ROLE_COLORS[user?.role] || '#94a3b8',
                display: 'inline-block', marginBottom: 20,
              }}
            >
              {ROLE_LABELS[user?.role] || user?.role}
            </span>

            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
                Permissions
              </p>
              {permissions.map((p) => (
                <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{p}</span>
                </div>
              ))}
            </div>

            <button
              className="btn btn-danger"
              onClick={logout}
              style={{ width: '100%', justifyContent: 'center', marginTop: 20 }}
            >
              🚪 Sign Out
            </button>
          </div>
        </div>

        {/* Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {message.text && (
            <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
              {message.text}
              <button onClick={() => setMessage({ type: '', text: '' })} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}>✕</button>
            </div>
          )}

          {/* Personal Info */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">👤 Personal Information</span>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input name="name" className="form-control" value={form.name} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input name="phone" className="form-control" value={form.phone} onChange={handleChange} />
                </div>
                <div className="form-group form-full">
                  <label className="form-label">Email Address</label>
                  <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <input className="form-control" value={ROLE_LABELS[user?.role] || user?.role} readOnly
                    style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Member Since</label>
                  <input className="form-control" value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN') : 'N/A'} readOnly
                    style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : '💾 Save Changes'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🔐 Change Password</span>
            </div>
            <form onSubmit={handlePasswordUpdate}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input name="password" type="password" className="form-control"
                    placeholder="Min. 6 characters" value={passwordForm.password} onChange={handlePasswordChange} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input name="confirmPassword" type="password" className="form-control"
                    placeholder="Repeat new password" value={passwordForm.confirmPassword} onChange={handlePasswordChange} />
                </div>
              </div>
              <button type="submit" className="btn btn-secondary" disabled={loading || !passwordForm.password}>
                🔒 Update Password
              </button>
            </form>
          </div>

          {/* Account Stats */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">📊 Account Info</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {[
                { label: 'User ID', value: user?._id?.slice(-8) || 'N/A' },
                { label: 'Role', value: ROLE_LABELS[user?.role] || user?.role },
                { label: 'Status', value: 'Active' },
                { label: 'Account Type', value: 'Standard' },
              ].map((item) => (
                <div key={item.label} style={{ padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
