
import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layout/MainLayout';
import LoginPage from './pages/LoginPage';
import InventarioPage from './pages/InventarioPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<div>Bienvenido</div>} />
            <Route path="login" element={<LoginPage />} />
            <Route path="inventario" element={<InventarioPage />} />
            <Route path="ventas" element={<div>Página de ventas (por crear)</div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
