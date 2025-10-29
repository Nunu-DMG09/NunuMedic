import React from 'react';

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
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"/>
          </svg>
          Filtros de Búsqueda
        </h3>
        <p className="text-slate-600 text-sm">Utiliza los filtros para encontrar productos específicos</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Buscar Producto
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="Buscar por nombre o descripción..."
              className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Category Filter */}
        {showCategoria && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Categoría
            </label>
            <div className="relative">
              <select
                value={categoria}
                onChange={e => onCategoriaChange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="">Todas las categorías</option>
                {Object.entries(categoriasMap).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Status Filter */}
        {showEstado && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Estado
            </label>
            <div className="relative">
              <select
                value={estado}
                onChange={e => onEstadoChange(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
              >
                <option value="">Todos los estados</option>
                <option value="disponible">Disponible</option>
                <option value="agotado">Agotado</option>
                <option value="vencimiento">Por vencer</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stock Range Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

        <div className="flex items-end">
          <button
            onClick={onClear}
            className="w-full px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all duration-200 hover:scale-105 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
            </svg>
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Additional Filters Row (if needed) */}
      {(tipoOptions?.length > 0 || showDateFilter) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 pt-6 border-t border-slate-200">
          {tipoOptions?.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Tipo</label>
              <select
                value={tipo}
                onChange={e => onTipoChange?.(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
              >
                <option value="">Todos los tipos</option>
                {tipoOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}

          {showDateFilter && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Desde</label>
                <input
                  type="date"
                  value={dateFrom ?? ''}
                  onChange={e => onDateFromChange?.(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Hasta</label>
                <input
                  type="date"
                  value={dateTo ?? ''}
                  onChange={e => onDateToChange?.(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200">
        <div className="text-sm text-slate-600">
          Página {page} de {totalPages}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="px-4 py-2 bg-white border-2 border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            ← Anterior
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const pageNum = i + Math.max(1, page - 2);
              if (pageNum > totalPages) return null;
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium transition-all duration-200 ${
                    pageNum === page
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 bg-white border-2 border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}