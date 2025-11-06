
import React, { useState } from 'react';

export default function FilterPagination({
  search,
  onSearchChange,
  categoria,
  onCategoriaChange,
  categoriasMap = {},
  estado,
  onEstadoChange,
  tipo,
  onTipoChange,
  tipoOptions = [],
  showDateFilter = false,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClear,
  page,
  totalPages,
  onPageChange,
  showCategoria = true,
  showEstado = true
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  
  function getPageRange(total, current, maxButtons = 5) {
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + maxButtons - 1);
    start = Math.max(1, end - maxButtons + 1);
    return { start, end };
  }

  const { start, end } = getPageRange(totalPages, page, 5);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-4 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/>
            </svg>
            Filtros
          </h3>
          <p className="text-slate-600 text-sm hidden sm:block">Utiliza los filtros para encontrar productos específicos</p>
        </div>

       
        <div className="sm:hidden">
          <button
            onClick={() => setShowAdvanced(s => !s)}
            className="px-3 py-2 bg-slate-100 rounded-lg text-sm"
          >
            {showAdvanced ? 'Ocultar filtros' : 'Mostrar filtros'}
          </button>
        </div>
      </div>

      <div className={`${showAdvanced ? 'block' : 'hidden'} sm:block`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
      
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Buscar Producto</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={e => onSearchChange(e.target.value)}
                placeholder="Buscar por nombre o descripción..."
                className="w-full pl-10 pr-4 py-2 border-2 border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
          </div>

        
          {showCategoria && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Categoría</label>
              <div className="relative">
                <select
                  value={categoria}
                  onChange={e => onCategoriaChange(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none transition appearance-none"
                >
                  <option value="">Todas las categorías</option>
                  {Object.entries(categoriasMap).map(([id, name]) => (
                    <option key={id} value={id}>{name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
          )}

          
          {showEstado && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Estado</label>
              <div className="relative">
                <select
                  value={estado}
                  onChange={e => onEstadoChange(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none transition appearance-none"
                >
                  <option value="">Todos los estados</option>
                  <option value="disponible">Disponible</option>
                  <option value="agotado">Agotado</option>
                  <option value="vencimiento">Por vencer</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>

      
        {(tipoOptions?.length > 0 || showDateFilter) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {tipoOptions?.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo</label>
                <select
                  value={tipo}
                  onChange={e => onTipoChange?.(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none transition"
                >
                  <option value="">Todos los tipos</option>
                  {tipoOptions.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}

            {showDateFilter && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Desde</label>
                  <input
                    type="date"
                    value={dateFrom ?? ''}
                    onChange={e => onDateFromChange?.(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Hasta</label>
                  <input
                    type="date"
                    value={dateTo ?? ''}
                    onChange={e => onDateToChange?.(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none transition"
                  />
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex gap-3 flex-col sm:flex-row">
          <button
            onClick={onClear}
            className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold"
          >
            Limpiar Filtros
          </button>
          <div className="flex-1" />
        </div>
      </div>

    
      <div className="pt-4 border-t border-slate-200 mt-4">
     
        <div className="flex items-center justify-between sm:hidden">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-3 py-2 bg-white border-2 border-slate-200 text-slate-600 rounded-lg disabled:opacity-50"
            aria-label="Página anterior"
          >
            ←
          </button>

          <div className="text-sm text-slate-700">Página <span className="font-semibold">{page}</span> / {totalPages}</div>

          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="px-3 py-2 bg-white border-2 border-slate-200 text-slate-600 rounded-lg disabled:opacity-50"
            aria-label="Página siguiente"
          >
            →
          </button>
        </div>

       
        <div className="hidden sm:flex items-center justify-between">
          <div className="text-sm text-slate-600">Página {page} de {totalPages}</div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="px-3 py-2 bg-white border-2 border-slate-200 text-slate-600 rounded-lg disabled:opacity-50"
              aria-label="Anterior"
            >
              ← Anterior
            </button>

            <div className="flex items-center gap-1">
              
              {start > 1 && (
                <>
                  <button
                    onClick={() => onPageChange(1)}
                    className={`w-9 h-9 rounded-lg ${1 === page ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                  >
                    1
                  </button>
                  {start > 2 && <div className="px-2 text-slate-400">…</div>}
                </>
              )}

              
              {Array.from({ length: end - start + 1 }).map((_, i) => {
                const pageNum = start + i;
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-9 h-9 rounded-lg ${pageNum === page ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                    aria-current={pageNum === page ? 'page' : undefined}
                  >
                    {pageNum}
                  </button>
                );
              })}

           
              {end < totalPages && (
                <>
                  {end < totalPages - 1 && <div className="px-2 text-slate-400">…</div>}
                  <button
                    onClick={() => onPageChange(totalPages)}
                    className={`w-9 h-9 rounded-lg ${totalPages === page ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="px-3 py-2 bg-white border-2 border-slate-200 text-slate-600 rounded-lg disabled:opacity-50"
              aria-label="Siguiente"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
