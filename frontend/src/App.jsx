
import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layout/MainLayout';
import LoginPage from './pages/LoginPage';
import InventarioPage from './pages/InventarioPage';
import VentasPage from './pages/VentasPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<div>Bienvenido</div>} />
            <Route path="login" element={<LoginPage />} />
            <Route path="inventario" element={<InventarioPage />} />
            <Route path="ventas" element={<VentasPage />} /> 
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
