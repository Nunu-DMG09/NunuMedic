import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function fmtFecha(input) {
  if (!input) return null;
  const s = String(input).trim();
  // si ya viene YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // DD-MM-YYYY o DD/MM/YYYY -> YYYY-MM-DD
  const m1 = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  const m2 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m1) return `${m1[3]}-${m1[2]}-${m1[1]}`;
  if (m2) return `${m2[3]}-${m2[2]}-${m2[1]}`;
  return input;
}

export default function ProductoForm({ product, onCreated,onUpdated, onClose }) {
  const [form, setForm] = useState({
    nombre_producto: '',
    descripcion: '',
    id_categoria: '',
    precio_compra: '',
    precio_venta: '',
    stock: '',
    stock_minimo: '',
    fecha_vencimiento: '',
    estado: '', // <-- nuevo campo estado
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [catLoading, setCatLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadCats() {
      setCatLoading(true);
      try {
        const res = await api.get('/api/categorias/listar', { validateStatus: false });
        // soporta varias formas
        const data = res.data;
        let items = [];
        if (Array.isArray(data)) items = data;
        else if (data && Array.isArray(data.categorias)) items = data.categorias;
        else if (data && Array.isArray(data.data)) items = data.data;
        else if (data && Array.isArray(data.rows)) items = data.rows;
        if (mounted) setCategorias(items);
      } catch (err) {
        console.error('Error cargando categorías', err);
        if (mounted) setCategorias([]);
      } finally {
        if (mounted) setCatLoading(false);
      }
    }
    loadCats();
    return () => { mounted = false; };
  }, []);


  useEffect(() => {
    if (product) {
      setForm({
        nombre_producto: product.nombre_producto ?? '',
        descripcion: product.descripcion ?? '',
        id_categoria: product.id_categoria ?? product.categoria?.id_categoria ?? '',
        precio_compra: product.precio_compra ?? '',
        precio_venta: product.precio_venta ?? '',
        stock: product.stock ?? '',
        stock_minimo: product.stock_minimo ?? '',
        fecha_vencimiento: product.fecha_vencimiento ? fmtFecha(product.fecha_vencimiento) : '',
        estado: product.estado ?? '', // cargar estado si existe
      });
      setError(null);
    } else {
      // reset for create
      setForm({
        nombre_producto: '',
        descripcion: '',
        id_categoria: '',
        precio_compra: '',
        precio_venta: '',
        stock: '',
        stock_minimo: '',
        fecha_vencimiento: '',
        estado: '',
      });
      setError(null);
    }
  }, [product]);

  function update(k, v) { setForm(prev => ({ ...prev, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = {
        ...form,
        nombre_producto: String(form.nombre_producto).trim(),
        descripcion: form.descripcion || null,
        id_categoria: form.id_categoria ? Number(form.id_categoria) : null,
        precio_compra: form.precio_compra ? Number(form.precio_compra) : null,
        precio_venta: form.precio_venta ? Number(form.precio_venta) : null,
        stock: form.stock ? Number(form.stock) : 0,
        stock_minimo: form.stock_minimo ? Number(form.stock_minimo) : 5,
        fecha_vencimiento: fmtFecha(form.fecha_vencimiento),
        estado: form.estado || null, // enviar estado
      };


      if (product && product.id_producto) {
        // editar
        await api.put(`/api/productos/${product.id_producto}`, payload);
        onUpdated?.();
      } else {
        // crear
        const res = await api.post('/api/productos/create', payload);
        onCreated?.(res.data);
      }

      onClose?.();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error guardando producto');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '100%' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div>
          <label className="small-muted">Nombre</label>
          <input value={form.nombre_producto} onChange={e => update('nombre_producto', e.target.value)} className="input" required />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2">Categoría</label>
          <select
            value={form.id_categoria}
            onChange={e => update('id_categoria', e.target.value)}
            className="w-full rounded-md bg-slate-800 text-slate-100 border border-slate-700 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="" className="bg-slate-800 text-slate-100">-- Seleccionar --</option>
            {catLoading
              ? <option disabled className="bg-slate-800 text-slate-100">...cargando</option>
              : categorias.map(c => (
                  <option
                    key={c.id_categoria ?? c.id}
                    value={c.id_categoria ?? c.id}
                    className="bg-slate-800 text-slate-100"
                  >
                    {c.nombre_categoria ?? c.nombre ?? c.title ?? `#${c.id_categoria ?? c.id}`}
                  </option>
                ))
            }
          </select>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <label className="small-muted">Descripción</label>
          <input value={form.descripcion} onChange={e => update('descripcion', e.target.value)} className="input" />
        </div>

        <div>
          <label className="small-muted">Precio compra</label>
          <input value={form.precio_compra} onChange={e => update('precio_compra', e.target.value)} className="input" type="number" step="0.01" />
        </div>

        <div>
          <label className="small-muted">Precio venta</label>
          <input value={form.precio_venta} onChange={e => update('precio_venta', e.target.value)} className="input" type="number" step="0.01" required />
        </div>

        <div>
          <label className="small-muted">Stock</label>
          <input value={form.stock} onChange={e => update('stock', e.target.value)} className="input" type="number" />
        </div>

        <div>
          <label className="small-muted">Stock mínimo</label>
          <input value={form.stock_minimo} onChange={e => update('stock_minimo', e.target.value)} className="input" type="number" />
        </div>

        <div>
          <label className="small-muted">Estado</label>
          <select value={form.estado} onChange={e => update('estado', e.target.value)} className="input">
            <option value="" className="bg-slate-800 text-slate-100">— Seleccionar —</option>
            <option value="disponible" className="bg-slate-800 text-slate-100">Disponible</option>
            <option value="agotado" className="bg-slate-800 text-slate-100">Agotado</option>
            <option value="vencimiento" className="bg-slate-800 text-slate-100">Vencido</option>
          </select>
        </div>

        <div>
          <label className="small-muted">Fecha vencimiento</label>
          <input
            type="date"
            value={form.fecha_vencimiento}
            onChange={e => update('fecha_vencimiento', e.target.value)}
            className="input"
            placeholder="YYYY-MM-DD"
          />
        </div>
      </div>

      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {loading ? 'Guardando…' : (product ? 'Actualizar' : 'Crear')}
        </button>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md border border-slate-700 text-slate-200 px-4 py-2 text-sm hover:bg-slate-800"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}