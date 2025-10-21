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
      // Buscar cliente existente por DNI (si la API no soporta filtro, traer todos y filtrar)
      try {
        const resList = await api.get('/api/clientes', { validateStatus: false });
        const list = Array.isArray(resList.data) ? resList.data : (resList.data?.data ?? resList.data?.clientes ?? []);
        const found = (list || []).find(c => String(c.dni) === String(dni));
        if (found) {
          // cliente ya existe -> usarlo directamente
          onCreated(found);
          return;
        }
      } catch (err) {
        // si falla la consulta de clientes, continuar intentando crear (no bloquear)
        console.warn('No se pudo buscar cliente por DNI, se intentará crear', err);
      }

      // Crear cliente nuevo
      const payload = { dni, nombre, apellido };
      const res = await api.post('/api/clientes/create', payload);
      // Backend puede devolver el objeto o id; normalizamos
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
    <div className="card" style={{ padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Registrar Cliente</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label className="small-muted">DNI</label>
          <input value={dni} onChange={e => setDni(e.target.value)} className="input" maxLength={8} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label className="small-muted">Nombre</label>
          <input value={nombre} onChange={e => setNombre(e.target.value)} className="input" />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label className="small-muted">Apellido</label>
          <input value={apellido} onChange={e => setApellido(e.target.value)} className="input" />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Procesando…' : 'Registrar y continuar'}
          </button>
        </div>
      </form>
    </div>
  );
}