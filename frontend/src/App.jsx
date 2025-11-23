import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import InventarioPage from './pages/InventarioPage';
import VentasPage from './pages/VentasPage';
import VentasHistorialPage from './pages/VentasHistorialPage';
import Dashboard from './pages/Dashboard';
import MovimientosPage from './pages/MovimientosPage';
import AdminsPage from './pages/AdminsPage';
import DashboardLayout from './layout/DashboardLayout';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './filters/roles';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>

            <Route path="/login" element={<LoginPage />} />

           
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardLayout />}>

                <Route index element={<Navigate to="dashboard" replace />} />

              
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                
                <Route
                  path="inventario"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                      <InventarioPage />
                    </ProtectedRoute>
                  }
                />

               
                <Route
                  path="ventas"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.VENDEDOR]}>
                      <VentasPage />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="ventas/historial"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.VENDEDOR]}>
                      <VentasHistorialPage />
                    </ProtectedRoute>
                  }
                />

              
                <Route
                  path="movimientos"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
                      <MovimientosPage />
                    </ProtectedRoute>
                  }
                />

            
                <Route
                  path="admins"
                  element={
                    <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                      <AdminsPage />
                    </ProtectedRoute>
                  }
                />

              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
