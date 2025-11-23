import * as Usuario from '../models/usuario.model.js';
import bcrypt from 'bcryptjs';

export async function getUsuarioById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'ID inválido' });
    const user = await Usuario.findById(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.status(200).json({ data: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener usuario' });
  }
}


export async function createUsuario(req, res) {
  try {
    const { usuario, clave, nombre, apellido, dni, telefono, email, rol = 'admin' } = req.body;
    if (!usuario || !clave) return res.status(400).json({ error: 'usuario y clave son requeridos' });

    const saltRounds = 10;
    const hashed = await bcrypt.hash(clave, saltRounds);

    const id = await Usuario.createUsuario({
      nombre,
      apellido,
      dni,
      telefono,
      email,
      usuario,
      clave: hashed,
      rol
    });

    return res.status(201).json({ message: 'Usuario creado', id_usuario: id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al crear usuario' });
  }
}

export async function getAllUsuarios(req, res) {
  try {
    const users = await Usuario.findAll();
    return res.status(200).json(users); 
  } catch (err) {
    console.error('getAllUsuarios error', err);
    return res.status(500).json({ error: 'Error al obtener usuarios' });
  }
}

// Nuevo: actualizar rol
export async function updateUsuarioRol(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { rol } = req.body;
    if (!id || !rol) return res.status(400).json({ error: 'ID y rol son requeridos' });

    const affected = await Usuario.updateRole(id, rol);
    if (!affected) return res.status(404).json({ error: 'Usuario no encontrado o sin cambios' });

    return res.status(200).json({ message: 'Rol actualizado' });
  } catch (err) {
    console.error('updateUsuarioRol error', err);
    return res.status(500).json({ error: 'Error al actualizar rol' });
  }
}

// Nuevo: actualizar clave (con hash)
export async function updateUsuarioClave(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    const { clave } = req.body;
    if (!id || !clave) return res.status(400).json({ error: 'ID y clave son requeridos' });

    const saltRounds = 10;
    const hashed = await bcrypt.hash(clave, saltRounds);

    const affected = await Usuario.updateClave(id, hashed);
    if (!affected) return res.status(404).json({ error: 'Usuario no encontrado o sin cambios' });

    return res.status(200).json({ message: 'Clave actualizada' });
  } catch (err) {
    console.error('updateUsuarioClave error', err);
    return res.status(500).json({ error: 'Error al actualizar clave' });
  }
}

// Nuevo: eliminar usuario
export async function deleteUsuario(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'ID inválido' });

    const affected = await Usuario.deleteById(id);
    if (!affected) return res.status(404).json({ error: 'Usuario no encontrado' });

    return res.status(200).json({ message: 'Usuario eliminado' });
  } catch (err) {
    console.error('deleteUsuario error', err);
    return res.status(500).json({ error: 'Error al eliminar usuario' });
  }
}

// Nuevo: actualizar estado
export async function updateUsuarioEstado(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    let { estado } = req.body;
    if (!id || typeof estado === 'undefined') return res.status(400).json({ error: 'ID y estado son requeridos' });

    estado = String(estado).toLowerCase();
    if (!['activo','inactivo','1','0','true','false'].includes(estado)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    const normalized = ['activo','1','true'].includes(estado) ? 'activo' : 'inactivo';

    const affected = await Usuario.updateEstado(id, normalized);
    if (!affected) return res.status(404).json({ error: 'Usuario no encontrado o sin cambios' });

    return res.status(200).json({ message: 'Estado actualizado', estado: normalized });
  } catch (err) {
    console.error('updateUsuarioEstado error', err);
    return res.status(500).json({ error: 'Error al actualizar estado' });
  }
}