
import React, { useState, useEffect, useRef } from 'react';
import ProductoForm from '../components/inventario/ProductoForm';
import Modal from '../components/inventario/Modal';
import FilterPagination from '../components/inventario/FilterPagination';
import InventarioHeader from '../components/inventario/InventarioHeader';
import api from '../services/api';

export default function InventarioPage() {
  const [productos, setProductos] = useState([]); // página actual
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [categoriasMap, setCategoriasMap] = useState({});
  const [editProduct, setEditProduct] = useState(null);
  const notifiedRef = useRef(new Set());

  // filtros / paginación server-side
  const [search, setSearch] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState('');
  const [estadoFilter, setEstadoFilter] = useState('');
  const [minStock, setMinStock] = useState('');
  const [maxStock, setMaxStock] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => { fetchCategorias(); }, []);

  useEffect(() => { fetchProductos(); /* eslint-disable-next-line */ }, [refreshKey, page, search, categoriaFilter, estadoFilter, minStock, maxStock]);

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
  }

  function handleUpdated() {
    setRefreshKey(k => k + 1);
    setEditProduct(null);
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar producto? Esta acción no se puede deshacer.')) return;
    try {
      await api.delete(`/api/productos/${id}`);
      setRefreshKey(k => k + 1);
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

  return (
    <div className="container mx-auto p-6">
      <InventarioHeader backTo="/" />
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Lista de productos</h3>
            <div className="text-sm text-gray-500">Mostrando {productos.length} — Total: {totalItems}</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setRefreshKey(k => k + 1)}
              className="px-3 py-2 border border-blue-200 text-blue-700 rounded-md hover:bg-blue-50"
            >
              Actualizar
            </button>

            <button
              onClick={() => setShowModal(true)}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow"
            >
              Crear nuevo
            </button>
          </div>
        </div>

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

        {showModal && (
          <Modal title="Crear nuevo producto" onClose={() => setShowModal(false)}>
            <ProductoForm onCreated={handleCreated} onClose={() => setShowModal(false)} />
          </Modal>
        )}

        {editProduct && (
          <Modal title="Editar producto" onClose={() => setEditProduct(null)}>
            <ProductoForm product={editProduct} onUpdated={handleUpdated} onClose={() => setEditProduct(null)} />
          </Modal>
        )}

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">#</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Nombre</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Categoria</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Precio</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Stock</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Stock mínimo</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Vencimiento</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Estado</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={9} className="p-6 text-center text-gray-500">Cargando...</td></tr>
              ) : productos.length === 0 ? (
                <tr><td colSpan={9} className="p-6 text-center text-gray-500">No hay productos</td></tr>
              ) : productos.map(p => {
                const stockNum = Number(p.stock ?? 0);
                const minNum = Number(p.stock_minimo ?? 0);
                const low = !isNaN(minNum) && stockNum <= minNum;
                return (
                  <tr key={p.id_producto}>
                    <td className="px-4 py-3 text-sm text-gray-700">{p.id_producto}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{p.nombre_producto}</div>
                      {p.descripcion && <div className="text-sm text-gray-500">{p.descripcion}</div>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {p.id_categoria ? (p.categoria_nombre ?? categoriasMap[p.id_categoria] ?? p.id_categoria) : <span className="text-gray-400">Sin categoría</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{Number(p.precio_venta || 0).toFixed(2)}</td>
                    <td className={`px-4 py-3 text-right ${low ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>{stockNum}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{minNum}</td>
                    <td className="px-4 py-3 text-gray-700">{p.fecha_vencimiento ? new Date(p.fecha_vencimiento).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      {(() => {
                        const estadoKey = String(p.estado ?? '').toLowerCase();
                        const badgeMap = {
                          disponible: 'inline-block px-2 py-1 text-sm rounded bg-green-100 text-green-800',
                          agotado: 'inline-block px-2 py-1 text-sm rounded bg-red-100 text-red-800',
                          vencimiento: 'inline-block px-2 py-1 text-sm rounded bg-yellow-100 text-yellow-800',
                        };
                        const cls = badgeMap[estadoKey] || 'inline-block px-2 py-1 text-sm rounded bg-gray-100 text-gray-700';
                        return <span className={cls}>{p.estado}</span>;
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => setEditProduct(p)} className="px-2 py-1 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50">Editar</button>
                        <button onClick={() => handleDelete(p.id_producto)} className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer paginación simple */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">Página {page} / {totalPages} — Total {totalItems}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 border border-gray-200 rounded-md text-gray-700">Anterior</button>
            <div className="flex gap-1">{/* small page preview */}</div>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-2 border border-gray-200 rounded-md text-gray-700">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}
