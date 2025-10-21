
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

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="inventario" element={<InventarioPage />} />
            <Route path="ventas" element={<VentasPage />} />
            <Route path="ventas/historial" element={<VentasHistorialPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
