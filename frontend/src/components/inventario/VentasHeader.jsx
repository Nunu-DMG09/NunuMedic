import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function VentasHeader({
  title = 'HISTORIAL DE VENTAS',
  backTo = '/'
}) {
  const navigate = useNavigate();

  return (
    <header className="hero-inventory mb-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(backTo)}
            aria-label="Volver al Dashboard"
            className="inline-flex items-center gap-2 text-blue-100 hover:text-white opacity-90 focus:outline-none cursor-pointer"
          >
            <svg className="w-5 h-5 text-blue-200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="text-lg">Volver al Dashboard</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hero-title flex items-center gap-3">
            <svg className="w-8 h-8 text-blue-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M3 7h18M3 12h18M3 17h18" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <h2 className="app-title">{title}</h2>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}