import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function VentasForm({ cliente = null }) {
  const [productos, setProductos] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [id_cliente, setIdCliente] = useState('');
  const [clienteNombre, setClienteNombre] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [ventaCreada, setVentaCreada] = useState(null);

  useEffect(() => { fetchProductos(); }, []);

  useEffect(() => {
    if (cliente) {
      const id = cliente.id_cliente ?? cliente.id ?? '';
      setIdCliente(id ? String(id) : '');
      setClienteNombre(`${cliente.nombre ?? ''}${cliente.apellido ? ' ' + cliente.apellido : ''}`);
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

  function showTempMessage(msg, type = 'error', ms = 4500) {
    setMessage({ type, text: msg });
    setTimeout(() => setMessage(null), ms);
  }

  function addProductToCart(product) {
    const stockNum = Number(product.stock ?? 0);
    if (stockNum <= 0) {
      showTempMessage(`No se puede agregar "${product.nombre_producto}" — producto agotado`, 'error');
      return;
    }

    const existing = cart.find(i => i.id_producto === product.id_producto);
    if (existing) {
      const newQty = existing.cantidad + 1;
      if (newQty > stockNum) {
        showTempMessage(`No hay suficiente stock de "${product.nombre_producto}" (máx ${stockNum})`, 'error');
        return;
      }
      setCart(cart.map(i => i.id_producto === product.id_producto ? { ...i, cantidad: newQty } : i));
    } else {
      setCart([...cart, {
        id_producto: product.id_producto,
        nombre_producto: product.nombre_producto,
        cantidad: 1,
        precio_unitario: Number(product.precio_venta || 0)
      }]);
    }
  }

  function updateQty(id_producto, cantidad) {
    const target = productos.find(p => String(p.id_producto ?? p.id) === String(id_producto));
    const stockNum = Number(target?.stock ?? 0);
    const q = Math.max(1, Number(cantidad) || 1);
    if (stockNum > 0 && q > stockNum) {
      showTempMessage(`Cantidad superior al stock disponible (${stockNum})`, 'error');
      return;
    }
    setCart(cart.map(i => i.id_producto === id_producto ? { ...i, cantidad: q } : i));
  }

  function removeItem(id_producto) {
    setCart(cart.filter(i => i.id_producto !== id_producto));
  }

  const filtered = productos.filter(p => !search || String(p.nombre_producto ?? '').toLowerCase().includes(search.toLowerCase())).slice(0, 30);
  const total = cart.reduce((s, it) => s + (Number(it.precio_unitario || 0) * Number(it.cantidad || 0)), 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cart.length) return setMessage({ type: 'error', text: 'Agrega al menos 1 producto' });

    for (const it of cart) {
      const prod = productos.find(p => String(p.id_producto ?? p.id) === String(it.id_producto));
      const stockNum = Number(prod?.stock ?? 0);
      if (!prod) {
        return setMessage({ type: 'error', text: `Producto no encontrado en catálogo (ID ${it.id_producto})` });
      }
      if (stockNum <= 0) {
        return setMessage({ type: 'error', text: `No se puede vender "${it.nombre_producto}" — producto agotado` });
      }
      if (Number(it.cantidad) > stockNum) {
        return setMessage({ type: 'error', text: `No hay suficiente stock de "${it.nombre_producto}" (disponible: ${stockNum})` });
      }
    }

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

      setVentaCreada({
        id: res.data?.id_venta ?? 'N/A',
        total: total,
        cliente: clienteNombre || 'Cliente Anónimo',
        items: cart.length
      });
      setShowSuccessModal(true);

      setCart([]);
      setMetodoPago('efectivo');
      setMessage(null);

      fetchProductos();
    } catch (err) {
      console.error('create venta', err);
      setMessage({ type: 'error', text: err.response?.data?.error || 'Error al crear venta' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-4 sm:p-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: PRODUCTOS */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-3">Catálogo de Productos</h3>

                {/* Search */}
                <div className="relative mb-4">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar producto por nombre..."
                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                {/* Products List */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 max-h-72 sm:max-h-96 overflow-y-auto">
                  {loadingProducts ? (
                    <div className="p-6 text-center text-slate-500">Cargando productos...</div>
                  ) : filtered.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">No se encontraron productos</div>
                  ) : (
                    filtered.map(p => {
                      const outOfStock = Number(p.stock ?? 0) <= 0;
                      return (
                        <div key={p.id_producto} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 border-b border-slate-200 last:border-b-0 hover:bg-white transition-colors gap-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-800 truncate">{p.nombre_producto}</h4>
                            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-600">
                              <span>S/. {Number(p.precio_venta || 0).toFixed(2)}</span>
                              <span>Stock: {p.stock}</span>
                            </div>
                          </div>
                          <div className="w-full sm:w-auto flex sm:items-center sm:justify-end">
                            <button
                              type="button"
                              onClick={() => addProductToCart(p)}
                              disabled={outOfStock}
                              className={`mt-2 sm:mt-0 w-full sm:w-auto px-4 py-2 rounded-lg font-medium transition-colors ${outOfStock ? 'bg-gray-300 text-slate-600 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                            >
                              {outOfStock ? 'Agotado' : 'Agregar'}
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: CART & DETAILS */}
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800">Detalles de Venta</h3>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Cliente</label>
                  <div className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl bg-white text-slate-800">
                    <div className="font-semibold truncate">{clienteNombre || 'Cliente Anónimo'}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Método de Pago</label>
                  <select
                    value={metodoPago}
                    onChange={e => setMetodoPago(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="efectivo"> Efectivo</option>
                    <option value="tarjeta"> Tarjeta</option>
                    <option value="yape"> Yape</option>
                    <option value="plin"> Plin</option>
                  </select>
                </div>
              </div>

              {/* Cart */}
              <div className="bg-slate-50 rounded-xl border-2 border-slate-200 p-4">
                <h4 className="font-bold text-slate-800 mb-3 flex items-center justify-between">Carrito <span className="text-sm text-slate-600">({cart.length})</span></h4>

                <div className="space-y-3 max-h-56 sm:max-h-72 overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="text-center py-6 text-slate-500">Carrito vacío</div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id_producto} className="bg-white rounded-lg p-3 border border-slate-200">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-3">
                          <h5 className="font-semibold text-slate-800 text-sm truncate">{item.nombre_producto}</h5>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id_producto)}
                            className="text-red-500 hover:text-red-700 p-1 self-end sm:self-auto"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="1"
                              value={item.cantidad}
                              onChange={e => updateQty(item.id_producto, e.target.value)}
                              className="w-16 px-2 py-1 border border-slate-300 rounded text-center text-sm"
                            />
                            <span className="text-xs text-slate-500">× S/. {Number(item.precio_unitario).toFixed(2)}</span>
                          </div>
                          <div className="font-bold text-slate-800">
                            S/. {(Number(item.precio_unitario) * Number(item.cantidad)).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="border-t border-slate-300 pt-3 mt-3">
                    <div className="flex flex-col sm:flex-row justify-between items-center text-lg font-bold text-slate-800">
                      <span>Total:</span>
                      <span className="mt-2 sm:mt-0">S/. {total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {message && (
                <div className={`p-3 rounded-xl ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {message.text}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={submitting || cart.length === 0}
                  className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-200"
                >
                  {submitting ? 'Procesando...' : 'Generar Venta'}
                </button>

                <button
                  type="button"
                  onClick={() => { setCart([]); setMessage(null); }}
                  className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all duration-200"
                >
                  Limpiar
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>

            <div className="text-center mb-4">
              <h3 className="text-xl font-bold text-slate-800 mb-1">¡Venta Registrada!</h3>
              <p className="text-slate-600 text-sm">La venta se ha procesado correctamente</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-600">ID de Venta:</span><span className="font-bold">#{ventaCreada?.id}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Cliente:</span><span className="font-medium">{ventaCreada?.cliente}</span></div>
              <div className="flex justify-between"><span className="text-slate-600">Productos:</span><span className="font-medium">{ventaCreada?.items} items</span></div>
              <div className="flex justify-between border-t border-slate-200 pt-2"><span className="text-slate-600 font-semibold">Total:</span><span className="font-bold">S/. {ventaCreada?.total?.toFixed(2)}</span></div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setVentaCreada(null);
                  setCart([]);
                  setMessage(null);
                }}
                className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-2 px-4 rounded-xl transition-all duration-200"
              >
                Nueva Venta
              </button>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all duration-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}