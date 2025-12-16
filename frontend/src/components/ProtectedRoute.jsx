import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { ROLES } from '../filters/roles';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-sm text-slate-600">Cargando...</div>
      </div>
    );
  }

 
  if (!user) return <Navigate to="/login" replace />;

 
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    return children ?? <Outlet />;
  }

 
  if (!allowedRoles.includes(user.rol)) {
    if (user.rol === ROLES.VENDEDOR) return <Navigate to="/ventas" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  
  return children ?? <Outlet />;
}