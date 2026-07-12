import React, { useState, useEffect, useCallback } from 'react';
import { expenseAPI, vehicleAPI, tripAPI } from '../services/api';

const EXPENSE_TYPES = ['Toll', 'Maintenance', 'Miscellaneous', 'Salary', 'Insurance', 'Tax', 'Fuel'];
const PAYMENT_METHODS = ['Cash', 'Card', 'Bank Transfer', 'UPI'];

const emptyForm = {
  vehicle: '', trip: '', expenseType: 'Toll', amount: '',
  date: new Date().toISOString().split('T')[0], description: '',
  paymentMethod: 'Cash', receiptNumber: '', notes: '',
};

const ExpenseModal = ({ expense, onClose, onSave }) => {
  const [form, setForm] = useState(expense ? {
    vehicle: expense.vehicle?._id || expense.vehicle || '',
    trip: expense.trip?._id || expense.trip || '',
    expenseType: expense.expenseType || 'Toll',
    amount: expense.amount || '',
    date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    description: expense.description || '',
    paymentMethod: expense.paymentMethod || 'Cash',
    receiptNumber: expense.receiptNumber || '',
    notes: expense.notes || '',
  } : emptyForm);
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    vehicleAPI.getAll({ limit: 100 }).then(({ data }) => setVehicles(data.vehicles)).catch(() => {});
    tripAPI.getAll({ limit: 50 }).then(({ data }) => setTrips(data.trips)).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.amount || !form.description || !form.date) {
      setError('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      if (expense?._id) {
        await expenseAPI.update(expense._id, form);
      } else {
        await expenseAPI.create(form);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{expense ? '✏️ Edit Expense' : '💰 Add Expense'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Expense Type *</label>
              <select name="expenseType" className="form-control" value={form.expenseType} onChange={handleChange}>
                {EXPENSE_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input name="amount" type="number" className="form-control" placeholder="e.g. 500"
                value={form.amount} onChange={handleChange} min="0" />
            </div>
            <div className="form-group form-full">
              <label className="form-label">Description *</label>
              <input name="description" className="form-control" placeholder="Brief description of expense"
                value={form.description} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Vehicle</label>
              <select name="vehicle" className="form-control" value={form.vehicle} onChange={handleChange}>
                <option value="">None</option>
                {vehicles.map((v) => (
                  <option key={v._id} value={v._id}>{v.registrationNumber} — {v.vehicleName}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Trip</label>
              <select name="trip" className="form-control" value={form.trip} onChange={handleChange}>
                <option value="">None</option>
                {trips.map((t) => (
                  <option key={t._id} value={t._id}>{t.tripNumber} — {t.source} → {t.destination}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input name="date" type="date" className="form-control"
                value={form.date} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select name="paymentMethod" className="form-control" value={form.paymentMethod} onChange={handleChange}>
                {PAYMENT_METHODS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Receipt Number</label>
              <input name="receiptNumber" className="form-control" placeholder="e.g. REC-001"
                value={form.receiptNumber} onChange={handleChange} />
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
            {loading ? 'Saving...' : expense ? '💾 Update' : '➕ Add Expense'}
          </button>
        </div>
      </div>
    </div>
  );
};

const typeColors = {
  Toll: '#6366f1', Maintenance: '#ef4444', Miscellaneous: '#94a3b8',
  Salary: '#10b981', Insurance: '#3b82f6', Tax: '#f59e0b', Fuel: '#f97316',
};

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await expenseAPI.getAll({
        page, limit: 10,
        ...(search && { search }),
        ...(typeFilter && { expenseType: typeFilter }),
      });
      setExpenses(data.expenses);
      setTotal(data.total);
      setPages(data.pages);
      setStats(data.stats || []);
      setTotalAmount(data.totalAmount || 0);
    } catch (err) {
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  }, [page, search, typeFilter]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);
  useEffect(() => { setPage(1); }, [search, typeFilter]);

  const handleDelete = async () => {
    try {
      await expenseAPI.delete(deleteId);
      setDeleteId(null);
      fetchExpenses();
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
          <h2>💰 Expenses</h2>
          <p>{total} expense records</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditExpense(null); setShowModal(true); }}>
          ➕ Add Expense
        </button>
      </div>

      {/* Stats Summary */}
      <div
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12, marginBottom: 20,
        }}
      >
        <div className="kpi-card" style={{ '--kpi-color': '#6366f1' }}>
          <div className="kpi-value" style={{ fontSize: 22 }}>{formatCurrency(totalAmount)}</div>
          <div className="kpi-label">💰 Total Expenses</div>
        </div>
        {stats.slice(0, 4).map((s) => (
          <div key={s._id} className="kpi-card" style={{ '--kpi-color': typeColors[s._id] || '#94a3b8' }}>
            <div className="kpi-value" style={{ fontSize: 20 }}>{formatCurrency(s.total)}</div>
            <div className="kpi-label">{s._id} ({s.count})</div>
          </div>
        ))}
      </div>

      {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}

      <div className="filters-bar">
        <div className="search-input-wrap">
          <span className="search-icon">🔍</span>
          <input className="search-input" placeholder="Search by description, receipt..."
            value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {EXPENSE_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <button className="btn btn-secondary btn-sm" onClick={fetchExpenses}>🔄 Refresh</button>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : expenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💰</div>
          <p className="empty-title">No expenses recorded</p>
          <button className="btn btn-primary mt-16" onClick={() => { setEditExpense(null); setShowModal(true); }}>➕ Add Expense</button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Vehicle</th>
                  <th>Trip</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp._id}>
                    <td style={{ fontSize: 12 }}>{formatDate(exp.date)}</td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: `${typeColors[exp.expenseType]}22`,
                          color: typeColors[exp.expenseType] || '#94a3b8',
                        }}
                      >
                        {exp.expenseType}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {exp.description}
                      </div>
                    </td>
                    <td style={{ fontSize: 14, fontWeight: 600, color: 'var(--warning)' }}>
                      {formatCurrency(exp.amount)}
                    </td>
                    <td style={{ fontSize: 12 }}>{exp.vehicle?.registrationNumber || '—'}</td>
                    <td style={{ fontSize: 12 }}>{exp.trip?.tripNumber || '—'}</td>
                    <td style={{ fontSize: 12 }}>{exp.paymentMethod}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-secondary btn-sm" onClick={() => { setEditExpense(exp); setShowModal(true); }}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(exp._id)}>🗑️</button>
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
        <ExpenseModal
          expense={editExpense}
          onClose={() => { setShowModal(false); setEditExpense(null); }}
          onSave={() => { setShowModal(false); setEditExpense(null); fetchExpenses(); }}
        />
      )}

      {deleteId && (
        <div className="modal-overlay">
          <div className="confirm-dialog">
            <div className="confirm-icon">🗑️</div>
            <h3 className="confirm-title">Delete Expense</h3>
            <p className="confirm-message">Are you sure you want to delete this expense record?</p>
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

export default Expenses;
