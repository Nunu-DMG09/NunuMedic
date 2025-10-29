import React, { useState } from 'react';
import VentasForm from '../components/ventas/VentasForm';
import ClienteForm from '../components/ventas/ClienteForm';

export default function VentasPage() {
  const [cliente, setCliente] = useState(null);

  function handleClienteCreated(c) {
    setCliente(c);
  }

  function clearCliente() {
    setCliente(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {!cliente ? (
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
                Sistema de Ventas
              </h1>
              <p className="text-slate-600 text-lg">Registra un cliente para comenzar con la venta</p>
            </div>
            
            <ClienteForm onCreated={handleClienteCreated} />
          </div>
        ) : (
          <div>
            {/* Header con cliente seleccionado */}
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                      {cliente.nombre} {cliente.apellido}
                    </h2>
                    <div className="flex items-center gap-4 mt-2 text-slate-600">
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd"/>
                        </svg>
                        DNI: {cliente.dni}
                      </span>
                      {cliente.id_cliente && (
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" clipRule="evenodd"/>
                          </svg>
                          ID: {cliente.id_cliente}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={clearCliente}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                >
                  Registrar otra venta
                </button>
              </div>
            </div>

            {/* Formulario de venta */}
            <VentasForm cliente={cliente} />
          </div>
        )}
      </div>
    </div>
  );
}