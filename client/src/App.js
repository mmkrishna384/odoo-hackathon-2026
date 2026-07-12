import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Styles
import './styles/global.css';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import FuelLogs from './pages/FuelLogs';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Navbar onMenuToggle={() => setSidebarOpen((o) => !o)} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute roles={['fleet_manager', 'safety_officer', 'financial_analyst']}>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/vehicles" element={
        <ProtectedRoute roles={['fleet_manager', 'driver']}>
          <AppLayout>
            <Vehicles />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/drivers" element={
        <ProtectedRoute roles={['safety_officer']}>
          <AppLayout>
            <Drivers />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/trips" element={
        <ProtectedRoute roles={['fleet_manager', 'driver']}>
          <AppLayout>
            <Trips />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/maintenance" element={
        <ProtectedRoute roles={['fleet_manager']}>
          <AppLayout>
            <Maintenance />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/fuel" element={
        <ProtectedRoute roles={['financial_analyst']}>
          <AppLayout>
            <FuelLogs />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/expenses" element={
        <ProtectedRoute roles={['financial_analyst']}>
          <AppLayout>
            <Expenses />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/reports" element={
        <ProtectedRoute roles={['fleet_manager', 'financial_analyst']}>
          <AppLayout>
            <Reports />
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout>
            <Profile />
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={user ? (user.role === 'driver' ? '/trips' : '/dashboard') : '/login'} replace />} />
      <Route path="*" element={<Navigate to={user ? (user.role === 'driver' ? '/trips' : '/dashboard') : '/login'} replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
