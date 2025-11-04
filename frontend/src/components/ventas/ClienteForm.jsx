import React, { useState } from 'react';
import api from '../../services/api';

export default function ClienteForm({ onCreated }) {
  const [dni, setDni] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [loading, setLoading] = useState(false);

  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!dni || !nombre || !apellido) return alert('DNI, nombre y apellido son requeridos');
    setLoading(true);
    try {
      try {
        const resList = await api.get('/api/clientes', { validateStatus: false });
        const list = Array.isArray(resList.data) ? resList.data : (resList.data?.data ?? resList.data?.clientes ?? resList.data);
        const found = (list || []).find(c => String(c.dni) === String(dni));
        if (found) {
          onCreated(found);
          return;
        }
      } catch (err) {
        console.warn('No se pudo buscar cliente por DNI, se intentará crear', err);
      }

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

  async function handleVerifyDni() {
    if (!dni) return setCheckMessage('Ingresa un DNI para verificar');
    setChecking(true);
    setCheckMessage('');
    try {
      let found = null;
      try {
        const res = await api.get('/api/clientes', { params: { dni }, validateStatus: false });
        const list = Array.isArray(res.data) ? res.data : (res.data?.data ?? res.data?.clientes ?? res.data);
        found = (list || []).find(c => String(c.dni) === String(dni));
      } catch (err) {
        console.warn('Error buscando por DNI (query), se listará todo', err);
      }

      if (!found) {
        const resAll = await api.get('/api/clientes', { validateStatus: false });
        const listAll = Array.isArray(resAll.data) ? resAll.data : (resAll.data?.data ?? resAll.data?.clientes ?? resAll.data);
        found = (listAll || []).find(c => String(c.dni) === String(dni));
      }

      if (found) {
        setNombre(found.nombre ?? found.nombres ?? '');
        setApellido(found.apellido ?? found.apellidos ?? '');
        setCheckMessage(`Cliente encontrado: ${found.nombre ?? ''} ${found.apellido ?? ''}`);
        if (typeof onCreated === 'function') onCreated(found);
      } else {
        setCheckMessage('No existe un cliente con ese DNI. Debes registrarlo.');
      }
    } catch (err) {
      console.error('Error verificando DNI', err);
      setCheckMessage('Error verificando DNI');
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-6 sm:p-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -translate-y-12 translate-x-12 opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-slate-100 to-blue-100 rounded-full translate-y-10 -translate-x-10 opacity-25"></div>

      <div className="relative">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
            </svg>
          </div>
          <h2 className="text-xl sm:text-3xl font-bold text-slate-800 mb-1">Registrar Cliente</h2>
          <p className="text-slate-600 text-sm sm:text-base">Completa los datos del cliente para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Documento de Identidad (DNI)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={dni}
                  onChange={e => { setDni(e.target.value); setCheckMessage(''); }}
                  maxLength={8}
                  placeholder="Ingresa el DNI (8 dígitos)"
                  className="w-full pl-10 pr-24 py-3 sm:py-4 border-2 border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleVerifyDni}
                    disabled={checking || !dni}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {checking ? 'Verificando...' : 'Verificar'}
                  </button>
                </div>
              </div>
              {checkMessage && <div className="mt-2 text-sm text-slate-600">{checkMessage}</div>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nombres</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Nombres completos"
                  className="w-full pl-10 pr-4 py-3 sm:py-4 border-2 border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Apellidos</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={apellido}
                  onChange={e => setApellido(e.target.value)}
                  placeholder="Apellidos completos"
                  className="w-full pl-10 pr-4 py-3 sm:py-4 border-2 border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || !dni || !nombre || !apellido}
              className="w-full sm:w-auto justify-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-bold py-3 sm:py-4 px-4 sm:px-8 rounded-xl shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-200"
            >
              {loading ? 'Procesando...' : 'Registrar y Continuar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}