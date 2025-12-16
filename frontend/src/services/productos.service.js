import api from './api';

export async function listProductos(params = {}) {
  const res = await api.get('/api/productos/paginar', { params, validateStatus: false });
  return res.data ?? {};
}

export async function updateProducto(id, data) {
  return api.put(`/api/productos/${id}`, data);
}

export async function deleteProducto(id) {
  return api.delete(`/api/productos/${id}`);
}

export async function createProducto(payload) {
  return api.post('/api/productos', payload);
}

export async function notifyLowStock(id) {
  return api.post('/api/productos/notificacion', { id_producto: id });
}