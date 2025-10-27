// ...existing code...
import React from 'react';

export default function FilterPagination({
  search,
  onSearchChange,
  categoria,
  onCategoriaChange,
  categoriasMap = {},
  estado,
  onEstadoChange,
  tipo,                // nuevo: tipo (entrada/salida)
  onTipoChange,        // nuevo
  tipoOptions = [],    // nuevo: ['entrada','salida']
  showDateFilter = false, // nuevo: mostrar inputs fecha
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onClear,
  page,
  totalPages,
  onPageChange,
  // new visibility flags
  showCategoria = true,
  showEstado = true
}) {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-bold text-blue-700">Buscar</label>
          <input
            type="text"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            aria-label="Buscar"
            className="w-full px-3 py-2 border-2 border-blue-200 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition text-blue-800"
          />
        </div>

        {showCategoria ? (
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-bold text-blue-700">Categoría</label>
            <select
              value={categoria}
              onChange={e => onCategoriaChange(e.target.value)}
              aria-label="Filtrar por categoría"
              className="w-full px-3 py-2 border-2 border-blue-200 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition text-blue-800"
            >
              <option value="">{/* prettier-ignore */}Todas las categorías</option>
              {Object.entries(categoriasMap).map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        ) : null}

        {showEstado ? (
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-bold text-blue-700">Estado</label>
            <select
              value={estado}
              onChange={e => onEstadoChange(e.target.value)}
              aria-label="Filtrar por estado"
              className="w-full px-3 py-2 border-2 border-blue-200 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition text-blue-800"
            >
              <option value="">Todos los estados</option>
              <option value="disponible">Disponible</option>
              <option value="agotado">Agotado</option>
              <option value="vencimiento">Vencimiento</option>
            </select>
          </div>
        ) : null}

        <div className="flex flex-col">
          <label className="mb-1 text-sm font-bold text-blue-700">Acciones</label>
          <div className="flex gap-2">
            <button
              onClick={onClear}
              className="flex-1 px-3 py-2 bg-blue-50 text-blue-800 border-2 border-blue-100 rounded-md hover:bg-blue-100 transition"
            >
              Limpiar
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-3 py-2 bg-blue-50 text-blue-800 border-2 border-blue-100 rounded-md hover:bg-blue-100 transition disabled:opacity-50"
                aria-label="Página anterior"
              >
                Anterior
              </button>
              <button
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="px-3 py-2 bg-blue-50 text-blue-800 border-2 border-blue-100 rounded-md hover:bg-blue-100 transition disabled:opacity-50"
                aria-label="Página siguiente"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row extra para filtros opcionales: tipo y fecha */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        {tipoOptions && tipoOptions.length > 0 && (
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-bold text-blue-700">Tipo</label>
            <select
              value={tipo}
              onChange={e => onTipoChange?.(e.target.value)}
              className="w-full px-3 py-2 border-2 border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Todos los tipos</option>
              {tipoOptions.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        )}

        {showDateFilter && (
          <>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-bold text-blue-700">Desde</label>
              <input
                type="date"
                value={dateFrom ?? ''}
                onChange={e => onDateFromChange?.(e.target.value)}
                className="w-full px-3 py-2 border-2 border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-bold text-blue-700">Hasta</label>
              <input
                type="date"
                value={dateTo ?? ''}
                onChange={e => onDateToChange?.(e.target.value)}
                className="w-full px-3 py-2 border-2 border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalPages }).map((_, i) => {
          const p = i + 1;
          if (p > 10 && Math.abs(p - page) > 2 && p !== totalPages) return null;
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-3 py-2 rounded-md border ${p === page ? 'bg-blue-600 text-white' : 'bg-white text-blue-700'} cursor-pointer`}
              aria-current={p === page ? 'page' : undefined}
              aria-label={`Ir a página ${p}`}
            >
              {p}
            </button>
          );
        })}
      </div>
    </div>
  );
}
// ...existing code...