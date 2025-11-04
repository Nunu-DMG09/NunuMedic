// ...existing code...
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminsHeader({
  title = 'Gestión de Administradores',
  subtitle = 'Control y administración de usuarios del sistema',
  backTo = '/dashboard'
}) {
  const navigate = useNavigate();

  return (
    <header className="bg-gradient-to-r from-slate-800 via-slate-900 to-purple-900 relative overflow-hidden rounded-2xl mb-6 sm:mb-8 shadow-xl">
      {/* Decorative elements - hide on small screens */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="hidden sm:block absolute top-0 left-1/4 w-48 h-48 bg-purple-500/10 rounded-full -translate-y-28" />
        <div className="hidden md:block absolute bottom-0 right-1/4 w-72 h-72 bg-violet-500/10 rounded-full translate-y-36" />
        <div className="hidden lg:block absolute top-1/2 left-1/2 w-32 h-32 bg-indigo-500/5 rounded-full -translate-x-16 -translate-y-16" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Back */}
          <div className="w-full sm:w-auto">
            <button
              onClick={() => navigate(backTo)}
              className="flex items-center gap-2 text-slate-200 hover:text-white transition rounded-md px-2 py-1 bg-white/0 hover:bg-white/5"
            >
              <span className="p-1 bg-white/10 rounded-md">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="text-sm sm:text-base font-medium">Volver</span>
            </button>
          </div>

          {/* Center: Title */}
          <div className="flex-1 text-center min-w-0">
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl shadow-lg">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white leading-tight truncate">{title}</h1>
                <p className="text-slate-300 text-xs sm:text-sm mt-1 truncate">{subtitle}</p>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="w-full sm:w-auto flex items-center justify-end gap-3">
            <div className="hidden sm:flex flex-col items-end text-right">
              <div className="text-base sm:text-2xl font-bold text-white">NUNUMEDIC</div>
              <div className="text-xs text-slate-300">Panel de Administración</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm sm:text-xl">AD</span>
              </div>

              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="sm:hidden p-2 rounded-md bg-white/5 text-white hover:bg-white/10"
                title="Ir arriba"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
// ...existing code...