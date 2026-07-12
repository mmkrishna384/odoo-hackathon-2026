import React, { useState, useEffect, useCallback } from 'react';
import { fuelAPI, vehicleAPI, tripAPI } from '../services/api';

const emptyForm = {
  vehicle: '', trip: '', liters: '', costPerLiter: '', totalCost: '',
  date: new Date().toISOString().split('T')[0], odometerReading: '',
  fuelStation: '', fuelType: 'Diesel', notes: '',
};

const FuelModal = ({ log, onClose, onSave }) => {
  const [form, setForm] = useState(log ? {
    vehicle: log.vehicle?._id || log.vehicle || '',
    trip: log.trip?._id || log.trip || '',
    liters: log.liters || '',
    costPerLiter: log.costPerLiter || '',
    totalCost: log.totalCost || '',
    date: log.date ? new Date(log.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    odometerReading: log.odometerReading || '',
    fuelStation: log.fuelStation || '',
    fuelType: log.fuelType || 'Diesel',
    notes: log.notes || '',
  } : emptyForm);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    vehicleAPI.getAll({ limit: 100 }).then(({ data }) => setVehicles(data.vehicles)).catch(() => {});
    tripAPI.getAll({ status: 'Dispatched', limit: 50 }).then(({ data }) => setTrips(data.trips)).catch(() => {});
  }, []);

  const handleChange = (e) => {
    const updated = { ...form, [e.target.name]: e.target.value };
    if (e.target.name === 'liters' || e.target.name === 'costPerLiter') {
      const l = parseFloat(e.target.name === 'liters' ? e.target.value : form.liters) || 0;
      const c = parseFloat(e.target.name === 'costPerLiter' ? e.target.value : form.costPerLiter) || 0;
      updated.totalCost = (l * c).toFixed(2);
    }
    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.vehicle || !form.liters || !form.costPerLiter || !form.date) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      if (log?._id) {
        await fuelAPI.update(log._id, form);
      } else {
        await fuelAPI.create(form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save fuel log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{log ? '✏️ Edit Fuel Log' : '⛽ Add Fuel Log'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Vehicle *</label>
              <select name="vehicle" className="form-control" value={form.vehicle} onChange={handleChange}>
                <option value="">Select vehicle</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>{v.registrationNumber} — {v.vehicleName}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Associated Trip</label>
              <select name="trip" className="form-control" value={form.trip} onChange={handleChange}>
                <option value="">None</option>
                {trips.map((t) => (
                  <option key={t._id} value={t._id}>{t.tripNumber} — {t.source} → {t.destination}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Liters *</label>
              <input name="liters" type="number" className="form-control" placeholder="e.g. 50"
                value={form.liters} onChange={handleChange} min="0" step="0.1" />
            </div>
            <div className="form-group">
              <label className="form-label">Cost per Liter (₹) *</label>
              <input name="costPerLiter" type="number" className="form-control" placeholder="e.g. 92.5"
                value={form.costPerLiter} onChange={handleChange} min="0" step="0.01" />
            </div>
            <div className="form-group">
              <label className="form-label">Total Cost (₹)</label>
              <input name="totalCost" type="number" className="form-control" readOnly
                value={form.totalCost}
                style={{ background: 'var(--bg-hover)', color: 'var(--success)' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input name="date" type="date" className="form-control"
                value={form.date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Odometer Reading (km)</label>
              <input name="odometerReading" type="number" className="form-control" placeholder="e.g. 75000"
                value={form.odometerReading} onChange={handleChange} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Fuel Type</label>
              <select name="fuelType" className="form-control" value={form.fuelType} onChange={handleChange}>
                {['Diesel', 'Petrol', 'CNG', 'Electric'].map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="form-group form-full">
              <label className="form-label">Fuel Station</label>
              <input name="fuelStation" className="form-control" placeholder="e.g. Indian Oil, Highway Pump"
                value={form.fuelStation} onChange={handleChange} />
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
            {loading ? 'Saving...' : log ? '💾 Update' : '➕ Add Log'}
          </button>
        </div>
      </div>
    </div>
  );
};

const FuelLogs = () => {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState({ totalLiters: 0, totalCost: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editLog, setEditLog] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await fuelAPI.getAll({ page, limit: 10 });
      setLogs(data.logs);
      setTotal(data.total);
      setPages(data.pages);
      setStats(data.stats || { totalLiters: 0, totalCost: 0 });
    } catch (err) {
      setError('Failed to load fuel logs');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleDelete = async () => {
    try {
      await fuelAPI.delete(deleteId);
      setDeleteId(null);
      fetchLogs();
    } catch (err) {
      setError('Delete failed');
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
          <h2>⛽ Fuel Logs</h2>
          <p>{total} fuel entries</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditLog(null); setShowModal(true); }}>
          ➕ Add Fuel Log
        </button>
      </div>

      {/* Stats Summary */}
      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
        <div className="kpi-card" style={{ '--kpi-color': '#f59e0b' }}>
          <div className="kpi-value">{stats.totalLiters?.toFixed(0) || 0}L</div>
          <div className="kpi-label">⛽ Total Fuel</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-color': '#ef4444' }}>
          <div className="kpi-value">{formatCurrency(stats.totalCost)}</div>
          <div className="kpi-label">💸 Total Fuel Cost</div>
        </div>
        <div className="kpi-card" style={{ '--kpi-color': '#10b981' }}>
          <div className="kpi-value">{stats.totalLiters > 0 ? (stats.totalCost / stats.totalLiters).toFixed(1) : '0'}</div>
          <div className="kpi-label">💲 Avg Cost/Liter (₹)</div>
        </div>
      </div>

      {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⛽</div>
          <p className="empty-title">No fuel logs yet</p>
          <button className="btn btn-primary mt-16" onClick={() => { setEditLog(null); setShowModal(true); }}>➕ Add Fuel Log</button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vehicle</th>
                  <th>Trip</th>
                  <th>Liters</th>
                  <th>Cost/L</th>
                  <th>Total Cost</th>
                  <th>Odometer</th>
                  <th>Fuel Station</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ fontSize: 12 }}>{formatDate(log.date)}</td>
                    <td>
                      <div style={{ fontSize: 13, color: 'var(--primary-light)', fontWeight: 500 }}>
                        {log.vehicle?.registrationNumber}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{log.vehicle?.vehicleName}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>{log.trip?.tripNumber || '—'}</td>
                    <td style={{ fontSize: 13, fontWeight: 500 }}>{log.liters}L</td>
                    <td style={{ fontSize: 13 }}>₹{log.costPerLiter}</td>
                    <td style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)' }}>{formatCurrency(log.totalCost)}</td>
                    <td style={{ fontSize: 12 }}>{log.odometerReading ? `${log.odometerReading?.toLocaleString()} km` : '—'}</td>
                    <td style={{ fontSize: 12 }}>{log.fuelStation || '—'}</td>
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
        <FuelModal
          log={editLog}
          onClose={() => { setShowModal(false); setEditLog(null); }}
          onSave={() => { setShowModal(false); setEditLog(null); fetchLogs(); }}
        />
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="confirm-dialog">
            <div className="confirm-icon">🗑️</div>
            <h3 className="confirm-title">Delete Fuel Log</h3>
            <p className="confirm-message">Are you sure you want to delete this fuel log entry?</p>
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

export default FuelLogs;
