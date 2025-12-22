import { useState, useEffect, useCallback, useRef } from 'react';
import * as productosService from '../services/productos.service';

export default function useProductos({ initialPage = 1, perPage = 15 } = {}) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    categoria: '',
    estado: '',
    minStock: '',
    maxStock: ''
  });
  const refreshKey = useRef(0);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        perPage,
        search: filters.search || undefined,
        categoria: filters.categoria || undefined,
        estado: filters.estado || undefined,
        minStock: filters.minStock !== '' ? filters.minStock : undefined,
        maxStock: filters.maxStock !== '' ? filters.maxStock : undefined
      };
      const payload = await productosService.listProductos(params);
      const items = Array.isArray(payload.items) ? payload.items : (Array.isArray(payload.data) ? payload.data : []);
      const total = Number(payload.total ?? payload.totalItems ?? 0);
      setProductos(items);
      setTotalItems(total);
    } catch (err) {
      console.error('useProductos.fetch', err);
      setProductos([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [page, perPage, filters]);

  useEffect(() => { fetch(); }, [fetch, refreshKey.current]);

  function refresh() { refreshKey.current += 1; fetch(); }

  async function createProducto(payload) {
    await productosService.createProducto(payload);
    refresh();
  }

  async function updateProducto(id, data) {
    await productosService.updateProducto(id, data);
    refresh();
  }

  async function deleteProducto(id) {
    await productosService.deleteProducto(id);
    refresh();
  }

  
  async function syncEstadosLocal() {
    for (const p of productos) {
      const id = p.id_producto ?? p.id ?? null;
      if (!id) continue;
      const stockNum = Number(p.stock ?? 0);
      const minNum = Number(p.stock_minimo ?? 0);
      let desired = 'disponible';
      if (!isNaN(minNum) && stockNum <= minNum && stockNum > 0) desired = 'vencimiento';
      if (stockNum <= 0) desired = 'agotado';
      const current = String(p.estado ?? '').toLowerCase();
      if (current !== desired) {
        try {
          await productosService.updateProducto(id, { estado: desired });
        } catch (err) { console.error('syncEstadosLocal error', id, err); }
      }
    }
    refresh();
  }

  async function notifyIfLow(id) {
    try {
      await productosService.notifyLowStock(id);
    } catch (err) {
      console.error('notifyIfLow', err);
    }
  }

  return {
    productos,
    loading,
    page,
    setPage,
    perPage,
    totalItems,
    filters,
    setFilters,
    fetch: refresh,
    createProducto,
    updateProducto,
    deleteProducto,
    syncEstadosLocal,
    notifyIfLow
  };
}