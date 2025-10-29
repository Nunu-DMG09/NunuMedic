
import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layout/MainLayout';
import LoginPage from './pages/LoginPage';
import InventarioPage from './pages/InventarioPage';
import VentasPage from './pages/VentasPage';
import VentasHistorialPage from './pages/VentasHistorialPage';
import Dashboard from './pages/Dashboard';
import MovimientosPage from './pages/MovimientosPage';
import AdminsPage from './pages/AdminsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LoginPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="inventario" element={<InventarioPage />} />
            <Route path="ventas" element={<VentasPage />} />
            <Route path="ventas/historial" element={<VentasHistorialPage />} />
            <Route path="movimientos" element={<MovimientosPage />} />
            <Route path="admins" element={<AdminsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
