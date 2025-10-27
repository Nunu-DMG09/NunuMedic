// ...existing code...
import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import FilterPagination from '../components/inventario/FilterPagination';
import MovimientosHeader from '../components/inventario/MovimientosHeader';

export default function MovimientosPage() {
  const [allMovimientos, setAllMovimientos] = useState([]); // todos los registros traídos del server
  const [movimientos, setMovimientos] = useState([]); // página actual (filtrada + paginada)
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // filtros y paginación (cliente)
  const [search, setSearch] = useState('');         // nombre producto
  const [tipo, setTipo] = useState('');             // entrada/salida
  const [dateFrom, setDateFrom] = useState('');     // YYYY-MM-DD
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => { fetchAllMovimientos(); /* eslint-disable-next-line */ }, [refreshKey]);

  // trae todos los movimientos (usa perPage grande para evitar cambios backend)
  async function fetchAllMovimientos() {
    setLoading(true);
    try {
      // si tu API no soporta un perPage grande, ajusta o crea endpoint /all
      const res = await api.get('/api/movimientos/listar', {
        params: { page: 1, perPage: 1000000 },
        validateStatus: false
      });
      const data = res.data ?? {};
      const items = Array.isArray(data.items) ? data.items : (Array.isArray(data.data) ? data.data : []);
      setAllMovimientos(items);
      setPage(1);
    } catch (err) {
      console.error('fetchAllMovimientos', err);
      setAllMovimientos([]);
      setPage(1);
    } finally {
      setLoading(false);
    }
  }

  // filtro memoizado (por nombre producto, tipo y fecha)
  const filtered = useMemo(() => {
    if (!allMovimientos || allMovimientos.length === 0) return [];

    const q = (search || '').trim().toLowerCase();

    // preparar rangos de fecha
    let fromTs = null;
    let toTs = null;
    if (dateFrom) {
      const d = new Date(dateFrom);
      d.setHours(0,0,0,0);
      fromTs = d.getTime();
    }
    if (dateTo) {
      const d = new Date(dateTo);
      d.setHours(23,59,59,999);
      toTs = d.getTime();
    }

    return allMovimientos.filter(m => {
      // nombre producto: usa producto_nombre o nombre_producto
      const nombre = String(m.producto_nombre ?? m.nombre_producto ?? '').toLowerCase();
      if (q && !nombre.includes(q)) return false;

      // tipo
      if (tipo && String(m.tipo ?? '').toLowerCase() !== String(tipo).toLowerCase()) return false;

      // fecha
      if ((fromTs !== null) || (toTs !== null)) {
        const fm = m.fecha_movimiento ? new Date(m.fecha_movimiento).getTime() : null;
        if (fm === null) return false;
        if (fromTs !== null && fm < fromTs) return false;
        if (toTs !== null && fm > toTs) return false;
      }

      return true;
    });
  }, [allMovimientos, search, tipo, dateFrom, dateTo]);

  // aplicar paginación sobre el array filtrado
  useEffect(() => {
    const total = filtered.length;
    setTotalItems(total);

    const totalPages = Math.max(1, Math.ceil(total / perPage));
    if (page > totalPages) setPage(1);

    const start = (page - 1) * perPage;
    const end = start + perPage;
    setMovimientos(filtered.slice(start, end));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, page, perPage]);

  function clearFilters() {
    setSearch('');
    setTipo('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const tipoOptions = ['entrada', 'salida'];

  return (
    <div className="container mx-auto p-6">
      <MovimientosHeader /> {/* header agregado */}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Historial de movimientos</h3>
            <div className="text-sm text-gray-500">Mostrando {movimientos.length} — Total filtrado: {totalItems}</div>
          </div>
          <div>
            <button onClick={() => setRefreshKey(k => k + 1)} className="px-3 py-2 border border-blue-200 text-blue-700 rounded-md">Refrescar</button>
          </div>
        </div>

        <FilterPagination
          search={search}
          onSearchChange={val => { setSearch(val); setPage(1); }}
          categoria={''}
          onCategoriaChange={() => {}}
          categoriasMap={{}}
          estado={''}
          onEstadoChange={() => {}}
          tipo={tipo}
          onTipoChange={val => { setTipo(val); setPage(1); }}
          tipoOptions={tipoOptions}
          showDateFilter={true}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={val => { setDateFrom(val); setPage(1); }}
          onDateToChange={val => { setDateTo(val); setPage(1); }}
          onClear={clearFilters}
          page={page}
          totalPages={totalPages}
          onPageChange={p => setPage(p)}
          showCategoria={false}
          showEstado={false}
        />

        <div className="overflow-x-auto mt-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">#</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Producto</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Tipo</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Cantidad</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Descripción</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Fecha</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-500">Cargando...</td></tr>
              ) : movimientos.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-500">No hay movimientos</td></tr>
              ) : movimientos.map(m => (
                <tr key={m.id_movimiento}>
                  <td className="px-4 py-3 text-sm text-gray-700">{m.id_movimiento}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{m.nombre_producto ?? m.producto_nombre ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{m.tipo}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{m.cantidad}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{m.descripcion ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{m.fecha_movimiento ? new Date(m.fecha_movimiento).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">Página {page} / {totalPages} — Total {totalItems}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 border border-gray-200 rounded-md text-gray-700">Anterior</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-2 border border-gray-200 rounded-md text-gray-700">Siguiente</button>
          </div>
        </div>
      </div>
    </div>
  );
}
// ...existing code...