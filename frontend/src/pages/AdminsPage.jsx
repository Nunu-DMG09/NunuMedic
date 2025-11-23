import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import AdminsHeader from '../components/admin/AdminsHeader';
import { EditPasswordModal, EditRoleModal, ConfirmDeleteModal, CreateAdminModal, EditStateModal } from '../components/admin/AdminsModals';

export default function AdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Paginación
  const [page, setPage] = useState(1);
  const perPage = 8;

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    setLoading(true);
    try {
      const res = await api.get('/api/usuarios/listar');
      setAdmins(Array.isArray(res.data) ? res.data : []);
      setPage(1);
    } catch (err) {
      console.error('fetchAdmins', err);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  }

  // acciones por usuario (loading)
  const [actionLoading, setActionLoading] = useState({});

  const setAction = (key, val) => setActionLoading(prev => ({ ...prev, [key]: val }));

  // modals state
  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [roleModalUser, setRoleModalUser] = useState(null);
  const [deleteModalUser, setDeleteModalUser] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [stateModalUser, setStateModalUser] = useState(null);

  // abrir modales (reemplazan prompts)
  async function handleChangeRole(user) {
    setRoleModalUser(user);
  }

  async function handleChangeClave(user) {
    setPasswordModalUser(user);
  }

  async function handleDelete(user) {
    setDeleteModalUser(user);
  }

  function handleChangeEstado(user) {
    setStateModalUser(user);
  }

  // callback para refrescar lista cuando modal confirma la acción
  function onModalSaved() {
    fetchAdmins();
  }

  const filtered = useMemo(() => {
    let result = admins;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(u =>
        `${u.nombre ?? ''} ${u.apellido ?? ''} ${u.usuario ?? ''} ${u.email ?? ''}`.toLowerCase().includes(q)
      );
    }

    if (roleFilter) result = result.filter(u => u.rol === roleFilter);
    if (statusFilter) result = result.filter(u => u.estado === statusFilter);

    return result;
  }, [admins, search, roleFilter, statusFilter]);

  useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const paginatedAdmins = filtered.slice((page - 1) * perPage, page * perPage);

  function clearFilters() {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setPage(1);
  }

  const activeAdmins = admins.filter(u => u.estado === 'activo').length;
  const totalRoles = [...new Set(admins.map(u => u.rol))].length;
  const superAdmins = admins.filter(u => u.rol === 'super_admin').length;

  const availableRoles = useMemo(() => {
    const setRoles = new Set(admins.map(u => (u.rol || '').trim()).filter(Boolean));
    const arr = Array.from(setRoles);
    // ensure core roles are always present (incl. 'vendedor')
    ['super_admin', 'admin', 'vendedor'].forEach(r => { if (!arr.includes(r)) arr.push(r); });
    // prefer a stable ordering: super_admin, admin, vendedor, then the rest alphabetically
    const order = ['super_admin', 'admin', 'vendedor'];
    arr.sort((a, b) => {
      const ia = order.indexOf(a), ib = order.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
    return arr;
  }, [admins]);
  
  // role options for the filter (always include 'vendedor')
  const roleOptions = useMemo(() => {
    return [...new Set([...(admins.map(u => u.rol || '').filter(Boolean)), 'super_admin', 'admin', 'vendedor'])];
  }, [admins]);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <AdminsHeader />

        {/* Modales */}
        {passwordModalUser && (
          <EditPasswordModal
            open={!!passwordModalUser}
            user={passwordModalUser}
            onClose={() => setPasswordModalUser(null)}
            onSaved={onModalSaved}
          />
        )}
        {roleModalUser && (
          <EditRoleModal
            open={!!roleModalUser}
            user={roleModalUser}
            roles={availableRoles}
            onClose={() => setRoleModalUser(null)}
            onSaved={onModalSaved}
          />
        )}
        {deleteModalUser && (
          <ConfirmDeleteModal
            open={!!deleteModalUser}
            user={deleteModalUser}
            onClose={() => setDeleteModalUser(null)}
            onDeleted={onModalSaved}
          />
        )}
        {createModalOpen && (
          <CreateAdminModal
            open={createModalOpen}
            roles={availableRoles}
            onClose={() => setCreateModalOpen(false)}
            onCreated={() => { setCreateModalOpen(false); fetchAdmins(); }}
          />
        )}
        {stateModalUser && (
          <EditStateModal
            open={!!stateModalUser}
            user={stateModalUser}
            onClose={() => setStateModalUser(null)}
            onSaved={() => { setStateModalUser(null); onModalSaved(); }}
          />
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
              </div>
              <div>
                <div className="text-xs text-slate-600">Total Usuarios</div>
                <div className="text-lg sm:text-2xl font-bold text-slate-800">{admins.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <div className="text-xs text-slate-600">Usuarios Activos</div>
                <div className="text-lg sm:text-2xl font-bold text-slate-800">{activeAdmins}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd"/>
                </svg>
              </div>
              <div>
                <div className="text-xs text-slate-600">Super Admins</div>
                <div className="text-lg sm:text-2xl font-bold text-slate-800">{superAdmins}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                </svg>
              </div>
              <div>
                <div className="text-xs text-slate-600">Tipos de Rol</div>
                <div className="text-lg sm:text-2xl font-bold text-slate-800">{totalRoles}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main (table/filter) - unchanged aside from action buttons order */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <svg className="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                  </svg>
                </div>
                Lista de Usuarios
              </h3>
              <div className="text-xs sm:text-sm text-slate-600 mt-1">Mostrando <span className="font-semibold">{paginatedAdmins.length}</span> de <span className="font-semibold">{totalItems}</span> usuarios</div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={fetchAdmins}
                disabled={loading}
                className="flex-1 sm:flex-none w-full sm:w-auto px-3 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-semibold shadow-lg transition"
              >
                <svg className={`w-4 h-4 inline ${loading ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                </svg>
                <span className="ml-2">{loading ? 'Actualizando...' : 'Actualizar'}</span>
              </button>
              <button
                  onClick={() => setCreateModalOpen(true)}
                  className="hidden sm:inline px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:shadow-lg transition"
                  title="Crear nuevo usuario"
                >
                  Nuevo usuario
                </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Buscar Usuario</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Nombre, usuario o email..."
                    className="w-full pl-10 pr-3 py-2 border-2 border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Filtrar por Rol</label>
                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl bg-white text-slate-800"
                >
                  <option value="">Todos los roles</option>
                  {roleOptions.map(rol => (
                    <option key={rol} value={rol}>{rol}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Filtrar por Estado</label>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl bg-white text-slate-800"
                >
                  <option value="">Todos los estados</option>
                  {[...new Set(admins.map(u => u.estado))].map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>

              <div className="lg:col-span-2 flex items-end gap-2">
                <button
                  onClick={clearFilters}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Table for desktop */}
          <div className="hidden sm:block bg-slate-50 rounded-b-xl border-t-2 border-slate-200 overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Usuario</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Información</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-white">Contacto</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-white">Rol</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-white">Estado</th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-white">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">Cargando usuarios...</td>
                  </tr>
                ) : paginatedAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">No hay usuarios</td>
                  </tr>
                ) : (
                  paginatedAdmins.map((u, idx) => (
                    <tr key={u.id_usuario} className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {u.nombre ? u.nombre.charAt(0) : 'U'}{u.apellido ? u.apellido.charAt(0) : ''}
                            </span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-lg">@{u.usuario}</div>
                            <div className="text-slate-600 text-sm">ID: {u.id_usuario}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{u.nombre} {u.apellido}</div>
                        <div className="text-slate-600 text-sm">DNI: {u.dni || 'No registrado'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-800 font-medium">{u.email || 'Sin email'}</div>
                        <div className="text-slate-600 text-sm">{u.telefono || 'Sin teléfono'}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                          u.rol === 'super_admin' ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : u.rol === 'admin' ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : u.rol === 'vendedor' ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${u.estado === 'activo' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                          {u.estado}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          {/* lock (clave) */}
                          <button
                            onClick={() => handleChangeClave(u)}
                            disabled={!!actionLoading[`${u.id_usuario}_clave`]}
                            title="Editar clave"
                            className="p-2 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                          </button>

                          {/* role */}
                          <button
                            onClick={() => handleChangeRole(u)}
                            disabled={!!actionLoading[`${u.id_usuario}_rol`]}
                            title="Editar rol"
                            className="p-2 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 12a5 5 0 100-10 5 5 0 000 10z"/><path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2"/></svg>
                          </button>

                          {/* state (beside role) */}
                          <button
                            onClick={() => handleChangeEstado(u)}
                            disabled={!!actionLoading[`${u.id_usuario}_estado`]}
                            title="Cambiar estado"
                            className="p-2 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-700"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="M12 2v6" /><path d="M5 9l7 7 7-7"/>
                            </svg>
                          </button>

                          {/* delete at the end */}
                          <button
                            onClick={() => handleDelete(u)}
                            disabled={!!actionLoading[`${u.id_usuario}_del`]}
                            title="Eliminar usuario"
                            className="p-2 rounded-md bg-red-50 hover:bg-red-100 text-red-600"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* mobile list (same button order) */}
          <div className="sm:hidden divide-y divide-slate-200">
            {loading ? (
              <div className="p-6 text-center text-slate-500">Cargando usuarios...</div>
            ) : paginatedAdmins.length === 0 ? (
              <div className="p-6 text-center text-slate-500">No hay usuarios</div>
            ) : paginatedAdmins.map(u => (
              <div key={u.id_usuario} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">{u.nombre ? u.nombre.charAt(0) : 'U'}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 truncate">@{u.usuario}</div>
                          <div className="text-sm text-slate-600 truncate">{u.nombre} {u.apellido}</div>
                          <div className="text-xs text-slate-500 mt-1">ID: {u.id_usuario}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <span className="px-2 py-1 bg-blue-50 text-slate-700 rounded-full">Email: {u.email || '—'}</span>
                      <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded-full">Tel: {u.telefono || '—'}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.rol === 'super_admin' ? 'bg-purple-100 text-purple-800'
                        : u.rol === 'admin' ? 'bg-blue-100 text-blue-800'
                        : u.rol === 'vendedor' ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>Rol: {u.rol}</span>
                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>Estado: {u.estado}</span>
                     </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex gap-2">
                      <button onClick={() => handleChangeClave(u)} disabled={!!actionLoading[`${u.id_usuario}_clave`]} className="px-3 py-1 bg-slate-50 text-slate-700 rounded-md text-xs">Clave</button>
                      <button onClick={() => handleChangeRole(u)} disabled={!!actionLoading[`${u.id_usuario}_rol`]} className="px-3 py-1 bg-slate-50 text-slate-700 rounded-md text-xs">Rol</button>
                      <button onClick={() => handleChangeEstado(u)} disabled={!!actionLoading[`${u.id_usuario}_estado`]} className="px-3 py-1 bg-slate-50 text-slate-700 rounded-md text-xs">Estado</button>
                      <button onClick={() => handleDelete(u)} disabled={!!actionLoading[`${u.id_usuario}_del`]} className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-xs">Eliminar</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination (unchanged) */}
          <div className="p-4 sm:p-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-sm text-slate-600">Página <span className="font-semibold">{page}</span> de <span className="font-semibold">{totalPages}</span> — Total: <span className="font-semibold">{totalItems}</span></div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex-1 sm:flex-none px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg"
              >
                Anterior
              </button>
              <span className="px-3 py-2 bg-white border border-slate-200 rounded-lg font-medium">{page}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex-1 sm:flex-none px-3 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>

        {/* Mobile quick actions (unchanged) */}
        <div className="fixed bottom-4 left-0 right-0 z-40 px-4 sm:hidden">
          <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 flex gap-3">
            <button onClick={fetchAdmins} className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold">Actualizar</button>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
