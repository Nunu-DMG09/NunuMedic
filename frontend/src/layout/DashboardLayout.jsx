import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import api from '../services/api';
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
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0); 
  const acknowledgedRef = useRef(new Set());
  const pollingRef = useRef(null);
  const prevLowIdsRef = useRef(new Set()); 

  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const fetchLowStock = async () => {
    try {
      
      const res = await api.get('/api/productos/paginar', { params: { page: 1, perPage: 1000 } });
      const payload = res.data ?? {};
      const items = Array.isArray(payload.items) ? payload.items : (Array.isArray(payload.data) ? payload.data : []);
      const low = items.filter(p => {
        const stockNum = Number(p.stock ?? 0);
        const minNum = Number(p.stock_minimo ?? 0);
        return !isNaN(minNum) && stockNum <= minNum;
      });

    
      const lowIds = new Set(low.map(p => String(p.id_producto ?? p.id ?? p.idProducto ?? '')));
      const prevIds = prevLowIdsRef.current || new Set();
      const newly = Array.from(lowIds).filter(id => id && !prevIds.has(id));
      if (newly.length > 0) {
        
        setUnseenCount(c => c + newly.length);
      }
      prevLowIdsRef.current = lowIds;

      setLowStockProducts(low);
    } catch (e) {
      console.error('Error fetching low stock products', e);
    }
  };

  useEffect(() => {
    fetchLowStock();
    pollingRef.current = setInterval(fetchLowStock, 6000);
    return () => clearInterval(pollingRef.current);
  }, []);

   const toggleNotifications = () => setShowNotifications(s => !s);
   const acknowledgeProduct = (id) => {
    const sid = String(id);
    if (!acknowledgedRef.current.has(sid)) {
      acknowledgedRef.current.add(sid);
      
      setUnseenCount(c => Math.max(0, c - 1));
      
      setLowStockProducts(prev => prev.slice());
    }
   };
   const handleGoToInventario = (id) => {
     
     navigate('/inventario');
     setShowNotifications(false);
   };

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
      
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({}) 
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
      
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <nav className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative z-50 md:z-auto w-28 h-full bg-white shadow-xl border-r border-slate-200/60 flex flex-col items-center py-8 transition-transform duration-300`}>
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600"></div>
        
       
        <div className="mb-10">
          <button
            onClick={() => navigate('/dashboard')}
            title="Ir a Dashboard"
            className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg focus:outline-none"
          >
            <span className="text-white font-bold text-xl select-none">NU</span>
          </button>
        </div>
        
       
        <div className="flex flex-col gap-3 w-full px-3">
          {menuItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              onClick={() => setSidebarOpen(false)}
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

        
        <div className="mt-auto text-xs text-slate-400 font-medium">v2.0</div>
      </nav>

     
      <div className="flex-1 flex flex-col overflow-hidden">
     
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/50 px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-6">
          <div className="flex justify-between items-center">
          
            <div className="flex items-center gap-3 sm:gap-6">
            
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div>
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  <span className="hidden sm:inline">NUNUMEDIC - Panel Administrativo</span>
                  <span className="sm:hidden">NUNUMEDIC</span>
                </h1>
                <p className="text-slate-600 text-xs sm:text-sm md:text-base mt-1 hidden sm:block">
                  Gestionamiento integral de ventas e inventario
                </p>
              </div>
            </div>
            
            {/* Right side - Actions */}
            <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
              {/* Notifications (low stock) */}
              <div className="relative">
                <button
                  onClick={toggleNotifications}
                  className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg focus:outline-none"
                  aria-label="Notificaciones de stock"
                  title="Notificaciones de stock"
                >
                  {/* Icono de campana */}
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11c0-3.07-1.64-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v0.68C7.64 5.36 6 7.93 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                   {unseenCount > 0 && (
                     <span className="absolute -top-1 -right-1 min-w-[16px] sm:min-w-[18px] h-4 sm:h-5 px-1 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
                       {unseenCount}
                     </span>
                   )}
                 </button>

                 {showNotifications && (
                   <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
                     <div className="p-3 border-b border-slate-100 flex items-center justify-between">
                       <div className="font-semibold text-sm sm:text-base">Alertas de stock</div>
                       <button
                         onClick={() => {
                         
                           (lowStockProducts || []).forEach(p => acknowledgedRef.current.add(String(p.id_producto ?? p.id)));
                           setUnseenCount(0);
                           setShowNotifications(false);
                         }}
                         className="text-xs sm:text-sm text-slate-500 hover:text-slate-700"
                       >
                         Marcar todas
                       </button>
                     </div>
                     <div className="max-h-64 overflow-auto">
                       {lowStockProducts.length === 0 ? (
                         <div className="p-4 text-xs sm:text-sm text-slate-500">No hay productos con stock en o por debajo del mínimo.</div>
                       ) : (
                         lowStockProducts.map(p => {
                           const id = p.id_producto ?? p.id ?? String(p._id ?? '');
                           const name = p.nombre || p.nombre_producto || p.nombreProducto || 'Sin nombre';
                           const seen = acknowledgedRef.current.has(String(id));
                          
                           const initials = name.split(' ').filter(Boolean).slice(0,2).map(w => w[0]).join('').toUpperCase();
                           return (
                             <div key={id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                               <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-md flex items-center justify-center">
                                   <span className="text-slate-600 font-semibold text-xs sm:text-sm">{initials}</span>
                                 </div>
                                 <div className="flex-1 min-w-0">
                                   <div className="text-xs sm:text-sm font-semibold text-slate-800 truncate">{name}</div>
                                   <div className="text-xs text-slate-500">Stock: <span className="font-medium text-slate-700">{p.stock}</span> • Min: {p.stock_minimo}</div>
                                 </div>
                               </div>
                               <div className="flex flex-col items-end gap-1 sm:gap-2">
                                 {!seen ? <span className="text-xs bg-red-100 text-red-700 px-1 sm:px-2 py-1 rounded">Nuevo</span> : <span className="text-xs text-slate-400">Visto</span>}
                                 <div className="flex gap-1 sm:gap-2">
                                   <button onClick={() => { acknowledgeProduct(id); }} className="px-1 sm:px-2 py-1 text-xs bg-slate-100 rounded hover:bg-slate-200">Marcar</button>
                                   <button onClick={() => handleGoToInventario(id)} className="px-1 sm:px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">Ver</button>
                                 </div>
                               </div>
                             </div>
                           );
                         })
                       )}
                     </div>
                     <div className="p-3 border-t border-slate-100 text-xs text-slate-500">
                       Actualización automática cada 6s.
                     </div>
                   </div>
                 )}
               </div>
              
             
              <button
                onClick={openLogoutModal}
                className="px-2 sm:px-3 py-1 sm:py-2 rounded-lg text-xs sm:text-sm text-red-600 bg-red-50 hover:bg-red-100 transition"
                title="Cerrar sesión"
              >
                <span className="hidden sm:inline">Cerrar sesión</span>
                <span className="sm:hidden">Salir</span>
              </button>

             
              <button
                onClick={() => navigate('/admins')}
                className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-2 sm:py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200/50 hover:shadow-md transition-colors focus:outline-none"
                title="Perfil / Usuarios"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-xs sm:text-sm">DM</span>
                </div>
                <span className="font-semibold text-slate-700 text-xs sm:text-sm md:text-base hidden sm:block">
                  L. David Mesta
                </span>
                <span className="font-semibold text-slate-700 text-xs sm:hidden">
                  DM
                </span>
              </button>
            </div>
          </div>
        </header>

      
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

   
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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

     
      {showNotifications && lowStockProducts.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={toggleNotifications} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">Productos con stock bajo</h3>
            <div className="max-h-60 overflow-y-auto mb-4">
              {lowStockProducts.map(product => {
                const id = product.id_producto ?? product.id ?? String(product._id ?? '');
                const name = product.nombre || product.nombre_producto || product.nombreProducto || 'Sin nombre';
                const initials = name.split(' ').filter(Boolean).slice(0,2).map(w => w[0]).join('').toUpperCase();
                return (
                  <div key={id} className="flex items-center justify-between py-2 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                        <span className="text-slate-600 font-semibold text-sm">{initials}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-slate-800 font-semibold">{name}</span>
                        <span className="text-slate-500 text-sm">{`Stock: ${product.stock} • Mínimo: ${product.stock_minimo}`}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { acknowledgeProduct(id); }}
                        className="px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-sm hover:bg-slate-200 transition"
                      >
                        Marcar
                      </button>
                      <button
                        onClick={() => handleGoToInventario(id)}
                        className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
                      >
                        Ir a inventario
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={toggleNotifications}
                className="px-4 py-2 rounded-md bg-gray-100 text-slate-700 hover:bg-gray-200 transition"
              >
                Ignorar
              </button>
              <button
                onClick={() => {
                  lowStockProducts.forEach(product => acknowledgeProduct(product.id_producto ?? product.id));
                  toggleNotifications();
                }}
                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition"
              >
                Marcar como visto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}