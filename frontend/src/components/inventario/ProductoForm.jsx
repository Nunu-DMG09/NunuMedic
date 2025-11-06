
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function fmtFecha(input) {
  if (!input) return '';
  if (typeof input === 'string') {
    const s = input.trim();
    if (s.includes('T')) return s.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    const m1 = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    const m2 = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m1) return `${m1[3]}-${m1[2]}-${m1[1]}`;
    if (m2) return `${m2[3]}-${m2[2]}-${m2[1]}`;
  }
  try {
    const d = new Date(input);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  } catch (e) { /* ignore */ }
  return String(input);
}

export default function ProductoForm({ product, onCreated, onUpdated, onClose }) {
  const [form, setForm] = useState({
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
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadCats() {
      setCatLoading(true);
      try {
        const res = await api.get('/api/categorias/listar', { validateStatus: false });
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
        estado: product.estado ?? '',
      });
      setError(null);
      setSuccess(null);
    } else {
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
      setSuccess(null);
    }
  }, [product]);

  function update(k, v) { 
    setForm(prev => ({ ...prev, [k]: v })); 
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
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
        estado: form.estado || null,
      };

      if (product && product.id_producto) {
        await api.put(`/api/productos/${product.id_producto}`, payload);
        setSuccess('Producto actualizado correctamente');
        setTimeout(() => {
          onUpdated?.();
          onClose?.();
        }, 900);
      } else {
        const res = await api.post('/api/productos/create', payload);
        setSuccess('Producto creado correctamente');
        setTimeout(() => {
          onCreated?.(res.data);
          onClose?.();
        }, 900);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Error guardando producto');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">1</span>
            </div>
            <span className="text-sm font-semibold text-slate-700">Información Básica</span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-200"></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-slate-500 font-bold text-sm">2</span>
            </div>
            <span className="text-sm font-medium text-slate-500">Precios y Stock</span>
          </div>
          <div className="flex-1 h-0.5 bg-slate-200 hidden md:block"></div>
          <div className="flex items-center gap-2 hidden md:flex">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
              <span className="text-slate-500 font-bold text-sm">3</span>
            </div>
            <span className="text-sm font-medium text-slate-500">Configuración</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
       
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-6 relative overflow-hidden">
          <div className="relative">
            <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd"/>
                </svg>
              </div>
              Información Básica
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre del Producto *</label>
                <input 
                  type="text"
                  value={form.nombre_producto} 
                  onChange={e => update('nombre_producto', e.target.value)} 
                  placeholder="Paracetamol 500mg"
                  className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Categoría *</label>
                <select
                  value={form.id_categoria}
                  onChange={e => update('id_categoria', e.target.value)}
                  className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none transition appearance-none cursor-pointer"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {catLoading ? (
                    <option disabled>Cargando categorías...</option>
                  ) : (
                    categorias.map(c => (
                      <option key={c.id_categoria ?? c.id} value={c.id_categoria ?? c.id}>
                        {c.nombre_categoria ?? c.nombre ?? c.title ?? `#${c.id_categoria ?? c.id}`}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
                <textarea 
                  value={form.descripcion} 
                  onChange={e => update('descripcion', e.target.value)} 
                  placeholder="Descripción detallada del producto..."
                  rows={3}
                  className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none transition resize-none"
                />
              </div>
            </div>
          </div>
        </div>

       
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-6 relative overflow-hidden">
          <div className="relative">
            <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                </svg>
              </div>
              Precios y Stock
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Precio de Compra</label>
                <input 
                  type="number" step="0.01"
                  value={form.precio_compra} 
                  onChange={e => update('precio_compra', e.target.value)} 
                  placeholder="0.00"
                  className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Precio de Venta *</label>
                <input 
                  type="number" step="0.01"
                  value={form.precio_venta} 
                  onChange={e => update('precio_venta', e.target.value)} 
                  placeholder="0.00"
                  className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none transition"
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Stock Inicial</label>
                <input 
                  type="number"
                  value={form.stock} 
                  onChange={e => update('stock', e.target.value)} 
                  placeholder="0"
                  className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Stock Mínimo</label>
                <input 
                  type="number"
                  value={form.stock_minimo} 
                  onChange={e => update('stock_minimo', e.target.value)} 
                  placeholder="5"
                  className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none transition"
                />
              </div>
            </div>
          </div>
        </div>

        
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-4 sm:p-6 relative overflow-hidden">
          <div className="relative">
            <h4 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
                </svg>
              </div>
              Configuración Avanzada
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Estado del Producto</label>
                <select 
                  value={form.estado} 
                  onChange={e => update('estado', e.target.value)} 
                  className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none transition appearance-none cursor-pointer"
                >
                  <option value="">Seleccionar estado</option>
                  <option value="disponible">Disponible</option>
                  <option value="agotado">Agotado</option>
                  <option value="vencimiento">Por vencer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Fecha de Vencimiento</label>
                <input
                  type="date"
                  value={form.fecha_vencimiento}
                  onChange={e => update('fecha_vencimiento', e.target.value)}
                  className="w-full px-3 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none transition"
                />
              </div>
            </div>
          </div>
        </div>

       
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <div className="font-semibold text-red-800">Error al guardar</div>
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-3 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>
            <div>
              <div className="font-semibold text-green-800">¡Éxito!</div>
              <div className="text-green-700 text-sm">{success}</div>
            </div>
          </div>
        )}

     
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition hover:scale-105"
            >
              Cancelar
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl font-bold shadow-lg disabled:shadow-none transition hover:scale-105 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                {product ? 'Actualizar Producto' : 'Crear Producto'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
