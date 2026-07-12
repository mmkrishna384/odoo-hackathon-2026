import React, { useState, useEffect, useCallback } from 'react';
import { driverAPI } from '../services/api';

const LICENSE_CATEGORIES = ['A', 'B', 'C', 'D', 'E', 'CE', 'BE'];
const DRIVER_STATUSES = ['Available', 'On Trip', 'Off Duty', 'Suspended'];

const statusClass = {
  Available: 'badge-available',
  'On Trip': 'badge-on-trip',
  'Off Duty': 'badge-off-duty',
  Suspended: 'badge-suspended',
};

const emptyForm = {
  name: '', licenseNumber: '', licenseCategory: 'B', licenseExpiry: '',
  contactNumber: '', email: '', address: '', safetyScore: 100,
  status: 'Available', emergencyContact: '', notes: '',
};

const DriverModal = ({ driver, onClose, onSave }) => {
  const [form, setForm] = useState(driver ? {
    ...driver,
    licenseExpiry: driver.licenseExpiry ? new Date(driver.licenseExpiry).toISOString().split('T')[0] : '',
  } : emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.licenseNumber || !form.licenseExpiry || !form.contactNumber) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      if (driver?._id) {
        await driverAPI.update(driver._id, form);
      } else {
        await driverAPI.create(form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save driver');
    } finally {
      setLoading(false);
    }
  };

  const isExpired = form.licenseExpiry && new Date(form.licenseExpiry) < new Date();

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{driver ? '✏️ Edit Driver' : '👤 Add Driver'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}
          {isExpired && (
            <div className="alert alert-warning">
              <span>⚠️</span> License has expired. Driver cannot be dispatched.
            </div>
          )}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input name="name" className="form-control" placeholder="e.g. Ramesh Kumar"
                value={form.name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">License Number *</label>
              <input name="licenseNumber" className="form-control" placeholder="e.g. MH0120210012345"
                value={form.licenseNumber} onChange={handleChange} style={{ textTransform: 'uppercase' }} />
            </div>
            <div className="form-group">
              <label className="form-label">License Category *</label>
              <select name="licenseCategory" className="form-control" value={form.licenseCategory} onChange={handleChange}>
                {LICENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">License Expiry *</label>
              <input name="licenseExpiry" type="date" className="form-control"
                value={form.licenseExpiry} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Number *</label>
              <input name="contactNumber" className="form-control" placeholder="+91 98765 43210"
                value={form.contactNumber} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input name="email" type="email" className="form-control" placeholder="driver@company.com"
                value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Safety Score (0-100)</label>
              <input name="safetyScore" type="number" className="form-control"
                value={form.safetyScore} onChange={handleChange} min="0" max="100" />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-control" value={form.status} onChange={handleChange}>
                {DRIVER_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Emergency Contact</label>
              <input name="emergencyContact" className="form-control" placeholder="+91 98765 43210"
                value={form.emergencyContact} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input name="address" className="form-control" placeholder="Home address"
                value={form.address} onChange={handleChange} />
            </div>
            <div className="form-group form-full">
              <label className="form-label">Notes</label>
              <textarea name="notes" className="form-control" rows={2} placeholder="Any additional info..."
                value={form.notes} onChange={handleChange} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : driver ? '💾 Update Driver' : '➕ Add Driver'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ onConfirm, onCancel }) => (
  <div className="modal-overlay">
    <div className="confirm-dialog">
      <div className="confirm-icon">🗑️</div>
      <h3 className="confirm-title">Delete Driver</h3>
      <p className="confirm-message">Are you sure you want to delete this driver record? This action cannot be undone.</p>
      <div className="confirm-btns">
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
      </div>
    </div>
  </div>
);

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editDriver, setEditDriver] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await driverAPI.getAll({
        page, limit: 10,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });
      setDrivers(data.drivers);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      setError('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchDrivers(); }, [fetchDrivers]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const handleDelete = async () => {
    try {
      await driverAPI.delete(deleteId);
      setDeleteId(null);
      fetchDrivers();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
      setDeleteId(null);
    }
  };

  const isExpired = (date) => date && new Date(date) < new Date();
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';

  const getSafetyColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>👤 Drivers</h2>
          <p>{total} drivers in system</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditDriver(null); setShowModal(true); }}>
          ➕ Add Driver
        </button>
      </div>

      {error && <div className="alert alert-error"><span>⚠️</span> {error} <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>✕</button></div>}

      <div className="filters-bar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search by name, license..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {DRIVER_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={fetchDrivers}>🔄 Refresh</button>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : drivers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <p className="empty-title">No drivers found</p>
          <button className="btn btn-primary mt-16" onClick={() => { setEditDriver(null); setShowModal(true); }}>➕ Add Driver</button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>License</th>
                  <th>Category</th>
                  <th>Expiry</th>
                  <th>Contact</th>
                  <th>Safety Score</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => (
                  <tr key={d._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0,
                        }}>
                          {d.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500 }}>{d.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.email || 'No email'}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="font-mono" style={{ fontSize: 12, color: 'var(--primary-light)' }}>{d.licenseNumber}</span></td>
                    <td><span className="badge badge-secondary">{d.licenseCategory}</span></td>
                    <td>
                      <span style={{ color: isExpired(d.licenseExpiry) ? 'var(--danger)' : 'var(--text-primary)', fontSize: 13 }}>
                        {formatDate(d.licenseExpiry)}
                        {isExpired(d.licenseExpiry) && ' ⚠️'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>{d.contactNumber}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ height: 4, width: 60, background: 'var(--bg-secondary)', borderRadius: 2 }}>
                          <div style={{
                            height: '100%', width: `${d.safetyScore}%`,
                            background: getSafetyColor(d.safetyScore), borderRadius: 2,
                          }} />
                        </div>
                        <span style={{ fontSize: 12, color: getSafetyColor(d.safetyScore), fontWeight: 600 }}>{d.safetyScore}</span>
                      </div>
                    </td>
                    <td><span className={`badge ${statusClass[d.status] || 'badge-secondary'}`}>{d.status}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-secondary btn-sm" onClick={() => { setEditDriver(d); setShowModal(true); }}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(d._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <span className="pagination-info">
              Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, total)} of {total}
            </span>
            <div className="pagination-controls">
              <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>← Prev</button>
              {Array.from({ length: Math.min(5, pages) }, (_, i) => (
                <button key={i + 1} className={`page-btn ${i + 1 === page ? 'active' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === pages}>Next →</button>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <DriverModal
          driver={editDriver}
          onClose={() => { setShowModal(false); setEditDriver(null); }}
          onSave={() => { setShowModal(false); setEditDriver(null); fetchDrivers(); }}
        />
      )}

      {deleteId && (
        <ConfirmDialog onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
      )}
    </div>
  );
};

export default Drivers;
