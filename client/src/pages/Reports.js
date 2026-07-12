import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts';
import { reportsAPI, vehicleAPI } from '../services/api';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const formatCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const Reports = () => {
  const [data, setData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', vehicleId: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    vehicleAPI.getAll({ limit: 100 }).then(({ data: d }) => setVehicles(d.vehicles)).catch(() => {});
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const { data: d } = await reportsAPI.get({
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.vehicleId && { vehicleId: filters.vehicleId }),
      });
      setData(d);
    } catch (err) {
      setError('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReports();
  };

  const exportCSV = () => {
    if (!data?.vehicleReports?.length) return;
    const headers = ['Vehicle', 'Reg. Number', 'Type', 'Status', 'Fuel (L)', 'Fuel Cost', 'Maint. Cost', 'Revenue', 'Distance (km)', 'Fuel Eff. (km/L)', 'Op. Cost', 'ROI %'];
    const rows = data.vehicleReports.map((r) => [
      r.vehicle.vehicleName,
      r.vehicle.registrationNumber,
      r.vehicle.vehicleType,
      r.vehicle.status,
      r.fuel.liters,
      r.fuel.cost,
      r.maintenanceCost,
      r.revenue,
      r.distance,
      r.fuelEfficiency,
      r.operationalCost,
      r.roi,
    ]);
    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transitops_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const monthlyFuelData = (data?.monthlyFuel || []).map((m) => ({
    name: MONTHS[m._id.month - 1],
    liters: m.liters,
    cost: m.cost,
  }));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h2>📈 Reports & Analytics</h2>
          <p>Fleet performance and cost analysis</p>
        </div>
        <button className="btn btn-success" onClick={exportCSV} disabled={!data?.vehicleReports?.length}>
          📥 Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-24">
        <form onSubmit={handleFilter} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 150 }}>
            <label className="form-label">Start Date</label>
            <input type="date" className="form-control"
              value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
          </div>
          <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 150 }}>
            <label className="form-label">End Date</label>
            <input type="date" className="form-control"
              value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
          </div>
          <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 180 }}>
            <label className="form-label">Filter by Vehicle</label>
            <select className="form-control"
              value={filters.vehicleId} onChange={(e) => setFilters({ ...filters, vehicleId: e.target.value })}>
              <option value="">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v._id} value={v._id}>{v.registrationNumber} — {v.vehicleName}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary">📊 Generate Report</button>
          <button type="button" className="btn btn-secondary" onClick={() => {
            setFilters({ startDate: '', endDate: '', vehicleId: '' });
          }}>Clear</button>
        </form>
      </div>

      {error && <div className="alert alert-error"><span>⚠️</span> {error}</div>}

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="kpi-grid mb-24">
            <div className="kpi-card" style={{ '--kpi-color': '#10b981' }}>
              <div className="kpi-value" style={{ fontSize: 20 }}>{formatCurrency(data.summary?.totalRevenue)}</div>
              <div className="kpi-label">💵 Total Revenue</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#ef4444' }}>
              <div className="kpi-value" style={{ fontSize: 20 }}>{formatCurrency(data.summary?.totalFuelCost)}</div>
              <div className="kpi-label">⛽ Fuel Cost</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#f59e0b' }}>
              <div className="kpi-value" style={{ fontSize: 20 }}>{formatCurrency(data.summary?.totalMaintenanceCost)}</div>
              <div className="kpi-label">🔧 Maintenance Cost</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#6366f1' }}>
              <div className="kpi-value" style={{ fontSize: 20 }}>{data.summary?.totalTrips}</div>
              <div className="kpi-label">🗺️ Completed Trips</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#06b6d4' }}>
              <div className="kpi-value" style={{ fontSize: 20 }}>{data.summary?.totalDistance?.toLocaleString()} km</div>
              <div className="kpi-label">🛣️ Total Distance</div>
            </div>
            <div className="kpi-card" style={{ '--kpi-color': '#8b5cf6' }}>
              <div className="kpi-value" style={{ fontSize: 20 }}>{data.fleetUtilization}%</div>
              <div className="kpi-label">📊 Fleet Utilization</div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-grid mb-24">
            <div className="chart-card">
              <h3>⛽ Monthly Fuel Consumption</h3>
              {monthlyFuelData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={monthlyFuelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: '#1a2035', border: '1px solid #1e2a3a', borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                    <Line type="monotone" dataKey="liters" stroke="#f59e0b" name="Liters" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="cost" stroke="#ef4444" name="Cost (₹)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state" style={{ padding: '40px 0' }}>
                  <p className="empty-title">No fuel data in selected period</p>
                </div>
              )}
            </div>

            <div className="chart-card">
              <h3>📊 Operational Cost vs Revenue by Vehicle</h3>
              {data.vehicleReports?.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.vehicleReports.slice(0, 8).map((r) => ({
                    name: r.vehicle.registrationNumber,
                    revenue: r.revenue,
                    opCost: r.operationalCost,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: '#1a2035', border: '1px solid #1e2a3a', borderRadius: 8 }} />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                    <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="opCost" fill="#ef4444" name="Op. Cost" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="empty-state" style={{ padding: '40px 0' }}>
                  <p className="empty-title">No data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle Report Table */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">🚛 Vehicle Performance Report</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{data.vehicleReports?.length} vehicles</span>
            </div>
            {data.vehicleReports?.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Vehicle</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Distance (km)</th>
                      <th>Fuel Used (L)</th>
                      <th>Fuel Eff.</th>
                      <th>Fuel Cost</th>
                      <th>Maint. Cost</th>
                      <th>Revenue</th>
                      <th>ROI %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.vehicleReports.map((r) => (
                      <tr key={r.vehicle._id}>
                        <td>
                          <div style={{ fontWeight: 500, color: 'var(--primary-light)', fontSize: 13 }}>
                            {r.vehicle.registrationNumber}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.vehicle.vehicleName}</div>
                        </td>
                        <td><span className="badge badge-secondary">{r.vehicle.vehicleType}</span></td>
                        <td>
                          <span className={`badge badge-${r.vehicle.status === 'Available' ? 'available' : r.vehicle.status === 'On Trip' ? 'on-trip' : r.vehicle.status === 'In Shop' ? 'in-shop' : 'retired'}`}>
                            {r.vehicle.status}
                          </span>
                        </td>
                        <td style={{ fontSize: 13 }}>{r.distance?.toLocaleString()}</td>
                        <td style={{ fontSize: 13 }}>{r.fuel.liters?.toFixed(1)}</td>
                        <td>
                          <span style={{ color: r.fuelEfficiency > 10 ? 'var(--success)' : r.fuelEfficiency > 5 ? 'var(--warning)' : 'var(--danger)', fontWeight: 600, fontSize: 13 }}>
                            {r.fuelEfficiency} km/L
                          </span>
                        </td>
                        <td style={{ fontSize: 13 }}>{formatCurrency(r.fuel.cost)}</td>
                        <td style={{ fontSize: 13 }}>{formatCurrency(r.maintenanceCost)}</td>
                        <td style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>{formatCurrency(r.revenue)}</td>
                        <td>
                          <span style={{
                            color: r.roi > 0 ? 'var(--success)' : r.roi < 0 ? 'var(--danger)' : 'var(--text-muted)',
                            fontWeight: 700, fontSize: 13,
                          }}>
                            {r.roi > 0 ? '+' : ''}{r.roi}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <div className="empty-icon">📊</div>
                <p className="empty-title">No report data available</p>
                <p className="empty-desc">Add vehicles, trips and fuel logs to see performance data</p>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Reports;
