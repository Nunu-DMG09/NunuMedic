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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <MovimientosHeader />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Total Entradas</div>
                  <div className="text-2xl font-bold text-slate-800">
                    {allMovimientos.filter(m => m.tipo === 'entrada').length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-100 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-red-500 to-rose-600 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-10.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 6.414V10a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Total Salidas</div>
                  <div className="text-2xl font-bold text-slate-800">
                    {allMovimientos.filter(m => m.tipo === 'salida').length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Total Movimientos</div>
                  <div className="text-2xl font-bold text-slate-800">{allMovimientos.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <svg className="w-6 h-6 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" clipRule="evenodd"/>
                  </svg>
                </div>
                Registro de Movimientos
              </h3>
              <div className="text-slate-600 mt-2">
                Mostrando <span className="font-semibold">{movimientos.length}</span> de <span className="font-semibold">{totalItems}</span> movimientos
              </div>
            </div>
            
            <button 
              onClick={() => setRefreshKey(k => k + 1)} 
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
              </svg>
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>

          {/* Filters */}
          <div className="mb-8">
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

          {/* Table */}
          <div className="bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
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
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                            m.tipo === 'entrada' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {m.tipo === 'entrada' ? (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd"/>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm3.707 8.293l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414L9 10.586V7a1 1 0 112 0v3.586l1.293-1.293a1 1 0 011.414 1.414z" clipRule="evenodd"/>
                              </svg>
                            )}
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
                              day: '2-digit',
                              month: '2-digit', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
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

          {/* Pagination Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <div className="text-slate-600">
              Página <span className="font-semibold">{page}</span> de <span className="font-semibold">{totalPages}</span> — 
              Total: <span className="font-semibold">{totalItems}</span> registros
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1} 
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 disabled:text-slate-400 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Anterior
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages} 
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 disabled:text-slate-400 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                Siguiente
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}