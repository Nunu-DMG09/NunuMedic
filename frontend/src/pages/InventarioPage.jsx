import React, { useState, useEffect, useRef } from 'react';
import useProductos from '../hooks/useProductos';
import ProductoForm from '../components/inventario/ProductoForm';
import Modal from '../components/inventario/Modal';
import FilterPagination from '../components/inventario/FilterPagination';
import InventarioHeader from '../components/inventario/InventarioHeader';
import api from '../services/api';

export default function InventarioPage() {
  const {
    productos,
    loading,
    page,
    setPage,
    perPage,
    totalItems,
    filters,
    setFilters,
    fetch,
    createProducto,
    updateProducto,
    deleteProducto,
    syncEstadosLocal,
    notifyIfLow
  } = useProductos({ initialPage: 1, perPage: 15 });

  const [refreshKey, setRefreshKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [categoriasMap, setCategoriasMap] = useState({});
  const [editProduct, setEditProduct] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const notifiedRef = useRef(new Set());
  const updatedStateRef = useRef(new Set()); 

  const { search, categoriaFilter, estadoFilter, minStock, maxStock } = filters;

  useEffect(() => { fetchCategorias(); }, []);
  useEffect(() => { fetch(); }, [refreshKey, page, search, categoriaFilter, estadoFilter, minStock, maxStock]);

  
  useEffect(() => {
    if (!productos || productos.length === 0) return;
    let hasUpdated = false;

    async function syncEstados() {
      for (const p of productos) {
        const id = p.id_producto ?? p.id;
        if (!id) continue;
        const stockNum = Number(p.stock ?? 0);
        const minNum = Number(p.stock_minimo ?? 0);

        
        let desired = 'disponible';
        if (!isNaN(minNum) && stockNum <= minNum && stockNum > 0) desired = 'vencimiento';
        if (stockNum <= 0) desired = 'agotado';

        const current = String(p.estado ?? '').toLowerCase();
        if (current !== desired && !updatedStateRef.current.has(id)) {
          try {
         
            await api.put(`/api/productos/${id}`, { estado: desired });
            updatedStateRef.current.add(id);
            hasUpdated = true;
          } catch (err) {
            console.error('Error actualizando estado producto', id, err);
          }
        }
      }

      if (hasUpdated) {
        setRefreshKey(k => k + 1);
      }
    }

    syncEstados();
  }, [productos]);

  async function fetchCategorias() {
    try {
      const res = await api.get('/api/categorias/listar', { validateStatus: false });
      const data = res.data;
      let items = Array.isArray(data) ? data : (data?.categorias ?? data?.data ?? data?.rows ?? []);
      const map = {};
      items.forEach(c => {
        const id = c.id_categoria ?? c.id;
        const name = c.nombre_categoria ?? c.nombre ?? `#${id}`;
        if (id !== undefined) map[id] = name;
      });
      setCategoriasMap(map);
    } catch (err) {
      console.error('Error cargando categorías', err);
      setCategoriasMap({});
    }
  }

  function handleCreated() {
    setRefreshKey(k => k + 1);
    setShowModal(false);
    setSuccessMessage('Producto creado exitosamente');
    setShowSuccessModal(true);
  }

  function handleUpdated() {
    setRefreshKey(k => k + 1);
    setEditProduct(null);
    setSuccessMessage('Producto actualizado exitosamente');
    setShowSuccessModal(true);
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar producto? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete(`/api/productos/${id}`);
      setRefreshKey(k => k + 1);
      setSuccessMessage('Producto eliminado exitosamente');
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error eliminando producto', err);
      alert(err.response?.data?.error || 'Error eliminando producto');
    }
  }

  
  useEffect(() => {
    if (!productos || productos.length === 0) return;
    async function notifyLow() {
      for (const p of productos) {
        const stockNum = Number(p.stock ?? 0);
        const minNum = Number(p.stock_minimo ?? 0);
        const low = !isNaN(minNum) && stockNum <= minNum;
        if (low && p.id_producto && !notifiedRef.current.has(p.id_producto)) {
          try {
            await api.post('/api/productos/notificacion', { id_producto: p.id_producto });
            notifiedRef.current.add(p.id_producto);
          } catch (err) {
            console.error('Error notifying stock minimum for', p.id_producto, err);
          }
        }
      }
    }
    notifyLow();
  }, [productos]);

  function clearFilters() {
    setFilters({
      search: '',
      categoria: '',
      estado: '',
      minStock: '',
      maxStock: ''
    });
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const stockAlerts = productos.filter(p => {
    const stockNum = Number(p.stock ?? 0);
    const minNum = Number(p.stock_minimo ?? 0);
    return !isNaN(minNum) && stockNum <= minNum;
  }).length;

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-8">
        <InventarioHeader />

        <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-20 sm:pb-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-4 sm:p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-full -translate-y-8 translate-x-8 opacity-40 hidden sm:block"></div>
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600">Total Productos</p>
                    <p className="text-lg sm:text-2xl font-bold text-slate-800">{totalItems}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-4 sm:p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 rounded-full -translate-y-8 translate-x-8 opacity-40 hidden sm:block"></div>
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-xl">
                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600">Disponibles</p>
                    <p className="text-lg sm:text-2xl font-bold text-slate-800">{productos.filter(p => p.estado === 'disponible').length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-4 sm:p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-100 rounded-full -translate-y-8 translate-x-8 opacity-40 hidden sm:block"></div>
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-xl">
                    <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600">Stock Bajo</p>
                    <p className="text-lg sm:text-2xl font-bold text-slate-800">{stockAlerts}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-4 sm:p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-100 rounded-full -translate-y-8 translate-x-8 opacity-40 hidden sm:block"></div>
              <div className="relative">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <rect x="3" y="3" width="8" height="8" rx="1" />
                    <rect x="13" y="3" width="8" height="8" rx="1" />
                    <rect x="3" y="13" width="8" height="8" rx="1" />
                    <rect x="13" y="13" width="8" height="8" rx="1" />
                  </svg>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600">Categorías</p>
                    <p className="text-lg sm:text-2xl font-bold text-slate-800">{Object.keys(categoriasMap).length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

     
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-8 border-b border-slate-200 bg-gradient-to-r from-white to-slate-50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    Inventario de Productos
                  </h2>
                  <p className="text-slate-600 mt-1 text-sm">Gestiona tu inventario de manera eficiente</p>
                  <div className="text-xs text-slate-500 mt-1">Mostrando {productos.length} de {totalItems} productos</div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setRefreshKey(k => k + 1)}
                    className="flex-1 sm:flex-none w-full sm:w-auto px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 justify-center"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                    </svg>
                    <span className="hidden sm:inline">Actualizar</span>
                    <span className="sm:hidden">Refrescar</span>
                  </button>

                  <button
                    onClick={() => setShowModal(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2 justify-center"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                    </svg>
                    Agregar
                  </button>
                </div>
              </div>
            </div>

           
            <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50/50">
              <FilterPagination
                search={search}
                onSearchChange={val => { setFilters(f => ({ ...f, search: val })); setPage(1); }}
                categoria={categoriaFilter}
                onCategoriaChange={val => { setFilters(f => ({ ...f, categoria: val })); setPage(1); }}
                categoriasMap={categoriasMap}
                estado={estadoFilter}
                onEstadoChange={val => { setFilters(f => ({ ...f, estado: val })); setPage(1); }}
                minStock={minStock}
                onMinStockChange={val => { setFilters(f => ({ ...f, minStock: val })); setPage(1); }}
                maxStock={maxStock}
                onMaxStockChange={val => { setFilters(f => ({ ...f, maxStock: val })); setPage(1); }}
                onClear={clearFilters}
                page={page}
                totalPages={totalPages}
                onPageChange={p => setPage(p)}
              />
            </div>

        
            <div className="hidden sm:block bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Producto</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Categoría</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Precio</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Stock Mín.</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Vencimiento</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          <span className="text-slate-600">Cargando productos...</span>
                        </div>
                      </td>
                    </tr>
                  ) : productos.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="p-4 bg-slate-100 rounded-full">
                            <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5z" clipRule="evenodd"/>
                            </svg>
                          </div>
                          <div className="text-slate-600">No se encontraron productos</div>
                          <button 
                            onClick={() => setShowModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Agregar primer producto
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : productos.map(p => {
                    const stockNum = Number(p.stock ?? 0);
                    const minNum = Number(p.stock_minimo ?? 0);
                    const low = !isNaN(minNum) && stockNum <= minNum;
                    
                    return (
                      <tr key={p.id_producto} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6">
                          <span className="font-mono text-sm text-slate-600">#{p.id_producto}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <div className="font-semibold text-slate-800">{p.nombre_producto}</div>
                            {p.descripcion && <div className="text-sm text-slate-500 mt-1">{p.descripcion}</div>}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {p.id_categoria ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {p.categoria_nombre ?? categoriasMap[p.id_categoria] ?? p.id_categoria}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                              Sin categoría
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="font-semibold text-slate-800">S/. {Number(p.precio_venta || 0).toFixed(2)}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`font-bold ${low ? 'text-red-600' : 'text-slate-800'}`}>
                            {stockNum}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="text-slate-600">{minNum}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="text-slate-600 text-sm">
                            {p.fecha_vencimiento ? new Date(p.fecha_vencimiento).toLocaleDateString() : '—'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {(() => {
                            const estadoKey = String(p.estado ?? '').toLowerCase();
                            const badges = {
                              disponible: 'bg-green-100 text-green-800',
                              agotado: 'bg-red-100 text-red-800',
                              vencimiento: 'bg-yellow-100 text-yellow-800',
                              'por vencer': 'bg-yellow-100 text-yellow-800'
                            };
                            const cls = badges[estadoKey] || 'bg-gray-100 text-gray-600';
                            const label = estadoKey === 'vencimiento' ? 'Por vencer' : (p.estado || 'N/A');
                            return (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
                                {label}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => setEditProduct(p)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar producto"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDelete(p.id_producto)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar producto"
                            >
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile: cards list */}
            <div className="sm:hidden divide-y divide-slate-200 bg-white">
              {loading ? (
                <div className="p-6 text-center text-slate-500">Cargando productos...</div>
              ) : productos.length === 0 ? (
                <div className="p-6 text-center text-slate-500">No se encontraron productos</div>
              ) : productos.map(p => {
                const stockNum = Number(p.stock ?? 0);
                const minNum = Number(p.stock_minimo ?? 0);
                const low = !isNaN(minNum) && stockNum <= minNum;
                return (
                  <div key={p.id_producto} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-semibold text-slate-800 truncate">{p.nombre_producto}</div>
                          <div className="text-xs text-slate-500">#{p.id_producto}</div>
                        </div>
                        <div className="mt-2 text-sm text-slate-600">
                          {p.descripcion ?? '—'}
                        </div>
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${low ? 'bg-red-100 text-red-800' : 'bg-blue-50 text-slate-700'}`}>
                            Stock: <span className="font-semibold ml-1">{stockNum}</span>
                          </span>
                          <span className="text-xs text-slate-500">Min: {minNum}</span>
                          <span className="text-xs text-slate-500">{p.categoria_nombre ?? categoriasMap[p.id_categoria] ?? 'Sin categoría'}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="text-sm font-bold text-slate-800">S/. {Number(p.precio_venta || 0).toFixed(2)}</div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditProduct(p)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-xs">Editar</button>
                          <button onClick={() => handleDelete(p.id_producto)} className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-xs">Eliminar</button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-sm text-slate-600">Mostrando {productos.length} de {totalItems} productos • Página {page} de {totalPages}</div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page === 1}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium">{page}</span>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    disabled={page === totalPages}
                    className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile bottom quick bar */}
        <div className="fixed bottom-4 left-0 right-0 z-40 px-4 sm:hidden">
          <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 flex gap-3">
            <button onClick={() => setShowModal(true)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold">Agregar</button>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        
        {showModal && (
          <Modal title="Agregar Nuevo Producto" onClose={() => setShowModal(false)}>
            <ProductoForm onCreated={handleCreated} onClose={() => setShowModal(false)} />
          </Modal>
        )}

        {editProduct && (
          <Modal title="Editar Producto" onClose={() => setEditProduct(null)}>
            <ProductoForm product={editProduct} onUpdated={handleUpdated} onClose={() => setEditProduct(null)} />
          </Modal>
        )}

      
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative">
              <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-800 mb-2">¡Operación Exitosa!</h3>
                <p className="text-slate-600">{successMessage}</p>
              </div>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-xl transition-all duration-200"
              >
                Continuar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
