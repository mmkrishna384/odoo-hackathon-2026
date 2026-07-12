import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { dashboardAPI } from '../services/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PIE_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const KPICard = ({ icon, label, value, color, bg, subtitle }) => (
  <div className="kpi-card" style={{ '--kpi-color': color, '--kpi-bg': bg }}>
    <div className="kpi-top">
      <div className="kpi-icon">{icon}</div>
    </div>
    <div className="kpi-value">{value}</div>
    <div className="kpi-label">{label}</div>
    {subtitle && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{subtitle}</div>}
  </div>
);

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [vehicleType, setVehicleType] = useState('');
  const [status, setStatus] = useState('');
  const [region, setRegion] = useState('');

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (vehicleType) params.vehicleType = vehicleType;
      if (status) params.status = status;
      if (region) params.region = region;

      const { data: d } = await dashboardAPI.get(params);
      setData(d);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [vehicleType, status, region]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p className="loading-text">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>⚠️</span> {error}
        <button onClick={fetchDashboard} className="btn btn-sm btn-secondary" style={{ marginLeft: 'auto' }}>
          Retry
        </button>
      </div>
    );
  }

  const { vehicles = {}, drivers = {}, trips = {}, fleetUtilization = 0, financials = {}, recentTrips = [], charts = {} } = data || {};

  // Process monthly trips for chart
  const monthlyData = (charts.monthlyTrips || []).map((m) => ({
    name: MONTHS[m._id.month - 1],
    trips: m.count,
    completed: m.completed,
  }));

  // Vehicle type distribution
  const vehicleTypeData = (charts.vehicleTypes || []).map((v) => ({
    name: v._id,
    value: v.count,
  }));

  const getStatusBadge = (status) => {
    const map = {
      Draft: 'badge-draft',
      Dispatched: 'badge-dispatched',
      Completed: 'badge-completed',
      Cancelled: 'badge-cancelled',
    };
    return map[status] || 'badge-secondary';
  };

  return (
    <div>
      {/* Filters Bar */}
      <div className="card mb-24" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 150 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Vehicle Type
            </span>
            <select className="filter-select" style={{ width: '100%', padding: '8px 12px', height: 38 }} value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
              <option value="">All Types</option>
              {['Truck', 'Van', 'Pickup', 'Tanker', 'Trailer', 'Bus', 'Car', 'Motorcycle'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Status
            </span>
            <select className="filter-select" style={{ width: '100%', padding: '8px 12px', height: 38 }} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {['Available', 'On Trip', 'In Shop', 'Retired'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Region
            </span>
            <input
              className="form-control"
              style={{ height: 38, padding: '8px 12px', fontSize: 13, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', width: '100%' }}
              placeholder="e.g. North Zone"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </div>
          <div>
            <button className="btn btn-secondary" style={{ height: 38 }} onClick={() => { setVehicleType(''); setStatus(''); setRegion(''); }}>
              🔄 Reset
            </button>
          </div>
        </div>
      </div>

      {/* KPI Section - Vehicles */}
      <div className="mb-24">
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
          🚛 Fleet Status
        </h3>
        <div className="kpi-grid">
          <KPICard icon="🚛" label="Total Vehicles" value={vehicles.total || 0} color="#6366f1" bg="rgba(99,102,241,0.15)" />
          <KPICard icon="✅" label="Available" value={vehicles.available || 0} color="#10b981" bg="rgba(16,185,129,0.15)" />
          <KPICard icon="🛣️" label="On Trip" value={vehicles.onTrip || 0} color="#3b82f6" bg="rgba(59,130,246,0.15)" />
          <KPICard icon="🔧" label="In Maintenance" value={vehicles.inShop || 0} color="#f59e0b" bg="rgba(245,158,11,0.15)" />
          <KPICard icon="🚫" label="Retired" value={vehicles.retired || 0} color="#ef4444" bg="rgba(239,68,68,0.15)" />
          <KPICard
            icon="📊"
            label="Fleet Utilization"
            value={`${fleetUtilization}%`}
            color="#06b6d4"
            bg="rgba(6,182,212,0.15)"
            subtitle="Vehicles currently on trip"
          />
        </div>
      </div>

      {/* KPI Section - Drivers & Trips */}
      <div className="mb-24">
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
          👤 Drivers & Trips
        </h3>
        <div className="kpi-grid">
          <KPICard icon="👥" label="Total Drivers" value={drivers.total || 0} color="#8b5cf6" bg="rgba(139,92,246,0.15)" />
          <KPICard icon="✅" label="Available Drivers" value={drivers.available || 0} color="#10b981" bg="rgba(16,185,129,0.15)" />
          <KPICard icon="🛞" label="Drivers On Duty" value={drivers.onDuty || 0} color="#3b82f6" bg="rgba(59,130,246,0.15)" />
          <KPICard icon="🗺️" label="Active Trips" value={trips.active || 0} color="#06b6d4" bg="rgba(6,182,212,0.15)" />
          <KPICard icon="⏳" label="Pending Trips" value={trips.pending || 0} color="#f59e0b" bg="rgba(245,158,11,0.15)" />
          <KPICard icon="🏁" label="Completed Trips" value={trips.completed || 0} color="#10b981" bg="rgba(16,185,129,0.15)" />
        </div>
      </div>

      {/* KPI Section - Financials */}
      <div className="mb-24">
        <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>
          💰 Financials
        </h3>
        <div className="kpi-grid">
          <KPICard icon="⛽" label="Total Fuel Cost" value={formatCurrency(financials.totalFuelCost)} color="#f59e0b" bg="rgba(245,158,11,0.15)" />
          <KPICard icon="🔧" label="Maintenance Cost" value={formatCurrency(financials.totalMaintenanceCost)} color="#ef4444" bg="rgba(239,68,68,0.15)" />
          <KPICard icon="💸" label="Operational Cost" value={formatCurrency(financials.totalOperationalCost)} color="#6366f1" bg="rgba(99,102,241,0.15)" />
          <KPICard icon="💵" label="Total Revenue" value={formatCurrency(financials.totalRevenue)} color="#10b981" bg="rgba(16,185,129,0.15)" />
        </div>
      </div>

      {/* Charts & Recent Trips */}
      <div className="dashboard-grid">
        <div>
          {/* Monthly Trips Bar Chart */}
          <div className="chart-card mb-24">
            <h3>📈 Monthly Trip Activity (Last 6 Months)</h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: '#1a2035', border: '1px solid #1e2a3a', borderRadius: 8 }}
                    labelStyle={{ color: '#f1f5f9' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                  <Bar dataKey="trips" fill="#6366f1" name="Total Trips" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-icon">📊</div>
                <p className="empty-title">No trip data yet</p>
                <p className="empty-desc">Start creating trips to see analytics</p>
              </div>
            )}
          </div>

          {/* Recent Trips */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🕐 Recent Trips</span>
              <a href="/trips" style={{ fontSize: 12, color: 'var(--primary-light)' }}>View all →</a>
            </div>
            {recentTrips.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Trip #</th>
                      <th>Route</th>
                      <th>Vehicle</th>
                      <th>Driver</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTrips.map((trip) => (
                      <tr key={trip._id}>
                        <td>
                          <span className="font-mono" style={{ fontSize: 12, color: 'var(--primary-light)' }}>
                            {trip.tripNumber}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontSize: 13 }}>{trip.source}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>→ {trip.destination}</div>
                        </td>
                        <td style={{ fontSize: 12 }}>{trip.vehicle?.registrationNumber || '—'}</td>
                        <td style={{ fontSize: 12 }}>{trip.driver?.name || '—'}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(trip.status)}`}>
                            {trip.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-icon">🗺️</div>
                <p className="empty-title">No trips yet</p>
              </div>
            )}
          </div>
        </div>

        <div>
          {/* Vehicle Type Pie Chart */}
          <div className="chart-card mb-24">
            <h3>🚛 Fleet by Vehicle Type</h3>
            {vehicleTypeData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={vehicleTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {vehicleTypeData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1a2035', border: '1px solid #1e2a3a', borderRadius: 8 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                  {vehicleTypeData.map((v, i) => (
                    <div key={v.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span style={{ color: 'var(--text-secondary)' }}>{v.name}: {v.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-icon">🚛</div>
                <p className="empty-title">No vehicles yet</p>
              </div>
            )}
          </div>

          {/* Driver Status Summary */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">👤 Driver Status</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Available', value: drivers.available || 0, color: '#10b981' },
                { label: 'On Trip', value: drivers.onDuty || 0, color: '#3b82f6' },
                { label: 'Off Duty', value: (drivers.total || 0) - (drivers.available || 0) - (drivers.onDuty || 0) - (drivers.suspended || 0), color: '#94a3b8' },
                { label: 'Suspended', value: drivers.suspended || 0, color: '#ef4444' },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{item.value}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 2 }}>
                    <div
                      style={{
                        height: '100%',
                        width: drivers.total > 0 ? `${Math.max(0, (item.value / drivers.total) * 100)}%` : '0%',
                        background: item.color,
                        borderRadius: 2,
                        transition: 'width 0.6s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
