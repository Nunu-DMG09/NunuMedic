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
      // prevent increasing beyond stock
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

  const filtered = productos.filter(p => !search || String(p.nombre_producto ?? '').toLowerCase().includes(search.toLowerCase())).slice(0, 20);
  const total = cart.reduce((s, it) => s + (Number(it.precio_unitario || 0) * Number(it.cantidad || 0)), 0);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!cart.length) return setMessage({ type: 'error', text: 'Agrega al menos 1 producto' });

    // validar stock antes de enviar
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
      
      // Mostrar modal de éxito
      setVentaCreada({
        id: res.data?.id_venta ?? 'N/A',
        total: total,
        cliente: clienteNombre || 'Cliente Anónimo',
        items: cart.length
      });
      setShowSuccessModal(true);
      
      // Limpiar formulario (mantener cliente para la próxima venta)
      setCart([]);
      // NO limpiar clienteNombre / id_cliente => se conservará para la siguiente venta
      setMetodoPago('efectivo');
      setMessage(null);

      // refrescar productos para actualizar stocks en UI
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
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: PRODUCTOS */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Catálogo de Productos</h3>
                
                {/* Search */}
                <div className="relative mb-6">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <input 
                    type="text"
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    placeholder="Buscar producto por nombre..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                {/* Products List */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 max-h-64 overflow-y-auto">
                  {loadingProducts ? (
                    <div className="p-8 text-center text-slate-500">Cargando productos...</div>
                  ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">No se encontraron productos</div>
                  ) : (
                    filtered.map(p => {
                      const outOfStock = Number(p.stock ?? 0) <= 0;
                      return (
                        <div key={p.id_producto} className="flex items-center justify-between p-4 border-b border-slate-200 last:border-b-0 hover:bg-white transition-colors">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-800 truncate">{p.nombre_producto}</h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                              <span className="flex items-center gap-1">S/. {Number(p.precio_venta || 0).toFixed(2)}</span>
                              <span className="flex items-center gap-1">Stock: {p.stock}</span>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => addProductToCart(p)}
                            disabled={outOfStock}
                            className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${outOfStock ? 'bg-gray-300 text-slate-600 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                          >
                            {outOfStock ? 'Agotado' : 'Agregar'}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: CART & DETAILS */}
            <div className="space-y-6">
              {/* Client & Payment */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Detalles de Venta</h3>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Cliente</label>
                  <div className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-800">
                    <div className="font-semibold">{clienteNombre || 'Cliente Anónimo'}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Método de Pago</label>
                  <select 
                    value={metodoPago} 
                    onChange={e => setMetodoPago(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="efectivo"> Efectivo</option>
                    <option value="tarjeta"> Tarjeta</option>
                    <option value="yape"> Yape</option>
                    <option value="plin"> Plin</option>
                  </select>
                </div>
              </div>

              {/* Cart */}
              <div className="bg-slate-50 rounded-xl border-2 border-slate-200 p-6">
                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">Carrito ({cart.length})</h4>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">Carrito vacío</div>
                  ) : (
                    cart.map(item => (
                      <div key={item.id_producto} className="bg-white rounded-lg p-4 border border-slate-200">
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="font-semibold text-slate-800 text-sm">{item.nombre_producto}</h5>
                          <button 
                            type="button" 
                            onClick={() => removeItem(item.id_producto)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            ✕
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
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
                  <div className="border-t border-slate-300 pt-4 mt-4">
                    <div className="flex justify-between items-center text-xl font-bold text-slate-800">
                      <span>Total:</span>
                      <span>S/. {total.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages */}
              {message && (
                <div className={`p-4 rounded-xl ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {message.text}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button 
                  type="submit" 
                  disabled={submitting || cart.length === 0}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-200 hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Procesando...' : 'Generar Venta'}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => { setCart([]); setMessage(null); /* mantener cliente */ }}
                  className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all duration-200"
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">¡Venta Registrada!</h3>
              <p className="text-slate-600">La venta se ha procesado correctamente</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 mb-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">ID de Venta:</span>
                <span className="font-bold text-slate-800">#{ventaCreada?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Cliente:</span>
                <span className="font-medium text-slate-800">{ventaCreada?.cliente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Productos:</span>
                <span className="font-medium text-slate-800">{ventaCreada?.items} items</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3">
                <span className="text-slate-600 font-semibold">Total:</span>
                <span className="font-bold text-xl text-slate-800">S/. {ventaCreada?.total?.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  // preparar nueva venta pero mantener cliente seleccionado
                  setShowSuccessModal(false);
                  setVentaCreada(null);
                  setCart([]);
                  setMessage(null);
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Nueva Venta
              </button>
               <button 
                 onClick={() => setShowSuccessModal(false)}
                 className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all duration-200"
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