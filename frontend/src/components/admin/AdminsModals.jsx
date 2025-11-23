import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function ModalShell({ open, onClose, title, subtitle, children, danger = false }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === 'Escape') onClose && onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative w-full max-w-lg bg-white rounded-2xl shadow-2xl transform transition-all duration-200 ${
          danger ? 'ring-2 ring-red-100' : ''
        }`}
      >
        <div className="flex items-start justify-between p-5 border-b border-slate-100">
          <div>
            <h3 id="modal-title" className="text-lg font-semibold text-slate-800">{title}</h3>
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="text-slate-400 hover:text-slate-600 rounded-md p-1"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

/* Edit Password */
export function EditPasswordModal({ open, onClose, user = {}, onSaved }) {
  const [clave, setClave] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!open) setClave(''); }, [open]);

  async function submit(e) {
    e.preventDefault();
    if (!clave || clave.length < 6) return alert('La contraseña debe tener al menos 6 caracteres.');
    setLoading(true);
    try {
      await api.put(`/api/usuarios/${user.id_usuario}/clave`, { clave });
      onSaved && onSaved();
      onClose && onClose();
      setClave('');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Cambiar contraseña"
      subtitle={`Usuario: @${user.usuario || ''} — ${user.nombre || ''} ${user.apellido || ''}`}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nueva contraseña</label>
          <input
            type="password"
            value={clave}
            onChange={e => setClave(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            autoFocus
            className="mt-2 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <p className="text-xs text-slate-400 mt-1">Usa una combinación de letras, números y símbolos para mayor seguridad.</p>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-blue-600 text-white">
            {loading ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* Edit Role */
export function EditRoleModal({ open, onClose, user = {}, roles = ['super_admin','admin','vendedor','user'], onSaved }) {
  const [role, setRole] = useState(user?.rol || roles[0] || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setRole(user?.rol || roles[0] || '');
  }, [open, user, roles]);

  async function submit(e) {
    e.preventDefault();
    if (!role) return alert('Selecciona un rol');
    setLoading(true);
    try {
      await api.put(`/api/usuarios/${user.id_usuario}/rol`, { rol: role });
      onSaved && onSaved();
      onClose && onClose();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || 'Error al actualizar el rol');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Cambiar rol"
      subtitle={`@${user.usuario || ''} — selecciona el rol apropiado`}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Rol</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="mt-2 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200"
            autoFocus
          >
            <option value="">-- seleccionar rol --</option>
            {roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">Los permisos del sistema dependerán del rol asignado.</p>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-blue-600 text-white">
            {loading ? 'Guardando...' : 'Actualizar rol'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* Create Admin */
export function CreateAdminModal({ open, onClose, onCreated, roles = ['super_admin','admin','vendedor'] }) {
  const [form, setForm] = useState({
    nombre: '', apellido: '', dni: '', telefono: '', email: '', usuario: '', clave: '', rol: roles[0] || 'admin'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) setForm({ nombre: '', apellido: '', dni: '', telefono: '', email: '', usuario: '', clave: '', rol: roles[0] || 'admin' });
  }, [open, roles]);

  async function submit(e) {
    e.preventDefault();
    if (!form.usuario || !form.clave) return alert('Usuario y contraseña son requeridos.');
    if (form.clave.length < 6) return alert('La contraseña debe tener al menos 6 caracteres.');
    setLoading(true);
    try {
      await api.post('/api/usuarios', form);
      onCreated && onCreated();
      onClose && onClose();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || 'Error al crear administrador');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Crear nuevo usuario"
      subtitle="Completa los datos para crear un nuevo usuario con permisos de administrador."
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} placeholder="Nombre" className="px-4 py-2 border rounded-lg focus:outline-none" />
          <input value={form.apellido} onChange={e => setForm(f => ({...f, apellido: e.target.value}))} placeholder="Apellido" className="px-4 py-2 border rounded-lg focus:outline-none" />
          <input value={form.dni} onChange={e => setForm(f => ({...f, dni: e.target.value}))} placeholder="DNI" className="px-4 py-2 border rounded-lg focus:outline-none" />
          <input value={form.telefono} onChange={e => setForm(f => ({...f, telefono: e.target.value}))} placeholder="Teléfono" className="px-4 py-2 border rounded-lg focus:outline-none" />
          <input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="Email" className="px-4 py-2 border rounded-lg focus:outline-none" />
          <input value={form.usuario} onChange={e => setForm(f => ({...f, usuario: e.target.value}))} placeholder="Usuario (solo 6 numeros)" className="px-4 py-2 border rounded-lg focus:outline-none" />
          <input type="password" value={form.clave} onChange={e => setForm(f => ({...f, clave: e.target.value}))} placeholder="Contraseña" className="px-4 py-2 border rounded-lg focus:outline-none" />
          <select value={form.rol} onChange={e => setForm(f => ({...f, rol: e.target.value}))} className="px-4 py-2 border rounded-lg focus:outline-none">
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400">Se enviará la contraseña tal como la ingreses. Asegúrate de comunicarla de forma segura.</p>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-green-600 text-white">
              {loading ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </div>
      </form>
    </ModalShell>
  );
}

/* Edit State */
export function EditStateModal({ open, onClose, user = {}, onSaved }) {
  const [estado, setEstado] = useState(user?.estado || 'activo');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (open) setEstado(user?.estado || 'activo'); }, [open, user]);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/api/usuarios/${user.id_usuario}/estado`, { estado });
      onSaved && onSaved();
      onClose && onClose();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || 'Error al actualizar estado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Cambiar estado"
      subtitle={`@${user.usuario || ''} — actualmente ${user.estado || ''}`}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Estado</label>
          <select value={estado} onChange={e => setEstado(e.target.value)} className="mt-2 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200" autoFocus>
            <option value="activo">activo</option>
            <option value="inactivo">inactivo</option>
          </select>
          <p className="text-xs text-slate-400 mt-1">Cambiar el estado afecta el acceso al sistema.</p>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg bg-blue-600 text-white">
            {loading ? 'Guardando...' : 'Guardar estado'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* Confirm Delete */
export function ConfirmDeleteModal({ open, onClose, user = {}, onDeleted }) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function confirmDelete() {
    if (!window.confirm(`¿Seguro que deseas eliminar a ${user.usuario}? Esta acción no se puede deshacer.`)) return;
    setLoading(true);
    try {
      await api.delete(`/api/usuarios/${user.id_usuario}`);
      onDeleted && onDeleted();
      onClose && onClose();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || 'Error al eliminar usuario');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ModalShell open={open} onClose={onClose} title="Eliminar usuario" subtitle={`@${user.usuario || ''}`} danger>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">Eliminará permanentemente al usuario <strong>{user.nombre} {user.apellido} ({user.usuario})</strong>. Esta acción no tiene reverso.</p>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700">Cancelar</button>
          <button onClick={confirmDelete} disabled={loading} className="px-4 py-2 rounded-lg bg-red-600 text-white">
            {loading ? 'Eliminando...' : 'Eliminar usuario'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export default {
  EditPasswordModal,
  EditRoleModal,
  ConfirmDeleteModal,
  CreateAdminModal,
  EditStateModal
};