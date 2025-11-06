import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalVentas: 0,
    ventasHoy: 0,
    totalIngresos: 0,
    ingresosHoy: 0,
    totalProductos: 0,
    productosDisponibles: 0,
    movimientosHoy: 0,
    movimientosTotal: 0,
    usuariosActivos: 0,
    ventasRecientes: [],
    productosPopulares: [],
    loading: true
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      setStats(prev => ({ ...prev, loading: true }));

      const [ventasRes, productosRes, movimientosRes, usuariosRes] = await Promise.all([
        api.get('/api/ventas/listar').catch(() => ({ data: { data: [] } })),
        api.get('/api/productos/listar').catch(() => ({ data: { data: [] } })),
        api.get('/api/movimientos/listar').catch(() => ({ data: { items: [] } })),
        api.get('/api/usuarios/listar').catch(() => ({ data: { data: [] } }))
      ]);

      const ventas = ventasRes?.data?.data || ventasRes?.data?.ventas || ventasRes?.data || [];
      const productos = productosRes?.data?.data || productosRes?.data?.productos || productosRes?.data || [];
      const movimientos = movimientosRes?.data?.items || movimientosRes?.data?.data || movimientosRes?.data || [];
      const usuarios = usuariosRes?.data?.data || usuariosRes?.data || [];

      const today = new Date().toISOString().split('T')[0];

      const ventasHoy = ventas.filter(v => {
        const f = v.fecha || v.fecha_venta || v.created_at || v.fecha_creacion || '';
        if (!f) return false;
        try {
          return f.startsWith ? f.startsWith(today) : new Date(f).toISOString().startsWith(today);
        } catch {
          return false;
        }
      });

      const movimientosHoyArr = movimientos.filter(m => {
        const f = m.fecha_movimiento || m.fecha || m.created_at || '';
        if (!f) return false;
        try {
          return f.startsWith ? f.startsWith(today) : new Date(f).toISOString().startsWith(today);
        } catch {
          return false;
        }
      });

      const totalIngresos = ventas.reduce((sum, v) => sum + parseFloat(v.total || v.total_venta || 0), 0);
      const ingresosHoy = ventasHoy.reduce((sum, v) => sum + parseFloat(v.total || v.total_venta || 0), 0);

      const productosDisponibles = productos.filter(p => String(p.estado).toLowerCase() === 'disponible').length;
      const totalProductos = productos.length;

      const prodMap = new Map();
      ventas.forEach(v => {
        const items = v.items || v.detalles || v.detalle || v.productos || v.items_venta || [];
        if (!Array.isArray(items) || items.length === 0) return;
        items.forEach(it => {
          const qty = Number(it.cantidad || it.qty || it.cantidad_producto || it.cantidad_venta) || 1;
          const price = Number(it.precio || it.precio_venta || it.precio_unitario || it.valor) || 0;
          const id = it.id_producto || it.producto_id || it.producto?.id || it.id || JSON.stringify(it.nombre_producto || it.producto_nombre || it.producto?.nombre || it.nombre || 'desconocido');
          const nombre = it.nombre_producto || it.producto_nombre || it.producto?.nombre_producto || it.producto?.nombre || it.nombre || 'Desconocido';
          const key = String(id);
          if (!prodMap.has(key)) prodMap.set(key, { nombre, ventas: 0, ingresos: 0 });
          const entry = prodMap.get(key);
          entry.ventas += qty;
          entry.ingresos += qty * price;
        });
      });

      if (prodMap.size === 0 && ventas.length > 0) {
        ventas.forEach(v => {
          const pid = v.producto_id || v.id_producto || v.producto?.id;
          const nombre = v.producto_nombre || v.nombre_producto || (pid ? String(pid) : 'Desconocido');
          const qty = Number(v.cantidad || 1);
          const price = Number(v.total || v.precio || 0);
          const key = String(pid || nombre);
          if (!prodMap.has(key)) prodMap.set(key, { nombre, ventas: 0, ingresos: 0 });
          const entry = prodMap.get(key);
          entry.ventas += qty;
          entry.ingresos += price;
        });
      }

      let productosPopulares = Array.from(prodMap.values()).sort((a, b) => b.ventas - a.ventas).slice(0, 5);
      if (productosPopulares.length === 0) {
        productosPopulares = productos.slice(0, 5).map((p, i) => ({
          nombre: p.nombre_producto || p.producto_nombre || p.nombre || `Producto ${i + 1}`,
          ventas: 0,
          ingresos: 0
        }));
      }

      setStats({
        totalVentas: ventas.length,
        ventasHoy: ventasHoy.length,
        totalIngresos: totalIngresos,
        ingresosHoy: ingresosHoy,
        totalProductos: totalProductos,
        productosDisponibles: productosDisponibles,
        movimientosHoy: movimientosHoyArr.length,
        movimientosTotal: movimientos.length,
        usuariosActivos: usuarios.filter(u => String(u.estado).toLowerCase() === 'activo').length,
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
    <>
      
      <div className="px-4 sm:px-8 lg:px-12 py-6 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
         
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-white/20 rounded-xl">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-xs sm:text-sm opacity-90 mb-1">Hoy</div>
                  <div className="text-lg sm:text-xl font-bold">{stats.ventasHoy}</div>
                </div>
              </div>
              <div className="text-sm sm:text-base opacity-90 mb-2">Total de Ventas</div>
              <div className="text-2xl sm:text-4xl font-bold mb-3">{stats.loading ? '...' : stats.totalVentas.toLocaleString()}</div>
              <div className="text-sm opacity-75">+{stats.ventasHoy} ventas hoy</div>
            </div>
          </div>

          
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-xs sm:text-sm text-slate-600 mb-1">Hoy</div>
                  <div className="text-lg sm:text-xl font-bold text-slate-800">S/. {stats.loading ? '...' : stats.ingresosHoy.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
                </div>
              </div>
              <div className="text-sm sm:text-base text-slate-600 mb-2">Ingresos Totales</div>
              <div className="text-2xl sm:text-4xl font-bold text-slate-800 mb-3">S/. {stats.loading ? '...' : stats.totalIngresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
              <div className="text-sm text-green-600 font-medium">↗ +{((stats.ingresosHoy / Math.max(stats.totalIngresos, 1)) * 100).toFixed(1)}% hoy</div>
            </div>
          </div>

     
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-100 to-violet-100 rounded-xl">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM6 9.5a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm.5 2.5a.5.5 0 000 1h7a.5.5 0 000-1h-7z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-xs sm:text-sm text-slate-600 mb-1">Disponibles</div>
                  <div className="text-lg sm:text-xl font-bold text-slate-800">{stats.productosDisponibles}</div>
                </div>
              </div>
              <div className="text-sm sm:text-base text-slate-600 mb-2">Total Productos</div>
              <div className="text-2xl sm:text-4xl font-bold text-slate-800 mb-3">{stats.loading ? '...' : stats.totalProductos.toLocaleString()}</div>
              <div className="text-sm text-slate-600">Stock disponible</div>
            </div>
          </div>

          
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-200/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full -translate-y-20 translate-x-20"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="text-right">
                  <div className="text-xs sm:text-sm opacity-90 mb-1">Hoy</div>
                  <div className="text-lg sm:text-xl font-bold">{stats.loading ? '...' : stats.movimientosHoy}</div>
                </div>
              </div>
              <div className="text-sm sm:text-base text-slate-600 mb-2">Movimientos Totales</div>
              <div className="text-2xl sm:text-4xl font-bold text-slate-800 mb-3">{stats.loading ? '...' : stats.movimientosTotal}</div>
              <div className="text-sm text-slate-600">Actividad del sistema</div>
            </div>
          </div>
        </div>
      </div>

   
      <div className="flex-1 px-4 sm:px-8 lg:px-12 pb-8 sm:pb-10 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 h-full">
          {/* LEFT: RECENT SALES */}
          <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl border border-slate-200/50 p-4 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="text-lg sm:text-2xl font-bold text-slate-800">Ventas Recientes</h3>
              <NavLink to="/ventas/historial" className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base flex items-center gap-2">
                Ver historial completo
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </NavLink>
            </div>

            <div className="space-y-4">
              {stats.loading ? (
                <div className="text-center py-8 text-slate-500">Cargando ventas...</div>
              ) : stats.ventasRecientes.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No hay ventas recientes</div>
              ) : (
                stats.ventasRecientes.map((venta, i) => (
                  <div key={venta.id_venta || i} className="flex items-center gap-4 p-3 sm:p-5 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-sm sm:text-base">
                        {(venta.cliente_nombre || 'Cliente').split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-800 text-sm sm:text-base truncate">
                        {venta.cliente_nombre ? `${venta.cliente_nombre} ${venta.cliente_apellido || ''}` : 'Cliente Anónimo'}
                      </div>
                      <div className="text-slate-600 text-xs sm:text-sm mt-1 truncate">
                        {venta.fecha || 'Fecha no disponible'} • {(venta.items || []).length} productos
                      </div>
                    </div>
                    <div className="text-right min-w-[90px]">
                      <div className="font-bold text-slate-800 text-sm sm:text-lg">S/. {parseFloat(venta.total || 0).toFixed(2)}</div>
                      <div className="text-xs sm:text-sm text-green-600 font-medium">Completada</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

         
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-6 sm:p-8">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">Productos mas vendidos</h3>
              <div className="space-y-3">
                {stats.productosPopulares.map((producto, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                      i === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                      i === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                      i === 2 ? 'bg-gradient-to-r from-amber-600 to-orange-600' :
                      'bg-gradient-to-r from-blue-500 to-indigo-600'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-800 text-sm sm:text-base truncate">{producto.nombre}</div>
                      <div className="text-xs sm:text-sm text-slate-600">{producto.ventas} ventas</div>
                    </div>
                    <div className="font-bold text-slate-800 text-sm sm:text-base whitespace-nowrap">
                      S/. {producto.ingresos?.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl p-6 sm:p-8 text-white">
              <h3 className="text-lg sm:text-xl font-bold mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <NavLink to="/ventas" className="block p-3 sm:p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm sm:text-base">
                  <div className="font-medium">Nueva Venta</div>
                  <div className="text-xs sm:text-sm opacity-75 mt-1">Registrar venta rápida</div>
                </NavLink>
                <NavLink to="/ventas/historial" className="block p-3 sm:p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm sm:text-base">
                  <div className="font-medium">Ver Historial</div>
                  <div className="text-xs sm:text-sm opacity-75 mt-1">Consultar ventas pasadas</div>
                </NavLink>
                <NavLink to="/inventario" className="block p-3 sm:p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm sm:text-base">
                  <div className="font-medium">Gestionar Stock</div>
                  <div className="text-xs sm:text-sm opacity-75 mt-1">Actualizar inventario</div>
                </NavLink>
                <button onClick={fetchDashboardData} className="block w-full text-left p-3 sm:p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm sm:text-base">
                  <div className="font-medium">Actualizar Datos</div>
                  <div className="text-xs sm:text-sm opacity-75 mt-1">Refrescar estadísticas</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}