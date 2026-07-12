import React, { useState, useEffect, useCallback } from 'react';
import { vehicleAPI } from '../services/api';

const VEHICLE_TYPES = ['Truck', 'Van', 'Pickup', 'Tanker', 'Trailer', 'Bus', 'Car', 'Motorcycle'];
const STATUSES = ['Available', 'On Trip', 'In Shop', 'Retired'];
const FUEL_TYPES = ['Diesel', 'Petrol', 'CNG', 'Electric'];

const statusClass = {
  Available: 'badge-available',
  'On Trip': 'badge-on-trip',
  'In Shop': 'badge-in-shop',
  Retired: 'badge-retired',
};

const emptyForm = {
  registrationNumber: '', vehicleName: '', model: '', vehicleType: 'Truck',
  maxLoadCapacity: '', odometer: '', acquisitionCost: '', status: 'Available',
  region: '', fuelType: 'Diesel', yearOfManufacture: '', notes: '',
};

const VehicleModal = ({ vehicle, onClose, onSave }) => {
  const [form, setForm] = useState(vehicle ? { ...vehicle } : emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.registrationNumber || !form.vehicleName || !form.model || !form.maxLoadCapacity || !form.acquisitionCost) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      if (vehicle?._id) {
        await vehicleAPI.update(vehicle._id, form);
      } else {
        await vehicleAPI.create(form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{vehicle ? '✏️ Edit Vehicle' : '🚛 Add Vehicle'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Registration Number *</label>
                <input name="registrationNumber" className="form-control" placeholder="e.g. MH12AB1234"
                  value={form.registrationNumber} onChange={handleChange} style={{ textTransform: 'uppercase' }} />
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Name *</label>
                <input name="vehicleName" className="form-control" placeholder="e.g. Tata Prima"
                  value={form.vehicleName} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Model *</label>
                <input name="model" className="form-control" placeholder="e.g. 4923.S"
                  value={form.model} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Vehicle Type *</label>
                <select name="vehicleType" className="form-control" value={form.vehicleType} onChange={handleChange}>
                  {VEHICLE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Max Load Capacity (kg) *</label>
                <input name="maxLoadCapacity" type="number" className="form-control" placeholder="e.g. 5000"
                  value={form.maxLoadCapacity} onChange={handleChange} min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Acquisition Cost (₹) *</label>
                <input name="acquisitionCost" type="number" className="form-control" placeholder="e.g. 2500000"
                  value={form.acquisitionCost} onChange={handleChange} min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Odometer (km)</label>
                <input name="odometer" type="number" className="form-control" placeholder="e.g. 45000"
                  value={form.odometer} onChange={handleChange} min="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select name="status" className="form-control" value={form.status} onChange={handleChange}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fuel Type</label>
                <select name="fuelType" className="form-control" value={form.fuelType} onChange={handleChange}>
                  {FUEL_TYPES.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Year of Manufacture</label>
                <input name="yearOfManufacture" type="number" className="form-control" placeholder="e.g. 2021"
                  value={form.yearOfManufacture} onChange={handleChange} min="1990" max="2030" />
              </div>
              <div className="form-group">
                <label className="form-label">Region</label>
                <input name="region" className="form-control" placeholder="e.g. North Zone"
                  value={form.region} onChange={handleChange} />
              </div>
              <div className="form-group form-full">
                <label className="form-label">Notes</label>
                <textarea name="notes" className="form-control" placeholder="Any additional notes..."
                  value={form.notes} onChange={handleChange} rows={2} />
              </div>
            </div>
          </form>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : vehicle ? '💾 Update Vehicle' : '➕ Add Vehicle'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="modal-overlay">
    <div className="confirm-dialog">
      <div className="confirm-icon">🗑️</div>
      <h3 className="confirm-title">Delete Vehicle</h3>
      <p className="confirm-message">{message}</p>
      <div className="confirm-btns">
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn btn-danger" onClick={onConfirm}>Delete</button>
      </div>
    </div>
  </div>
);

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editVehicle, setEditVehicle] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await vehicleAPI.getAll({
        page, limit: 10,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { vehicleType: typeFilter }),
      });
      setVehicles(data.vehicles);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      setError('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, typeFilter]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);
  useEffect(() => { setPage(1); }, [search, statusFilter, typeFilter]);

  const handleDelete = async () => {
    try {
      await vehicleAPI.delete(deleteId);
      setDeleteId(null);
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete vehicle');
      setDeleteId(null);
    }
  };

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>🚛 Vehicles</h2>
          <p>{total} vehicles in fleet</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditVehicle(null); setShowModal(true); }}>
          ➕ Add Vehicle
        </button>
      </div>

      {error && <div className="alert alert-error"><span>⚠️</span> {error} <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>✕</button></div>}

      <div className="filters-bar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            placeholder="Search by reg. number, name, model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {VEHICLE_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={fetchVehicles}>🔄 Refresh</button>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /><p className="loading-text">Loading vehicles...</p></div>
      ) : vehicles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚛</div>
          <p className="empty-title">No vehicles found</p>
          <p className="empty-desc">Add your first vehicle to get started</p>
          <button className="btn btn-primary mt-16" onClick={() => { setEditVehicle(null); setShowModal(true); }}>➕ Add Vehicle</button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Reg. Number</th>
                  <th>Vehicle</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Odometer</th>
                  <th>Acq. Cost</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v._id}>
                    <td>
                      <span className="font-mono" style={{ fontSize: 12, color: 'var(--primary-light)', fontWeight: 600 }}>
                        {v.registrationNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{v.vehicleName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{v.model} • {v.fuelType}</div>
                    </td>
                    <td><span className="badge badge-secondary">{v.vehicleType}</span></td>
                    <td style={{ fontSize: 13 }}>{v.maxLoadCapacity?.toLocaleString()} kg</td>
                    <td style={{ fontSize: 13 }}>{v.odometer?.toLocaleString()} km</td>
                    <td style={{ fontSize: 13 }}>{formatCurrency(v.acquisitionCost)}</td>
                    <td><span className={`badge ${statusClass[v.status] || 'badge-secondary'}`}>{v.status}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-secondary btn-sm" onClick={() => { setEditVehicle(v); setShowModal(true); }} title="Edit">✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(v._id)} title="Delete">🗑️</button>
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
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const p = i + 1;
                return (
                  <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                );
              })}
              <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === pages}>Next →</button>
            </div>
          </div>
        </>
      )}

      {showModal && (
        <VehicleModal
          vehicle={editVehicle}
          onClose={() => { setShowModal(false); setEditVehicle(null); }}
          onSave={() => { setShowModal(false); setEditVehicle(null); fetchVehicles(); }}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          message="Are you sure you want to delete this vehicle? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};

export default Vehicles;
