import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_OPTIONS = [
  { value: 'fleet_manager', label: 'Fleet Manager', icon: '🛡️', desc: 'Full access to manage fleet, drivers, and trips' },
  { value: 'driver', label: 'Driver', icon: '🚛', desc: 'View trips and vehicle assignments' },
  { value: 'safety_officer', label: 'Safety Officer', icon: '🦺', desc: 'Monitor safety, maintenance, and compliance' },
  { value: 'financial_analyst', label: 'Financial Analyst', icon: '📊', desc: 'View expenses, fuel logs, and financial reports' },
];

const ROLE_COLORS = {
  fleet_manager: '#6366f1',
  driver: '#10b981',
  safety_officer: '#f59e0b',
  financial_analyst: '#3b82f6',
};

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: '', phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.role) {
      setError('Please fill all required fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card" style={{ maxWidth: 540 }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">🚛</div>
          <div>
            <h1>TransitOps</h1>
            <p>Fleet Management Platform</p>
          </div>
        </div>

        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Join TransitOps to manage your fleet operations</p>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Name & Phone */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                id="name"
                type="text"
                name="name"
                className="form-control"
                placeholder="e.g. Ramesh Kumar"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                id="phone"
                type="tel"
                name="phone"
                className="form-control"
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-control"
              placeholder="you@company.com"
              value={form.email}
              onChange={handleChange}
              style={{ fontSize: 15 }}
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              This email will be used to identify your account on the login page
            </span>
          </div>

          {/* Role Selection — Card-style */}
          <div className="form-group">
            <label className="form-label">Select your role *</label>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
            }}>
              {ROLE_OPTIONS.map((r) => {
                const isSelected = form.role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    style={{
                      display: 'flex', flexDirection: 'column', gap: 4,
                      padding: '12px 14px',
                      background: isSelected
                        ? `${ROLE_COLORS[r.value]}12`
                        : 'var(--bg-secondary)',
                      border: isSelected
                        ? `1.5px solid ${ROLE_COLORS[r.value]}`
                        : '1px solid var(--border)',
                      borderRadius: 10,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                      outline: 'none',
                      width: '100%',
                    }}
                  >
                    <div style={{
                      fontSize: 20,
                      filter: isSelected ? 'none' : 'grayscale(0.5) opacity(0.7)',
                      transition: 'all 0.15s ease',
                    }}>
                      {r.icon}
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: 600,
                      color: isSelected ? ROLE_COLORS[r.value] : 'var(--text-secondary)',
                    }}>
                      {r.label}
                    </div>
                    <div style={{
                      fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.3,
                    }}>
                      {r.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Passwords */}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                id="password"
                type="password"
                name="password"
                className="form-control"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <button
            id="register-btn"
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading || !form.role}
            style={{ width: '100%', justifyContent: 'center', marginTop: 4, padding: '12px 18px' }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite', display: 'inline-block',
                }} />
                Creating account...
              </>
            ) : (
              '✨ Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
