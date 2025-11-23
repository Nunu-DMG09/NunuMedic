import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function ProtectedRoute({ redirectTo = '/login', children }) {
  const { user, token } = useAuth(); 
    
  if (!user && !token) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? children : <Outlet />;
}