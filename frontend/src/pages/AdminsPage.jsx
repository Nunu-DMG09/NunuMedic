import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    setLoading(true);
    try {
      const res = await api.get('/api/usuarios/listar');
      setAdmins(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('fetchAdmins', err);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = admins.filter(u => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${u.nombre ?? ''} ${u.apellido ?? ''} ${u.usuario ?? ''} ${u.email ?? ''}`.toLowerCase().includes(q);
  });

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Administradores</h2>
        <div className="flex items-center gap-2">
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Buscar por nombre, usuario o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="bg-blue-600 text-white px-3 py-2 rounded text-sm" onClick={fetchAdmins} disabled={loading}>
            {loading ? 'Cargando...' : 'Refrescar'}
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">ID</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nombre</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Usuario</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">DNI</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Teléfono</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Rol</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-4 py-6 text-center text-sm text-gray-500">
                  {loading ? 'Cargando administradores...' : 'No hay administradores.'}
                </td>
              </tr>
            ) : (
              filtered.map(u => (
                <tr key={u.id_usuario}>
                  <td className="px-4 py-2 text-sm">{u.id_usuario}</td>
                  <td className="px-4 py-2 text-sm">{u.nombre} {u.apellido}</td>
                  <td className="px-4 py-2 text-sm">{u.usuario}</td>
                  <td className="px-4 py-2 text-sm">{u.dni}</td>
                  <td className="px-4 py-2 text-sm">{u.telefono}</td>
                  <td className="px-4 py-2 text-sm">{u.email}</td>
                  <td className="px-4 py-2 text-sm">{u.rol}</td>
                  <td className="px-4 py-2 text-sm">{u.estado}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}