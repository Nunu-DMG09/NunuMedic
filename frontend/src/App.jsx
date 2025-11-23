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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
      
            <Route path="/login" element={<LoginPage />} />

            {/* Protegiendo rutas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="inventario" element={<InventarioPage />} />
                <Route path="ventas" element={<VentasPage />} />
                <Route path="ventas/historial" element={<VentasHistorialPage />} />
                <Route path="movimientos" element={<MovimientosPage />} />
                <Route path="admins" element={<AdminsPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
