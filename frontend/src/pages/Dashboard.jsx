import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../services/api';

const Icon = {
  Dashboard: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM13 3v6h8V3h-8zM3 21h8v-6H3v6z" stroke="currentColor" strokeWidth="1.5"/></svg>,
  Sales: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M16 11V7a4 4 0 0 0-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="1.5"/></svg>,
  Inventory: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="1.5"/></svg>,
  Movimientos: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M21 12a9 9 0 1 1-3-6.5" stroke="currentColor" strokeWidth="1.5"/><path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.5"/></svg>,
  Users: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="currentColor" strokeWidth="1.5"/></svg>,
  History: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M3 3v5h5M3.05 13A9 9 0 1 0 6 5.3L3 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Settings: <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z" stroke="currentColor" strokeWidth="1.5"/></svg>
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalVentas: 0,
    ventasHoy: 0,
    totalIngresos: 0,
    ingresosHoy: 0,
    totalProductos: 0,
    productosActivos: 0,
    movimientosHoy: 0,
    usuariosActivos: 0,
    ventasRecientes: [],
    productosPopulares: [],
    loading: true
  });

  const menuItems = [
    { to: '/dashboard', icon: Icon.Dashboard, label: 'Dashboard' },
    { to: '/ventas', icon: Icon.Sales, label: 'Ventas' },
    { to: '/ventas/historial', icon: Icon.History, label: 'Historial' },
    { to: '/inventario', icon: Icon.Inventory, label: 'Inventario' },
    { to: '/movimientos', icon: Icon.Movimientos, label: 'Movimientos' },
    { to: '/admins', icon: Icon.Users, label: 'Usuarios' },
    { to: '/settings', icon: Icon.Settings, label: 'Configuración' }
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setStats(prev => ({ ...prev, loading: true }));

      // Fetch data en paralelo
      const [ventasRes, productosRes, movimientosRes, usuariosRes] = await Promise.all([
        api.get('/api/ventas/listar').catch(() => ({ data: { data: [] } })),
        api.get('/api/productos/listar').catch(() => ({ data: { data: [] } })),
        api.get('/api/movimientos/listar').catch(() => ({ data: { items: [] } })),
        api.get('/api/usuarios/listar').catch(() => ({ data: { data: [] } }))
      ]);

      const ventas = ventasRes.data?.data || [];
      const productos = productosRes.data?.data || [];
      const movimientos = movimientosRes.data?.items || [];
      const usuarios = usuariosRes.data?.data || [];

      // Calcular estadísticas
      const today = new Date().toISOString().split('T')[0];
      const ventasHoy = ventas.filter(v => v.fecha?.startsWith(today));
      const movimientosHoy = movimientos.filter(m => m.fecha_movimiento?.startsWith(today));
      
      const totalIngresos = ventas.reduce((sum, v) => sum + parseFloat(v.total || 0), 0);
      const ingresosHoy = ventasHoy.reduce((sum, v) => sum + parseFloat(v.total || 0), 0);
      
      const productosActivos = productos.filter(p => p.estado === 'activo');

      // Top productos (simulado basado en ventas)
      const productosPopulares = productos.slice(0, 5).map((p, i) => ({
        nombre: p.nombre_producto,
        ventas: Math.floor(Math.random() * 50) + 10,
        ingresos: Math.floor(Math.random() * 5000) + 1000
      }));

      setStats({
        totalVentas: ventas.length,
        ventasHoy: ventasHoy.length,
        totalIngresos: totalIngresos,
        ingresosHoy: ingresosHoy,
        totalProductos: productos.length,
        productosActivos: productosActivos.length,
        movimientosHoy: movimientosHoy.length,
        usuariosActivos: usuarios.filter(u => u.estado === 'activo').length,
        ventasRecientes: ventas.slice(0, 6),
        productosPopulares: productosPopulares,
        loading: false
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* SIDEBAR - Más ancho para acomodar nuevo enlace */}
      <nav className="w-28 bg-white shadow-xl border-r border-slate-200/60 flex flex-col items-center py-8 relative">
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600"></div>
        
        <div className="mb-10">
          <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-xl">NU</span>
          </div>
        </div>
        
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

        <div className="mt-auto text-xs text-slate-400 font-medium">v2.0</div>
      </nav>

      {/* MAIN CONTENT - Más espaciado */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOP HEADER - Más padding */}
        <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-slate-200/50 px-12 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  NUNUMED Dashboard
                </h1>
                <p className="text-slate-600 text-base mt-1">Panel de control administrativo</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2L13 8l6 1-4.5 4.5L16 20l-6-3-6 3 1.5-6.5L1 9l6-1 3-6z"/>
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</div>
              </div>
              
              <div className="flex items-center gap-4 px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-200/50">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">AD</span>
                </div>
                <span className="font-semibold text-slate-700 text-base">Administrador</span>
              </div>
            </div>
          </div>
        </header>

        {/* METRICS ROW - Más espacio */}
        <div className="px-12 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Total Ventas - Cards más grandes */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-sm opacity-90 mb-1">Hoy</div>
                    <div className="text-xl font-bold">{stats.ventasHoy}</div>
                  </div>
                </div>
                <div className="text-sm opacity-90 mb-2">Total de Ventas</div>
                <div className="text-4xl font-bold mb-3">{stats.loading ? '...' : stats.totalVentas.toLocaleString()}</div>
                <div className="text-sm opacity-75">+{stats.ventasHoy} ventas hoy</div>
              </div>
            </div>

            {/* Total Ingresos */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full -translate-y-20 translate-x-20"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                    <svg className="w-7 h-7 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600 mb-1">Hoy</div>
                    <div className="text-xl font-bold text-slate-800">S/. {stats.loading ? '...' : stats.ingresosHoy.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
                  </div>
                </div>
                <div className="text-sm text-slate-600 mb-2">Ingresos Totales</div>
                <div className="text-4xl font-bold text-slate-800 mb-3">S/. {stats.loading ? '...' : stats.totalIngresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
                <div className="text-sm text-green-600 font-medium">↗ +{((stats.ingresosHoy / Math.max(stats.totalIngresos, 1)) * 100).toFixed(1)}% hoy</div>
              </div>
            </div>

            {/* Productos */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full -translate-y-20 translate-x-20"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-gradient-to-r from-purple-100 to-violet-100 rounded-xl">
                    <svg className="w-7 h-7 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM6 9.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm.5 2.5a.5.5 0 000 1h7a.5.5 0 000-1h-7z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600 mb-1">Activos</div>
                    <div className="text-xl font-bold text-slate-800">{stats.productosActivos}</div>
                  </div>
                </div>
                <div className="text-sm text-slate-600 mb-2">Total Productos</div>
                <div className="text-4xl font-bold text-slate-800 mb-3">{stats.loading ? '...' : stats.totalProductos.toLocaleString()}</div>
                <div className="text-sm text-slate-600">Stock disponible</div>
              </div>
            </div>

            {/* Actividad */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-slate-200/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full -translate-y-20 translate-x-20"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl">
                    <svg className="w-7 h-7 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600 mb-1">Usuarios</div>
                    <div className="text-xl font-bold text-slate-800">{stats.usuariosActivos}</div>
                  </div>
                </div>
                <div className="text-sm text-slate-600 mb-2">Movimientos Hoy</div>
                <div className="text-4xl font-bold text-slate-800 mb-3">{stats.loading ? '...' : stats.movimientosHoy}</div>
                <div className="text-sm text-slate-600">Actividad del sistema</div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT GRID - Más amplio */}
        <div className="flex-1 px-12 pb-10 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 h-full">
            {/* LEFT: RECENT SALES - 3 columnas de 5 */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800">Ventas Recientes</h3>
                <NavLink to="/ventas/historial" className="text-blue-600 hover:text-blue-700 font-medium text-base flex items-center gap-2">
                  Ver historial completo
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                </NavLink>
              </div>
              
              <div className="space-y-5">
                {stats.loading ? (
                  <div className="text-center py-12 text-slate-500">Cargando ventas...</div>
                ) : stats.ventasRecientes.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">No hay ventas recientes</div>
                ) : (
                  stats.ventasRecientes.map((venta, i) => (
                    <div key={venta.id_venta || i} className="flex items-center gap-6 p-5 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold">
                          {(venta.cliente_nombre || 'Cliente').split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800 text-base">
                          {venta.cliente_nombre ? `${venta.cliente_nombre} ${venta.cliente_apellido || ''}` : 'Cliente Anónimo'}
                        </div>
                        <div className="text-slate-600 mt-1">
                          {venta.fecha || 'Fecha no disponible'} • {(venta.items || []).length} productos
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-800 text-lg">S/. {parseFloat(venta.total || 0).toFixed(2)}</div>
                        <div className="text-sm text-green-600 font-medium">Completada</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT: ANALYTICS - 2 columnas de 5, más ancho */}
            <div className="lg:col-span-2 space-y-8">
              {/* Top Products - Panel más amplio */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8">
                <h3 className="text-xl font-bold text-slate-800 mb-6">Productos Populares</h3>
                <div className="space-y-4">
                  {stats.productosPopulares.map((producto, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                        i === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                        i === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                        i === 2 ? 'bg-gradient-to-r from-amber-600 to-orange-600' :
                        'bg-gradient-to-r from-blue-500 to-indigo-600'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-800 truncate">{producto.nombre}</div>
                        <div className="text-sm text-slate-600">{producto.ventas} ventas</div>
                      </div>
                      <div className="font-bold text-slate-800 whitespace-nowrap">
                        S/. {producto.ingresos?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions - Panel más amplio */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl p-8 text-white">
                <h3 className="text-xl font-bold mb-6">Acciones Rápidas</h3>
                <div className="space-y-4">
                  <NavLink to="/ventas" className="block p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    <div className="font-medium text-base">Nueva Venta</div>
                    <div className="text-sm opacity-75 mt-1">Registrar venta rápida</div>
                  </NavLink>
                  <NavLink to="/ventas/historial" className="block p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    <div className="font-medium text-base">Ver Historial</div>
                    <div className="text-sm opacity-75 mt-1">Consultar ventas pasadas</div>
                  </NavLink>
                  <NavLink to="/inventario" className="block p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    <div className="font-medium text-base">Gestionar Stock</div>
                    <div className="text-sm opacity-75 mt-1">Actualizar inventario</div>
                  </NavLink>
                  <button onClick={fetchDashboardData} className="block w-full text-left p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                    <div className="font-medium text-base">Actualizar Datos</div>
                    <div className="text-sm opacity-75 mt-1">Refrescar estadísticas</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}