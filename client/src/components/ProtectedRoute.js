import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container" style={{ height: '100vh' }}>
        <div className="spinner" />
        <p className="loading-text">Loading TransitOps...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const defaultPath = user.role === 'driver' ? '/trips' : '/dashboard';
    return <Navigate to={defaultPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
