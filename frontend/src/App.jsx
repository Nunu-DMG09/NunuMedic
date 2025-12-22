import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './modules/auth/context/AuthContext';
import LoginPage from './modules/auth/pages/LoginPage';
import InventarioPage from './modules/inventario/pages/InventarioPage';
import VentasPage from './modules/ventas/pages/VentasPage';
import VentasHistorialPage from './modules/historial_ventas/pages/VentasHistorialPage';
import Dashboard from './pages/Dashboard';
import MovimientosPage from './modules/movimientos/pages/MovimientosPage';
import AdminsPage from './modules/Admin/pages/AdminsPage';
import DashboardLayout from './core/layouts/DashboardLayout';
import { ThemeProvider } from './core/context/ThemeContext';
import ProtectedRoute from './modules/auth/components/ProtectedRoute';
import { ROLES } from './modules/auth/utils/roles';

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
