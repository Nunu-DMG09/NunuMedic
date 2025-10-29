import React, { useState, useEffect, useRef } from 'react';
import ProductoForm from '../components/inventario/ProductoForm';
import Modal from '../components/inventario/Modal';
import FilterPagination from '../components/inventario/FilterPagination';
import InventarioHeader from '../components/inventario/InventarioHeader';
import api from '../services/api';

export default function InventarioPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [categoriasMap, setCategoriasMap] = useState({});
  const [editProduct, setEditProduct] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const notifiedRef = useRef(new Set());

  // filtros / paginación server-side
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [minStock, setMinStock] = useState('');
  const [maxStock, setMaxStock] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 15;
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => { fetchCategorias(); }, []);
  useEffect(() => { fetchProductos(); }, [refreshKey, page, search, categoriaFilter, estadoFilter, minStock, maxStock]);

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

  async function fetchProductos() {
    setLoading(true);
    try {
      const res = await api.get('/api/productos/paginar', {
        params: {
          page,
          perPage,
          search: search || undefined,
          categoria: categoriaFilter || undefined,
          estado: estadoFilter || undefined,
          minStock: minStock !== '' ? minStock : undefined,
          maxStock: maxStock !== '' ? maxStock : undefined
        }
      });
      const payload = res.data ?? {};
      const items = Array.isArray(payload.items) ? payload.items : (Array.isArray(payload.data) ? payload.data : []);
      const total = Number(payload.total ?? payload.totalItems ?? 0);
      setProductos(items);
      setTotalItems(total);
    } catch (err) {
      console.error('Error fetching productos', err);
      setProductos([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
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

  // notify backend once per product on current page when stock <= stock_minimo
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
    setSearch('');
    setCategoriaFilter('');
    setEstadoFilter('');
    setMinStock('');
    setMaxStock('');
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <InventarioHeader />
        
        <div className="max-w-7xl mx-auto px-8 pb-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
              <div className="relative">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-xl">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total Productos</p>
                    <p className="text-2xl font-bold text-slate-800">{totalItems}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
              <div className="relative">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-xl">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Disponibles</p>
                    <p className="text-2xl font-bold text-slate-800">{productos.filter(p => p.estado === 'disponible').length}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-100 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
              <div className="relative">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-xl">
                    <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Stock Bajo</p>
                    <p className="text-2xl font-bold text-slate-800">{stockAlerts}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
              <div className="relative">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-xl">
                    <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Categorías</p>
                    <p className="text-2xl font-bold text-slate-800">{Object.keys(categoriasMap).length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-slate-200 bg-gradient-to-r from-white to-slate-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    Inventario de Productos
                  </h2>
                  <p className="text-slate-600 mt-2">Gestiona tu inventario de manera eficiente</p>
                  <div className="text-sm text-slate-500 mt-1">
                    Mostrando {productos.length} de {totalItems} productos
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setRefreshKey(k => k + 1)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                    </svg>
                    Actualizar
                  </button>

                  <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                    </svg>
                    Agregar Producto
                  </button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-slate-200 bg-slate-50/50">
              <FilterPagination
                search={search}
                onSearchChange={val => { setSearch(val); setPage(1); }}
                categoria={categoriaFilter}
                onCategoriaChange={val => { setCategoriaFilter(val); setPage(1); }}
                categoriasMap={categoriasMap}
                estado={estadoFilter}
                onEstadoChange={val => { setEstadoFilter(val); setPage(1); }}
                minStock={minStock}
                onMinStockChange={val => { setMinStock(val); setPage(1); }}
                maxStock={maxStock}
                onMaxStockChange={val => { setMaxStock(val); setPage(1); }}
                onClear={clearFilters}
                page={page}
                totalPages={totalPages}
                onPageChange={p => setPage(p)}
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">ID</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Producto</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Categoría</th>
                    <th className="text-right py-4 px-6 font-semibold text-slate-700 text-sm">Precio</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700 text-sm">Stock</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700 text-sm">Stock Mín.</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700 text-sm">Vencimiento</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700 text-sm">Estado</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700 text-sm">Acciones</th>
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
                            {low && (
                              <span className="ml-1">
                                <svg className="w-4 h-4 inline text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" clipRule="evenodd"/>
                                </svg>
                              </span>
                            )}
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
                            };
                            const cls = badges[estadoKey] || 'bg-gray-100 text-gray-600';
                            return (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
                                {p.estado || 'N/A'}
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
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" clipRule="evenodd"/>
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

            {/* Footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Mostrando {productos.length} de {totalItems} productos • Página {page} de {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <span className="px-4 py-2 bg-white border border-slate-200 rounded-lg font-medium">
                  {page}
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MODALS */}
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

        {/* SUCCESS MODAL */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">¡Operación Exitosa!</h3>
                <p className="text-slate-600">{successMessage}</p>
              </div>
              <button 
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
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