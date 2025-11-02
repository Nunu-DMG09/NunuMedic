import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Icon = {
  Dashboard: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM13 3v6h8V3h-8zM3 21h8v-6H3v6z" stroke="currentColor" strokeWidth="1.5"/></svg>,
  Sales: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="1.5"/></svg>,
  Inventory: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="1.5"/></svg>,
  Movimientos: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M21 12a9 9 0 1 1-3-6.5" stroke="currentColor" strokeWidth="1.5"/><path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.5"/></svg>,
  Users: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="1.5"/></svg>,
  History: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M3 3v5h5M3.05 13A9 9 0 1 0 6 5.3L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Settings: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" stroke="currentColor" strokeWidth="1.5"/></svg>
};

export default function DashboardLayout() {
  const menuItems = [
    { to: '/dashboard', icon: Icon.Dashboard, label: 'Dashboard' },
    { to: '/ventas', icon: Icon.Sales, label: 'Ventas' },
    { to: '/ventas/historial', icon: Icon.History, label: 'Historial' },
    { to: '/inventario', icon: Icon.Inventory, label: 'Inventario' },
    { to: '/movimientos', icon: Icon.Movimientos, label: 'Movimientos' },
    { to: '/admins', icon: Icon.Users, label: 'Usuarios' }
  ];

  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const openLogoutModal = () => setIsLogoutModalOpen(true);
  const closeLogoutModal = () => {
    if (loggingOut) return;
    setIsLogoutModalOpen(false);
  };

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    try {
      // intenta invalidar sesión en backend si existe endpoint
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({}) // algunos backends aceptan sin body
        }).catch(() => { /* ignorar errores de red */ });
      }
    } catch (e) {
      console.warn('Logout API error', e);
    } finally {
      // limpiar contexto y redirigir al login
      logout();
      setLoggingOut(false);
      setIsLogoutModalOpen(false);
      navigate('/');
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* SIDEBAR */}
      <nav className="w-28 bg-white shadow-xl border-r border-slate-200/60 flex flex-col items-center py-8 relative">
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600"></div>
        
        {/* Logo */}
        <div className="mb-10">
          <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">NU</span>
          </div>
        </div>
        
        {/* Menu Items */}
        <div className="flex flex-col gap-3 w-full px-3">
          {menuItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              className={({ isActive }) =>
                `group relative flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105' 
                    : 'text-slate-600 hover:text-blue-600 hover:bg-blue-50 hover:scale-105'
                }`
              }
            >
              {item.icon}
              <div className="absolute left-full ml-6 px-4 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 min-w-max">
                {item.label}
              </div>
            </NavLink>
          ))}
        </div>

        {/* Version */}
        <div className="mt-auto text-xs text-slate-400 font-medium">v2.0</div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/50 px-12 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  NUNUMEDIC - Dashboard
                </h1>
                <p className="text-slate-600 text-base mt-1">Panel de control administrativo</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Notifications */}
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2L13 8l6 1-4.5 4.5L16 20l-6-3-6 3 1.5-6.5L1 9l6-1 3-6z"/>
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</div>
              </div>
              
              {/* Botón abrir modal logout */}
              <button
                onClick={openLogoutModal}
                className="px-3 py-2 rounded-lg text-sm text-red-600 bg-red-50 hover:bg-red-100 transition"
                title="Cerrar sesión"
              >
                Cerrar sesión
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-4 px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200/50">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">DM</span>
                </div>
                <span className="font-semibold text-slate-700 text-base">L. David Mesta</span>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT AREA - Aquí se renderiza el contenido de cada página */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeLogoutModal} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold mb-2">¿Estás seguro?</h3>
            <p className="text-sm text-slate-600 mb-6">¿Deseas cerrar la sesión actual? Serás redirigido a la pantalla de inicio de sesión.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeLogoutModal}
                disabled={loggingOut}
                className="px-4 py-2 rounded-md bg-gray-100 text-slate-700 hover:bg-gray-200 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={loggingOut}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2"
              >
                {loggingOut ? 'Cerrando...' : 'Cerrar sesión'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}