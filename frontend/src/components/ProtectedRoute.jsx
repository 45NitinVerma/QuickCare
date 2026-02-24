import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to their own dashboard if they don't have access to this route
    const roleRoutes = {
      Patient: '/patient',
      Doctor: '/doctor',
      Lab: '/lab',
      Admin: '/admin'
    };
    return <Navigate to={roleRoutes[user.role] || '/'} replace />;
  }

  return <Outlet />;
}
