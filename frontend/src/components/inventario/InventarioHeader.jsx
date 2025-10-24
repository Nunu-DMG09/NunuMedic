import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function InventarioHeader({ title = 'ADMINISTRACIÓN DE INVENTARIO', subtitle = 'Administración de inventario', backTo = '/dashboard' }) {
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
              <path d="M21 16.5V8.5a1 1 0 0 0-.553-.894l-8-4.5a1 1 0 0 0-.894 0l-8 4.5A1 1 0 0 0 2 8.5v8a1 1 0 0 0 .553.894l8 4.5a1 1 0 0 0 .894 0l8-4.5A1 1 0 0 0 21 16.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2.5 8.9l9 4.5 9-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 13.4V21" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
             <span><h2 className="app-title"> {title}</h2></span>
          </div>

          {subtitle && <div className="hero-subtitle hidden md:block"></div>}
        </div>
      </div>
    </header>
  );
}