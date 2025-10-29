import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminsHeader({ 
  title = 'Gestión de Administradores', 
  subtitle = 'Control y administración de usuarios del sistema', 
  backTo = '/dashboard' 
}) {
  const navigate = useNavigate();

  return (
    <header className="bg-gradient-to-r from-slate-800 via-slate-900 to-purple-900 relative overflow-hidden rounded-2xl mb-8 shadow-xl">
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full -translate-y-32"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full translate-y-48"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-indigo-500/5 rounded-full -translate-x-16 -translate-y-16"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between">
          {/* Left: Back button */}
          <button
            onClick={() => navigate(backTo)}
            className="group flex items-center gap-3 text-slate-300 hover:text-white transition-all duration-200 hover:scale-105"
          >
            <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-semibold">Volver al Dashboard</span>
          </button>

          {/* Center: Title */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-white">{title}</h1>
            </div>
            <p className="text-slate-300 text-lg">{subtitle}</p>
          </div>

          {/* Right: Stats or actions */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-white">NUNUMEDIC</div>
              <div className="text-sm text-slate-300">Panel de Administración</div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">AD</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}