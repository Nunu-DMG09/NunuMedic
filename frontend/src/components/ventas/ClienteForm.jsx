import React, { useState } from 'react';
import api from '../../services/api';

export default function ClienteForm({ onCreated }) {
  const [dni, setDni] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!dni || !nombre || !apellido) return alert('DNI, nombre y apellido son requeridos');
    setLoading(true);
    try {
      // Buscar cliente existente por DNI
      try {
        const resList = await api.get('/api/clientes', { validateStatus: false });
        const list = Array.isArray(resList.data) ? resList.data : (resList.data?.data ?? resList.data?.clientes ?? []);
        const found = (list || []).find(c => String(c.dni) === String(dni));
        if (found) {
          onCreated(found);
          return;
        }
      } catch (err) {
        console.warn('No se pudo buscar cliente por DNI, se intentará crear', err);
      }

      // Crear cliente nuevo
      const payload = { dni, nombre, apellido };
      const res = await api.post('/api/clientes/create', payload);
      const created = res?.data?.data ?? res?.data ?? null;
      let clienteObj = null;
      if (created && created.id_cliente) clienteObj = created;
      else if (created && created.id) clienteObj = { id_cliente: created.id, nombre, apellido, dni };
      else if (res?.data && res.data.id_cliente) clienteObj = { id_cliente: res.data.id_cliente, nombre, apellido, dni };
      else clienteObj = { id_cliente: res?.data?.id ?? null, nombre, apellido, dni };

      onCreated(clienteObj);
    } catch (err) {
      console.error('Error creando cliente', err);
      alert(err.response?.data?.error || 'Error creando cliente');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-10 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-slate-100 to-blue-100 rounded-full translate-y-12 -translate-x-12 opacity-30"></div>
      
      <div className="relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Registrar Cliente</h2>
          <p className="text-slate-600">Completa los datos del cliente para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Documento de Identidad (DNI)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <input 
                  type="text"
                  value={dni} 
                  onChange={e => setDni(e.target.value)} 
                  maxLength={8}
                  placeholder="Ingresa el DNI (8 dígitos)"
                  className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Nombres
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <input 
                  type="text"
                  value={nombre} 
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Nombres completos"
                  className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Apellidos
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <input 
                  type="text"
                  value={apellido} 
                  onChange={e => setApellido(e.target.value)}
                  placeholder="Apellidos completos"
                  className="w-full pl-12 pr-4 py-4 border-2 border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading || !dni || !nombre || !apellido}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-200 hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Procesando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  Registrar y Continuar
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}