import React, { useState, useEffect, useRef } from 'react';
import ProductoForm from '../components/inventario/ProductoForm';
import Modal from '../components/inventario/Modal';
import api from '../services/api';

export default function InventarioPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [categoriasMap, setCategoriasMap] = useState({});
  const [editProduct, setEditProduct] = useState(null);
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    fetchCategorias();
    fetchProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // notify backend once per product when stock <= stock_minimo
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

  async function fetchCategorias() {
    try {
      const res = await api.get('/api/categorias/listar', { validateStatus: false });
      const data = res.data;
      let items = [];
      if (Array.isArray(data)) items = data;
      else if (data && Array.isArray(data.categorias)) items = data.categorias;
      else if (data && Array.isArray(data.data)) items = data.data;
      else if (data && Array.isArray(data.rows)) items = data.rows;
      else {
        const firstArray = data && Object.values(data).find(v => Array.isArray(v));
        if (firstArray) items = firstArray;
      }

      const map = {};
      items.forEach(c => {
        const id = c.id_categoria ?? c.id;
        const name = c.nombre_categoria ?? c.nombre ?? c.title ?? `#${id}`;
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
      const res = await api.get('/api/productos/listar', { validateStatus: false });
      // normalizar respuesta
      let items = [];
      if (Array.isArray(res.data)) items = res.data;
      else if (res.data && Array.isArray(res.data.productos)) items = res.data.productos;
      else if (res.data && Array.isArray(res.data.data)) items = res.data.data;
      else if (res.data && Array.isArray(res.data.rows)) items = res.data.rows;
      else {
        const firstArray = res.data && Object.values(res.data).find(v => Array.isArray(v));
        if (firstArray) items = firstArray;
      }
      setProductos(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Error fetching productos', err);
      setProductos([]);
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
    const ok = window.confirm('¿Eliminar producto? Esta acción no se puede deshacer.');
    if (!ok) return;
    try {
      await api.delete(`/api/productos/${id}`);
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error('Error eliminando producto', err);
      alert(err.response?.data?.error || 'Error eliminando producto');
    }
  }

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h3 style={{ margin: 0 }}>Lista de productos</h3>
            <div className="small-muted" style={{ marginTop: 4 }}>Total: {productos.length}</div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline" onClick={() => setRefreshKey(k => k + 1)}>Actualizar</button>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>Crear nuevo</button>
          </div>
        </div>

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

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th style={{ width: 60 }}>#</th>
                <th>Nombre</th>
                <th>Categoria</th>
                <th style={{ width: 120 }}>Precio</th>
                <th style={{ width: 90 }}>Stock</th>
                <th style={{ width: 110 }}>Stock mínimo</th>
                <th style={{ width: 140 }}>Vencimiento</th>
                <th style={{ width: 120 }}>Estado</th>
                <th style={{ width: 130 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: 20, textAlign: 'center' }}>Cargando...</td>
                </tr>
              ) : productos.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: 20, textAlign: 'center' }}>No hay productos</td>
                </tr>
              ) : productos.map(p => {
                const stockNum = Number(p.stock ?? 0);
                const minNum = Number(p.stock_minimo ?? 0);
                const low = !isNaN(minNum) && stockNum <= minNum;
                return (
                  <tr key={p.id_producto}>
                    <td>{p.id_producto}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{p.nombre_producto}</div>
                          {p.descripcion && <div className="small-muted" style={{ marginTop: 4 }}>{p.descripcion}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      {p.id_categoria ? (
                        p.categoria?.nombre
                        ?? p.categoria_nombre
                        ?? categoriasMap[p.id_categoria]
                        ?? categoriasMap[String(p.id_categoria)]
                        ?? p.id_categoria
                      ) : (
                        <span className="small-muted">Sin categoría</span>
                      )}
                    </td>

                    <td>{Number(p.precio_venta || 0).toFixed(2)}</td>

                    <td
                      style={{
                        padding: '6px 8px',
                        borderRadius: 6,
                        color: low ? 'rgb(239,68,68)' : undefined,
                        fontWeight: low ? 700 : undefined
                      }}
                      title={low ? 'Stock en o por debajo del mínimo' : undefined}
                    >
                      {stockNum}
                    </td>

                    <td style={{ padding: '6px 8px' }}>{minNum}</td>

                    <td>{p.fecha_vencimiento ? new Date(p.fecha_vencimiento).toLocaleDateString() : <span className="small-muted">—</span>}</td>

                    <td>
                      <span className="badge" style={{ background: p.estado === 'agotado' ? '#ffe6e6' : p.estado === 'vencimiento' ? '#fff4e5' : undefined }}>
                        {p.estado}
                      </span>
                    </td>

                    <td>
                      <button className="btn btn-outline" style={{ marginRight: 8 }} onClick={() => setEditProduct(p)}>Editar</button>
                      <button className="btn btn-danger" onClick={() => handleDelete(p.id_producto)}>Eliminar</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}