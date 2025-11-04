// ...existing code...
import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import FilterPagination from '../components/inventario/FilterPagination';
import MovimientosHeader from '../components/inventario/MovimientosHeader';

export default function MovimientosPage() {
  const [allMovimientos, setAllMovimientos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // filtros y paginación
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => { fetchAllMovimientos(); }, [refreshKey]);

  async function fetchAllMovimientos() {
    setLoading(true);
    try {
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

  // filtro memoizado
  const filtered = useMemo(() => {
    if (!allMovimientos || allMovimientos.length === 0) return [];

    const q = (search || '').trim().toLowerCase();

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
      const nombre = String(m.producto_nombre ?? m.nombre_producto ?? '').toLowerCase();
      if (q && !nombre.includes(q)) return false;

      if (tipo && String(m.tipo ?? '').toLowerCase() !== String(tipo).toLowerCase()) return false;

      if ((fromTs !== null) || (toTs !== null)) {
        const fm = m.fecha_movimiento ? new Date(m.fecha_movimiento).getTime() : null;
        if (fm === null) return false;
        if (fromTs !== null && fm < fromTs) return false;
        if (toTs !== null && fm > toTs) return false;
      }

      return true;
    });
  }, [allMovimientos, search, tipo, dateFrom, dateTo]);

  // aplicar paginación
  useEffect(() => {
    const total = filtered.length;
    setTotalItems(total);

    const totalPages = Math.max(1, Math.ceil(total / perPage));
    if (page > totalPages) setPage(1);

    const start = (page - 1) * perPage;
    const end = start + perPage;
    setMovimientos(filtered.slice(start, end));
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <MovimientosHeader />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-green-100 rounded-full -translate-y-8 translate-x-8 opacity-40 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-slate-600">Total Entradas</div>
                <div className="text-lg sm:text-2xl font-bold text-slate-800">
                  {allMovimientos.filter(m => m.tipo === 'entrada').length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 rounded-full -translate-y-8 translate-x-8 opacity-40 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-10.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 6.414V10a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-slate-600">Total Salidas</div>
                <div className="text-lg sm:text-2xl font-bold text-slate-800">
                  {allMovimientos.filter(m => m.tipo === 'salida').length}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-full -translate-y-8 translate-x-8 opacity-40 hidden sm:block"></div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <div className="text-xs sm:text-sm text-slate-600">Total Movimientos</div>
                <div className="text-lg sm:text-2xl font-bold text-slate-800">{allMovimientos.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-4 sm:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" clipRule="evenodd"/>
                  </svg>
                </div>
                Registro de Movimientos
              </h3>
              <div className="text-slate-600 mt-1 text-sm">
                Mostrando <span className="font-semibold">{movimientos.length}</span> de <span className="font-semibold">{totalItems}</span> movimientos
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => setRefreshKey(k => k + 1)} 
                className="flex-1 sm:flex-none px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:scale-105 transition"
              >
                <svg className={`w-4 h-4 inline ${loading ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                </svg>
                <span className="ml-2">{loading ? 'Actualizando...' : 'Actualizar'}</span>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6">
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
          </div>

          {/* Table for desktop */}
          <div className="hidden sm:block bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">#</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Producto</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Tipo</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-white">Cantidad</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Descripción</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Fecha</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center">
                        <div className="flex items-center justify-center gap-3 text-slate-500">
                          <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          <span className="text-lg">Cargando movimientos...</span>
                        </div>
                      </td>
                    </tr>
                  ) : movimientos.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" clipRule="evenodd"/>
                            </svg>
                          </div>
                          <div className="text-xl font-semibold text-slate-600 mb-2">No hay movimientos</div>
                          <div className="text-slate-500">No se encontraron registros con los filtros aplicados</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    movimientos.map((m, index) => (
                      <tr key={m.id_movimiento} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold text-slate-600">{m.id_movimiento}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{m.nombre_producto ?? m.producto_nombre ?? '-'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${m.tipo === 'entrada' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                            {m.tipo}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-lg font-bold text-slate-800">{m.cantidad}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-600">{m.descripcion ?? '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-600">
                            {m.fecha_movimiento ? new Date(m.fecha_movimiento).toLocaleString('es-PE', {
                              day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            }) : '-'}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile: list cards */}
          <div className="sm:hidden divide-y divide-slate-200 bg-white rounded-md">
            {loading ? (
              <div className="p-6 text-center text-slate-500">Cargando movimientos...</div>
            ) : movimientos.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No hay movimientos</div>
            ) : movimientos.map(m => (
              <div key={m.id_movimiento} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-slate-800 truncate">{m.nombre_producto ?? m.producto_nombre ?? '-'}</div>
                      <div className="text-xs text-slate-500">#{m.id_movimiento}</div>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">{m.descripcion ?? '-'}</div>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${m.tipo === 'entrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {m.tipo}
                      </span>
                      <span className="text-xs text-slate-500">Cant: <span className="font-semibold">{m.cantidad}</span></span>
                      <span className="text-xs text-slate-500">{m.fecha_movimiento ? new Date(m.fecha_movimiento).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="text-sm font-bold text-slate-800">S/.</div>
                    <div className="text-xs text-slate-500">—</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-200">
            <div className="text-slate-600 text-sm">
              Página <span className="font-semibold">{page}</span> de <span className="font-semibold">{totalPages}</span> — Total: <span className="font-semibold">{totalItems}</span> registros
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1} 
                className="flex-1 sm:flex-none px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 disabled:text-slate-400 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium">{page}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages} 
                className="flex-1 sm:flex-none px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 disabled:text-slate-400 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>

        {/* Mobile quick bar */}
        <div className="fixed bottom-4 left-0 right-0 z-40 px-4 sm:hidden">
          <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 flex gap-3">
            <button onClick={() => setRefreshKey(k => k + 1)} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold">Actualizar</button>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// ...existing code...