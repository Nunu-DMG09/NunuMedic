import React from 'react';
import { Link } from 'react-router-dom';

export default function ModuleCard({ title, subtitle, bg, icon, href, onClick }) {
  const CardContent = () => (
    <article className="group relative bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6 h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] cursor-pointer overflow-hidden">
      {/* Decorative background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300" style={{ background: bg || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}></div>
      
      {/* Animated corner decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100/50 to-indigo-100/50 rounded-full -translate-y-10 translate-x-10 group-hover:scale-125 transition-transform duration-500"></div>
      
      <div className="relative flex flex-col h-full">
        <div className="flex items-start gap-4 mb-6">
          <div className="relative">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3"
              style={{ background: bg || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            >
              <div className="text-white group-hover:scale-110 transition-transform duration-300">
                {icon}
              </div>
            </div>
            {/* Pulse animation */}
            <div 
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 group-hover:animate-ping transition-opacity duration-300"
              style={{ background: bg || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
            ></div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors duration-300 mb-2 leading-tight">
              {title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 text-blue-600 group-hover:text-blue-700 transition-colors duration-300 font-semibold text-sm">
              <span>Acceder</span>
              <svg 
                className="w-4 h-4 transform group-hover:translate-x-1 group-hover:scale-110 transition-all duration-300" 
                viewBox="0 0 24 24" 
                fill="none"
              >
                <path 
                  d="M9 18l6-6-6-6" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Status indicator */}
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-500 font-medium">Activo</span>
            </div>
          </div>
        </div>

        {/* Hover glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/0 via-blue-400/5 to-indigo-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link to={href} className="block h-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-2xl">
        <CardContent />
      </Link>
    );
  }

  return (
    <div onClick={onClick} className="h-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-2xl">
      <CardContent />
    </div>
  );
}