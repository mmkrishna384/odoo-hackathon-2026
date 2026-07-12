import React, { useState, useEffect, useCallback } from 'react';
import { maintenanceAPI, vehicleAPI } from '../services/api';

const MAINTENANCE_TYPES = ['Preventive', 'Corrective', 'Predictive', 'Emergency', 'Inspection'];
const MAINTENANCE_STATUSES = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];

const statusClass = {
  Scheduled: 'badge-warning',
  'In Progress': 'badge-dispatched',
  Completed: 'badge-completed',
  Cancelled: 'badge-cancelled',
};

const emptyForm = {
  vehicle: '', maintenanceType: 'Preventive', description: '',
  cost: '', startDate: '', endDate: '', status: 'In Progress',
  serviceProvider: '', notes: '',
};

const MaintenanceModal = ({ log, onClose, onSave }) => {
  const [form, setForm] = useState(log ? {
    vehicle: log.vehicle?._id || log.vehicle || '',
    maintenanceType: log.maintenanceType || 'Preventive',
    description: log.description || '',
    cost: log.cost || '',
    startDate: log.startDate ? new Date(log.startDate).toISOString().split('T')[0] : '',
    endDate: log.endDate ? new Date(log.endDate).toISOString().split('T')[0] : '',
    status: log.status || 'In Progress',
    serviceProvider: log.serviceProvider || '',
    notes: log.notes || '',
  } : emptyForm);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    vehicleAPI.getAll({ limit: 100 }).then(({ data }) => setVehicles(data.vehicles)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.vehicle || !form.description || !form.cost || !form.startDate) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      if (log?._id) {
        await maintenanceAPI.update(log._id, form);
      } else {
        await maintenanceAPI.create(form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save maintenance log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{log ? '✏️ Edit Maintenance' : '🔧 New Maintenance Log'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}
          {!log && (
            <div className="alert alert-info">
              <span>ℹ️</span> Creating a maintenance log will automatically set the vehicle status to <strong>In Shop</strong>.
            </div>
          )}
          <div className="form-grid">
            <div className="form-group form-full">
              <label className="form-label">Vehicle *</label>
              <select name="vehicle" className="form-control" value={form.vehicle} onChange={handleChange} disabled={!!log}>
                <option value="">Select vehicle</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.registrationNumber} — {v.vehicleName} ({v.status})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Maintenance Type *</label>
              <select name="maintenanceType" className="form-control" value={form.maintenanceType} onChange={handleChange}>
                {MAINTENANCE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select name="status" className="form-control" value={form.status} onChange={handleChange}>
                {MAINTENANCE_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group form-full">
              <label className="form-label">Description *</label>
              <textarea name="description" className="form-control" rows={2} value={form.description} onChange={handleChange} placeholder="Describe the maintenance work..." />
            </div>
            <div className="form-group">
              <label className="form-label">Cost (₹) *</label>
              <input name="cost" type="number" className="form-control" placeholder="e.g. 5000"
                value={form.cost} onChange={handleChange} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Service Provider</label>
              <input name="serviceProvider" className="form-control" placeholder="e.g. AutoCare Garage"
                value={form.serviceProvider} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input name="startDate" type="date" className="form-control"
                value={form.startDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input name="endDate" type="date" className="form-control"
                value={form.endDate} onChange={handleChange} />
            </div>
            <div className="form-group form-full">
              <label className="form-label">Notes</label>
              <textarea name="notes" className="form-control" rows={2} value={form.notes} onChange={handleChange} />
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : log ? '💾 Update' : '➕ Create Log'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Maintenance = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editLog, setEditLog] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await maintenanceAPI.getAll({
        page, limit: 10,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });
      setLogs(data.logs);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      setError('Failed to load maintenance logs');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const handleDelete = async () => {
    try {
      await maintenanceAPI.delete(deleteId);
      setDeleteId(null);
      fetchLogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
      setDeleteId(null);
    }
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN') : '—';

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>🔧 Maintenance Logs</h2>
          <p>{total} maintenance records</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditLog(null); setShowModal(true); }}>
          ➕ Add Maintenance
        </button>
      </div>

      {error && <div className="alert alert-error"><span>⚠️</span> {error} <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>✕</button></div>}

      <div className="filters-bar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search by description, type, provider..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {MAINTENANCE_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={fetchLogs}>🔄 Refresh</button>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔧</div>
          <p className="empty-title">No maintenance records</p>
          <button className="btn btn-primary mt-16" onClick={() => { setEditLog(null); setShowModal(true); }}>➕ Add Maintenance</button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Cost</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--primary-light)' }}>
                        {log.vehicle?.registrationNumber}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.vehicle?.vehicleName}</div>
                    </td>
                    <td><span className="badge badge-secondary">{log.maintenanceType}</span></td>
                    <td style={{ fontSize: 13, maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.description}
                      </div>
                    </td>
                    <td style={{ fontSize: 13, fontWeight: 500 }}>{formatCurrency(log.cost)}</td>
                    <td style={{ fontSize: 12 }}>{formatDate(log.startDate)}</td>
                    <td style={{ fontSize: 12 }}>{formatDate(log.endDate)}</td>
                    <td style={{ fontSize: 12 }}>{log.serviceProvider || '—'}</td>
                    <td><span className={`badge ${statusClass[log.status] || 'badge-secondary'}`}>{log.status}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-secondary btn-sm" onClick={() => { setEditLog(log); setShowModal(true); }}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(log._id)}>🗑️</button>
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
        <MaintenanceModal
          log={editLog}
          onClose={() => { setShowModal(false); setEditLog(null); }}
          onSave={() => { setShowModal(false); setEditLog(null); fetchLogs(); }}
        />
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="confirm-dialog">
            <div className="confirm-icon">🗑️</div>
            <h3 className="confirm-title">Delete Log</h3>
            <p className="confirm-message">This will also restore the vehicle to Available status if log was active.</p>
            <div className="confirm-btns">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
