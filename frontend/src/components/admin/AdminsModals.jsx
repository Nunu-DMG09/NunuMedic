import React, { useState } from 'react';
import api from '../../services/api';

export function EditPasswordModal({ open, onClose, user, onSaved }) {
  const [clave, setClave] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;
  async function submit(e) {
    e.preventDefault();
    if (!clave) return alert('Ingresa la nueva clave');
    setLoading(true);
    try {
      await api.put(`/api/usuarios/${user.id_usuario}/clave`, { clave });
      onSaved && onSaved();
      onClose();
      setClave('');
      alert('Clave actualizada');
    } catch (err) {
      console.error(err);
      alert('Error al actualizar la clave');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={submit} className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-2">Cambiar clave - @{user.usuario}</h3>
        <p className="text-sm text-slate-600 mb-4">{user.nombre} {user.apellido}</p>
        <label className="block text-sm font-medium mb-1">Nueva clave</label>
        <input type="password" value={clave} onChange={e => setClave(e.target.value)} className="w-full px-3 py-2 border rounded mb-4" autoFocus />
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-100">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white">{loading ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  );
}

export function EditRoleModal({ open, onClose, user, onSaved }) {
  const [role, setRole] = useState(user?.rol || '');
  const [loading, setLoading] = useState(false);

  if (!open) return null;
  async function submit(e) {
    e.preventDefault();
    if (!role) return alert('Ingresa el rol');
    setLoading(true);
    try {
      await api.put(`/api/usuarios/${user.id_usuario}/rol`, { rol: role });
      onSaved && onSaved();
      onClose();
      alert('Rol actualizado');
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el rol');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={submit} className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-2">Cambiar rol - @{user.usuario}</h3>
        <p className="text-sm text-slate-600 mb-4">{user.nombre} {user.apellido}</p>
        <label className="block text-sm font-medium mb-1">Rol</label>
        <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-3 py-2 border rounded mb-4" autoFocus>
          <option value="">-- seleccionar --</option>
          <option value="super_admin">super_admin</option>
          <option value="admin">admin</option>
        </select>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-100">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white">{loading ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  );
}

export function ConfirmDeleteModal({ open, onClose, user, onDeleted }) {
  const [loading, setLoading] = useState(false);
  if (!open) return null;

  async function confirmDelete() {
    if (!window.confirm(`¿Confirmar eliminar a ${user.usuario}? Esta acción es irreversible.`)) return;
    setLoading(true);
    try {
      await api.delete(`/api/usuarios/${user.id_usuario}`);
      onDeleted && onDeleted();
      onClose();
      alert('Usuario eliminado');
    } catch (err) {
      console.error(err);
      alert('Error al eliminar usuario');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-2 text-red-600">Eliminar usuario</h3>
        <p className="text-sm text-slate-600 mb-4">Vas a eliminar a <strong>{user.usuario}</strong> ({user.nombre} {user.apellido}). Esta acción no se puede deshacer.</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-100">Cancelar</button>
          <button onClick={confirmDelete} disabled={loading} className="px-4 py-2 rounded bg-red-600 text-white">{loading ? 'Eliminando...' : 'Eliminar'}</button>
        </div>
      </div>
    </div>
  );
}

export function CreateAdminModal({ open, onClose, onCreated }) {
  const [form, setForm] = React.useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: '',
    usuario: '',
    clave: '',
    rol: 'admin'
  });
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) setForm({ nombre: '', apellido: '', dni: '', telefono: '', email: '', usuario: '', clave: '', rol: 'admin' });
  }, [open]);

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    if (!form.usuario || !form.clave) return alert('Usuario y clave son requeridos');
    setLoading(true);
    try {
      await api.post('/api/usuarios', form);
      onCreated && onCreated();
      onClose();
      alert('Administrador creado');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.error || 'Error al crear administrador');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={submit} className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold mb-2">Crear Administrador</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={form.nombre} onChange={e => setForm(f => ({...f, nombre: e.target.value}))} placeholder="Nombre" className="px-3 py-2 border rounded" />
          <input value={form.apellido} onChange={e => setForm(f => ({...f, apellido: e.target.value}))} placeholder="Apellido" className="px-3 py-2 border rounded" />
          <input value={form.dni} onChange={e => setForm(f => ({...f, dni: e.target.value}))} placeholder="DNI" className="px-3 py-2 border rounded" />
          <input value={form.telefono} onChange={e => setForm(f => ({...f, telefono: e.target.value}))} placeholder="Teléfono" className="px-3 py-2 border rounded" />
          <input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} placeholder="Email" className="px-3 py-2 border rounded" />
          <input value={form.usuario} onChange={e => setForm(f => ({...f, usuario: e.target.value}))} placeholder="Usuario" className="px-3 py-2 border rounded" />
          <input type="password" value={form.clave} onChange={e => setForm(f => ({...f, clave: e.target.value}))} placeholder="Clave" className="px-3 py-2 border rounded" />
          <select value={form.rol} onChange={e => setForm(f => ({...f, rol: e.target.value}))} className="px-3 py-2 border rounded">
            <option value="super_admin">super_admin</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-100">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-green-600 text-white">{loading ? 'Creando...' : 'Crear'}</button>
        </div>
      </form>
    </div>
  );
}

export function EditStateModal({ open, onClose, user, onSaved }) {
  const [estado, setEstado] = React.useState(user?.estado || 'activo');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open) setEstado(user?.estado || 'activo');
  }, [open, user]);

  if (!open) return null;

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/api/usuarios/${user.id_usuario}/estado`, { estado });
      onSaved && onSaved();
      onClose();
      alert('Estado actualizado');
    } catch (err) {
      console.error(err);
      alert('Error al actualizar estado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form onSubmit={submit} className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-2">Cambiar estado - @{user.usuario}</h3>
        <p className="text-sm text-slate-600 mb-4">{user.nombre} {user.apellido}</p>
        <label className="block text-sm font-medium mb-1">Estado</label>
        <select value={estado} onChange={e => setEstado(e.target.value)} className="w-full px-3 py-2 border rounded mb-4" autoFocus>
          <option value="activo">activo</option>
          <option value="inactivo">inactivo</option>
        </select>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-100">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-blue-600 text-white">{loading ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </div>
  );
}

export default {
  EditPasswordModal,
  EditRoleModal,
  ConfirmDeleteModal,
  CreateAdminModal,
  EditStateModal
};