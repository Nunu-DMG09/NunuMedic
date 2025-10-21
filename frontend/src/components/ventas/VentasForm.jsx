import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function VentasForm({ cliente = null }) {
  const [productos, setProductos] = useState([]);
  const [clients, setClients] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [id_cliente, setIdCliente] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => { fetchProductos(); fetchClientes(); }, []);

  // Si se pasa un cliente desde la página externa (ClienteForm), usarlo
  useEffect(() => {
    if (cliente) {
      // soporta distintas claves (id_cliente o id)
      const id = cliente.id_cliente ?? cliente.id ?? '';
      setIdCliente(id ? String(id) : '');
      setClienteNombre(`${cliente.nombre ?? ''}${cliente.apellido ? ' ' + cliente.apellido : ''}`);
      // agregar a lista de clientes locales si no existe (para el select)
      setClients(prev => {
        const exists = prev.some(c => String(c.id_cliente ?? c.id ?? '') === String(id));
        if (exists) return prev;
        return [{ id_cliente: id, nombre: cliente.nombre, apellido: cliente.apellido, dni: cliente.dni ?? '' }, ...prev];
      });
    }
  }, [cliente]);

  async function fetchProductos() {
    setLoadingProducts(true);
    try {
      const res = await api.get('/api/productos/listar', { validateStatus: false });
      let items = [];
      if (Array.isArray(res.data)) items = res.data;
      else if (res.data && Array.isArray(res.data.productos)) items = res.data.productos;
      else if (res.data && Array.isArray(res.data.data)) items = res.data.data;
      else if (res.data && Array.isArray(res.data.rows)) items = res.data.rows;
      else {
        const arr = res.data && Object.values(res.data).find(v => Array.isArray(v));
        if (arr) items = arr;
      }
      setProductos(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('fetchProductos', err);
      setProductos([]);
    } finally {
      setLoadingProducts(false);
    }
  }

  async function fetchClientes() {
    try {
      const res = await api.get('/api/clientes', { validateStatus: false });
      const data = res.data;
      let items = Array.isArray(data) ? data : (data?.clientes ?? data?.data ?? data?.rows) ?? [];
      setClients(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('fetchClientes', err);
      setClients([]);
    }
  }

  function addProductToCart(product) {
    const existing = cart.find(i => i.id_producto === product.id_producto);
    if (existing) {
      setCart(cart.map(i => i.id_producto === product.id_producto ? { ...i, cantidad: i.cantidad + 1 } : i));
    } else {
      setCart([...cart, { id_producto: product.id_producto, nombre_producto: product.nombre_producto, cantidad: 1, precio_unitario: Number(product.precio_venta || 0) }]);
    }
  }

  function updateQty(id_producto, cantidad) {
    setCart(cart.map(i => i.id_producto === id_producto ? { ...i, cantidad: Math.max(1, Number(cantidad) || 1) } : i));
  }

  function removeItem(id_producto) {
    setCart(cart.filter(i => i.id_producto !== id_producto));
  }

  const filtered = productos.filter(p => !search || String(p.nombre_producto ?? '').toLowerCase().includes(search.toLowerCase())).slice(0, 50);

  const total = cart.reduce((s, it) => s + (Number(it.precio_unitario || 0) * Number(it.cantidad || 0)), 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cart.length) return setMessage({ type: 'error', text: 'Agrega al menos 1 producto' });
    setSubmitting(true);
    setMessage(null);
    try {
      const payload = {
        total,
        items: cart.map(i => ({ id_producto: i.id_producto, cantidad: Number(i.cantidad), precio_unitario: Number(i.precio_unitario) })),
        id_cliente: id_cliente ? Number(id_cliente) : null,
        metodo_pago: metodoPago
      };
      const res = await api.post('/api/ventas/create', payload);
      setMessage({ type: 'success', text: 'Venta registrada. ID: ' + (res.data?.id_venta ?? '') });
      setCart([]);
      setClienteNombre('');
      setIdCliente('');
      setMetodoPago('efectivo');
    } catch (err) {
      console.error('create venta', err);
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al crear venta' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 12 }}>
        <div>
          <div style={{ marginBottom: 8 }}>
            <label className="small-muted">Buscar producto</label>
            <input className="input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Nombre del producto..." />
          </div>

          <div style={{ maxHeight: 300, overflow: 'auto', borderRadius: 8, padding: 8, border: '1px solid rgba(100,100,100,0.08)' }}>
            {loadingProducts ? <div className="small-muted">Cargando productos...</div> : (
              filtered.map(p => (
                <div key={p.id_producto} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.nombre_producto}</div>
                    <div className="small-muted" style={{ fontSize: 12 }}>{p.descripcion ?? ''}</div>
                    <div className="small-muted" style={{ fontSize: 12 }}>Precio: {Number(p.precio_venta || 0).toFixed(2)} — Stock: {p.stock}</div>
                  </div>
                  <div>
                    <button type="button" className="btn btn-outline" onClick={() => addProductToCart(p)}>Agregar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <div style={{ flex: 1 }}>
              <label className="small-muted">Cliente (opcional)</label>
              <select className="input" value={id_cliente} onChange={e => { setIdCliente(e.target.value); const sel = clients.find(c => String(c.id_cliente) === e.target.value); if (sel) setClienteNombre(sel.nombre + (sel.apellido ? ' ' + sel.apellido : '')); }}>
                <option value="">-- Seleccionar cliente --</option>
                {clients.map(c => <option key={c.id_cliente} value={c.id_cliente}>{c.nombre} {c.apellido ?? ''}</option>)}
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label className="small-muted">Método pago</label>
              <select className="input" value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="yape">Yape</option>
                <option value="plin">Plin</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 8 }}>
            <label className="small-muted">Nombre cliente (si no está en la lista)</label>
            <input className="input" value={clienteNombre} onChange={e => setClienteNombre(e.target.value)} placeholder="Nombre cliente (opcional)" />
          </div>

          <div style={{ border: '1px solid rgba(255,255,255,0.03)', borderRadius: 8, padding: 8, marginBottom: 8 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Resumen de items</div>
            {cart.length === 0 ? <div className="small-muted">No hay productos en la venta</div> : cart.map(it => (
              <div key={it.id_producto} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{it.nombre_producto}</div>
                  <div className="small-muted">P. unitario: {Number(it.precio_unitario).toFixed(2)}</div>
                </div>

                <div style={{ width: 120 }}>
                  <input type="number" min="1" className="input" value={it.cantidad} onChange={e => updateQty(it.id_producto, e.target.value)} />
                </div>

                <div style={{ width: 80, textAlign: 'right' }}>{(Number(it.precio_unitario) * Number(it.cantidad)).toFixed(2)}</div>

                <div>
                  <button type="button" className="btn btn-outline" onClick={() => removeItem(it.id_producto)}>Quitar</button>
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontWeight: 700 }}>
              <div>Total</div>
              <div>{total.toFixed(2)}</div>
            </div>
          </div>

          {message && (
            <div style={{ marginBottom: 8, color: message.type === 'error' ? '#f87171' : '#86efac' }}>{message.text}</div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={submitting} className="btn btn-primary">{submitting ? 'Procesando…' : 'Generar venta'}</button>
            <button type="button" className="btn btn-outline" onClick={() => { setCart([]); setMessage(null); setClienteNombre(''); setIdCliente(''); }}>Cancelar</button>
          </div>
        </div>
      </div>
    </form>
  );
}