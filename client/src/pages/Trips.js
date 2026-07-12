import React, { useState, useEffect, useCallback } from 'react';
import { tripAPI, vehicleAPI, driverAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TRIP_STATUSES = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];

const statusClass = {
  Draft: 'badge-draft',
  Dispatched: 'badge-dispatched',
  Completed: 'badge-completed',
  Cancelled: 'badge-cancelled',
};

const emptyForm = {
  source: '', destination: '', vehicle: '', driver: '',
  cargoWeight: '', cargoDescription: '', plannedDistance: '',
  plannedStartDate: '', plannedEndDate: '', revenue: '', notes: '',
};

const TripModal = ({ trip, onClose, onSave }) => {
  const [form, setForm] = useState(trip ? {
    source: trip.source || '',
    destination: trip.destination || '',
    vehicle: trip.vehicle?._id || trip.vehicle || '',
    driver: trip.driver?._id || trip.driver || '',
    cargoWeight: trip.cargoWeight || '',
    cargoDescription: trip.cargoDescription || '',
    plannedDistance: trip.plannedDistance || '',
    plannedStartDate: trip.plannedStartDate ? new Date(trip.plannedStartDate).toISOString().split('T')[0] : '',
    plannedEndDate: trip.plannedEndDate ? new Date(trip.plannedEndDate).toISOString().split('T')[0] : '',
    revenue: trip.revenue || '',
    notes: trip.notes || '',
  } : emptyForm);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      const [vRes, dRes] = await Promise.all([
        vehicleAPI.getAvailable(),
        driverAPI.getAvailable(),
      ]);
      let vList = vRes.data;
      if (trip?.vehicle) {
        const vId = trip.vehicle._id || trip.vehicle;
        if (vId && !vList.some((v) => v._id === vId)) {
          const vObj = typeof trip.vehicle === 'object' ? trip.vehicle : { _id: vId, registrationNumber: 'Current Vehicle', vehicleName: '' };
          vList = [vObj, ...vList];
        }
      }
      let dList = dRes.data;
      if (trip?.driver) {
        const dId = trip.driver._id || trip.driver;
        if (dId && !dList.some((d) => d._id === dId)) {
          const dObj = typeof trip.driver === 'object' ? trip.driver : { _id: dId, name: 'Current Driver' };
          dList = [dObj, ...dList];
        }
      }
      setAvailableVehicles(vList);
      setAvailableDrivers(dList);
    };
    load().catch(() => {});
  }, [trip]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.source || !form.destination || !form.vehicle || !form.driver || !form.cargoWeight || !form.plannedDistance) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      if (trip?._id) {
        await tripAPI.update(trip._id, form);
      } else {
        await tripAPI.create(form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{trip ? '✏️ Edit Trip' : '🗺️ Create Trip'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Source *</label>
              <input name="source" className="form-control" placeholder="e.g. Mumbai"
                value={form.source} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Destination *</label>
              <input name="destination" className="form-control" placeholder="e.g. Pune"
                value={form.destination} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Vehicle *</label>
              <select name="vehicle" className="form-control" value={form.vehicle} onChange={handleChange}>
                <option value="">Select vehicle</option>
                {availableVehicles.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.registrationNumber} — {v.vehicleName} ({v.maxLoadCapacity}kg)
                  </option>
                ))}
              </select>
              {availableVehicles.length === 0 && (
                <small style={{ color: 'var(--warning)', fontSize: 11 }}>No available vehicles</small>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Driver *</label>
              <select name="driver" className="form-control" value={form.driver} onChange={handleChange}>
                <option value="">Select driver</option>
                {availableDrivers.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} — {d.licenseNumber}
                  </option>
                ))}
              </select>
              {availableDrivers.length === 0 && (
                <small style={{ color: 'var(--warning)', fontSize: 11 }}>No available drivers</small>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Cargo Weight (kg) *</label>
              <input name="cargoWeight" type="number" className="form-control" placeholder="e.g. 2500"
                value={form.cargoWeight} onChange={handleChange} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Planned Distance (km) *</label>
              <input name="plannedDistance" type="number" className="form-control" placeholder="e.g. 150"
                value={form.plannedDistance} onChange={handleChange} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Planned Start Date</label>
              <input name="plannedStartDate" type="date" className="form-control"
                value={form.plannedStartDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Planned End Date</label>
              <input name="plannedEndDate" type="date" className="form-control"
                value={form.plannedEndDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Revenue (₹)</label>
              <input name="revenue" type="number" className="form-control" placeholder="e.g. 15000"
                value={form.revenue} onChange={handleChange} min="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Cargo Description</label>
              <input name="cargoDescription" className="form-control" placeholder="e.g. Electronic goods"
                value={form.cargoDescription} onChange={handleChange} />
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
            {loading ? 'Saving...' : trip ? '💾 Update Trip' : '➕ Create Trip'}
          </button>
        </div>
      </div>
    </div>
  );
};

const CompleteModal = ({ onConfirm, onCancel }) => {
  const [actualDistance, setActualDistance] = useState('');
  const [revenue, setRevenue] = useState('');
  const [liters, setLiters] = useState('');
  const [fuelCost, setFuelCost] = useState('');

  return (
    <div className="modal-overlay">
      <div className="confirm-dialog" style={{ maxWidth: 380, textAlign: 'left' }}>
        <div style={{ fontSize: 32, textAlign: 'center' }}>🏁</div>
        <h3 className="confirm-title" style={{ textAlign: 'center' }}>Complete Trip</h3>
        
        <div className="form-group mt-16">
          <label className="form-label">Actual Distance (km)</label>
          <input type="number" className="form-control" placeholder="e.g. 155"
            value={actualDistance} onChange={(e) => setActualDistance(e.target.value)} />
        </div>
        
        <div className="form-group">
          <label className="form-label">Revenue Earned (₹)</label>
          <input type="number" className="form-control" placeholder="e.g. 15000"
            value={revenue} onChange={(e) => setRevenue(e.target.value)} />
        </div>

        <div style={{ borderTop: '1px solid var(--border)', margin: '16px 0', paddingTop: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Fuel Purchased (Optional)
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 11 }}>Fuel Liters</label>
              <input type="number" className="form-control" placeholder="e.g. 15"
                value={liters} onChange={(e) => setLiters(e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 11 }}>Total Fuel Cost (₹)</label>
              <input type="number" className="form-control" placeholder="e.g. 1500"
                value={fuelCost} onChange={(e) => setFuelCost(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="confirm-btns" style={{ marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn btn-success" onClick={() => onConfirm({ actualDistance, revenue, liters, fuelCost })}>✅ Complete</button>
        </div>
      </div>
    </div>
  );
};

const CancelModal = ({ onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');

  return (
    <div className="modal-overlay">
      <div className="confirm-dialog" style={{ maxWidth: 360, textAlign: 'left' }}>
        <div style={{ fontSize: 32, textAlign: 'center' }}>❌</div>
        <h3 className="confirm-title" style={{ textAlign: 'center' }}>Cancel Trip</h3>
        <div className="form-group mt-16">
          <label className="form-label">Reason for cancellation</label>
          <textarea className="form-control" rows={3} value={reason}
            onChange={(e) => setReason(e.target.value)} placeholder="Enter reason..." />
        </div>
        <div className="confirm-btns" style={{ marginTop: 16 }}>
          <button className="btn btn-secondary" onClick={onCancel}>Go back</button>
          <button className="btn btn-danger" onClick={() => onConfirm({ cancelReason: reason })}>Cancel Trip</button>
        </div>
      </div>
    </div>
  );
};

const Trips = () => {
  const { user } = useAuth();
  const canManage = user?.role === 'fleet_manager';
  const [trips, setTrips] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTrip, setEditTrip] = useState(null);
  const [completeId, setCompleteId] = useState(null);
  const [cancelId, setCancelId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await tripAPI.getAll({
        page, limit: 10,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });
      setTrips(data.trips);
      setTotal(data.total);
      setPages(data.pages);
    } catch (err) {
      setError('Failed to load trips');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const handleDispatch = async (id) => {
    setActionLoading(id + '_dispatch');
    try {
      await tripAPI.dispatch(id);
      fetchTrips();
    } catch (err) {
      setError(err.response?.data?.message || 'Dispatch failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (data) => {
    setActionLoading(completeId + '_complete');
    try {
      await tripAPI.complete(completeId, data);
      setCompleteId(null);
      fetchTrips();
    } catch (err) {
      setError(err.response?.data?.message || 'Complete failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (data) => {
    setActionLoading(cancelId + '_cancel');
    try {
      await tripAPI.cancel(cancelId, data);
      setCancelId(null);
      fetchTrips();
    } catch (err) {
      setError(err.response?.data?.message || 'Cancel failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    try {
      await tripAPI.delete(deleteId);
      setDeleteId(null);
      fetchTrips();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
      setDeleteId(null);
    }
  };



  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>🗺️ Trips</h2>
          <p>{total} trips in system</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => { setEditTrip(null); setShowModal(true); }}>
            ➕ Create Trip
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span> {error}
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)' }}>✕</button>
        </div>
      )}

      <div className="filters-bar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search by trip#, source, destination..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          {TRIP_STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={fetchTrips}>🔄 Refresh</button>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : trips.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗺️</div>
          <p className="empty-title">No trips found</p>
          {canManage && (
            <button className="btn btn-primary mt-16" onClick={() => { setEditTrip(null); setShowModal(true); }}>➕ Create Trip</button>
          )}
        </div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Trip #</th>
                  <th>Route</th>
                  <th>Vehicle</th>
                  <th>Driver</th>
                  <th>Cargo</th>
                  <th>Planned Distance</th>
                  <th>Status</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {trips.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <span className="font-mono" style={{ fontSize: 12, color: 'var(--primary-light)', fontWeight: 600 }}>
                        {t.tripNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{t.source}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>→ {t.destination}</div>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      <div>{t.vehicle?.registrationNumber || '—'}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{t.vehicle?.vehicleName}</div>
                    </td>
                    <td style={{ fontSize: 13 }}>{t.driver?.name || '—'}</td>
                    <td style={{ fontSize: 12 }}>{t.cargoWeight?.toLocaleString()} kg</td>
                    <td style={{ fontSize: 12 }}>{t.plannedDistance} km</td>
                    <td><span className={`badge ${statusClass[t.status] || 'badge-secondary'}`}>{t.status}</span></td>
                    {canManage && (
                      <td>
                        <div className="action-btns" style={{ flexWrap: 'wrap' }}>
                          {t.status === 'Draft' && (
                            <>
                              <button
                                className="btn btn-success btn-sm"
                                onClick={() => handleDispatch(t._id)}
                                disabled={actionLoading === t._id + '_dispatch'}
                                title="Dispatch"
                              >
                                {actionLoading === t._id + '_dispatch' ? '...' : '🚀'}
                              </button>
                              <button className="btn btn-secondary btn-sm" onClick={() => { setEditTrip(t); setShowModal(true); }} title="Edit">✏️</button>
                            </>
                          )}
                          {t.status === 'Dispatched' && (
                            <>
                              <button className="btn btn-success btn-sm" onClick={() => setCompleteId(t._id)} title="Complete">✅</button>
                              <button className="btn btn-danger btn-sm" onClick={() => setCancelId(t._id)} title="Cancel">❌</button>
                            </>
                          )}
                          {t.status === 'Draft' && (
                            <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(t._id)} title="Delete">🗑️</button>
                          )}
                          {(t.status === 'Completed' || t.status === 'Cancelled') && (
                            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
                          )}
                        </div>
                      </td>
                    )}
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
        <TripModal
          trip={editTrip}
          onClose={() => { setShowModal(false); setEditTrip(null); }}
          onSave={() => { setShowModal(false); setEditTrip(null); fetchTrips(); }}
        />
      )}

      {completeId && (
        <CompleteModal
          onConfirm={handleComplete}
          onCancel={() => setCompleteId(null)}
        />
      )}

      {cancelId && (
        <CancelModal
          onConfirm={handleCancel}
          onCancel={() => setCancelId(null)}
        />
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="confirm-dialog">
            <div className="confirm-icon">🗑️</div>
            <h3 className="confirm-title">Delete Trip</h3>
            <p className="confirm-message">Are you sure you want to delete this trip?</p>
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

export default Trips;
