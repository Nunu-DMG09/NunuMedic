
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function VentasHeader({
  title = 'Historial de Ventas',
  subtitle = 'Control completo de todas las transacciones realizadas',
  backTo = '/dashboard'
}) {
  const navigate = useNavigate();

  return (
    <header className="bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-900 relative overflow-hidden rounded-2xl mb-6 sm:mb-8 shadow-xl">
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="hidden sm:block absolute top-0 left-1/4 w-48 h-48 bg-emerald-500/10 rounded-full -translate-y-28" />
        <div className="hidden md:block absolute bottom-0 right-1/4 w-72 h-72 bg-green-500/10 rounded-full translate-y-36" />
        <div className="hidden lg:block absolute top-1/2 left-1/2 w-32 h-32 bg-teal-500/5 rounded-full -translate-x-16 -translate-y-16" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
       
          <div className="w-full sm:w-auto">
            <button
              onClick={() => navigate(backTo)}
              className="flex items-center gap-2 text-slate-200 hover:text-white transition rounded-md px-2 py-1 sm:px-3 sm:py-2 bg-white/0 hover:bg-white/5"
            >
              <span className="p-1 bg-white/10 rounded-md">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span className="text-sm sm:text-base font-medium">Volver</span>
            </button>
          </div>

         
          <div className="flex-1 text-center min-w-0">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-2xl shadow-lg">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white leading-tight truncate">{title}</h1>
                <p className="text-slate-300 text-xs sm:text-sm mt-1 truncate">{subtitle}</p>
              </div>
            </div>
          </div>

       
          <div className="w-full sm:w-auto flex items-center justify-end gap-3">
            <div className="hidden sm:flex flex-col items-end text-right">
              <div className="text-base sm:text-2xl font-bold text-white">NUNUMEDIC</div>
              <div className="text-xs text-slate-300">Sistema de Ventas</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm sm:text-xl">HV</span>
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
