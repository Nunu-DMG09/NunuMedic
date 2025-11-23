import pool from '../config/db.js';

export async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM usuario WHERE id_usuario = ?', [id]);
  return rows[0];
}

export async function findByUsername(usuario) {
  const [rows] = await pool.query('SELECT * FROM usuario WHERE usuario = ?', [usuario]);
  return rows[0];
}

export async function createUsuario({ nombre, apellido, dni, telefono, email, usuario, clave, rol = 'admin' }) {
 
  const [result] = await pool.query(
    `INSERT INTO usuario (nombre, apellido, dni, telefono, email, usuario, clave, rol)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombre, apellido, dni, telefono, email, usuario, clave, rol]
  );
  return result.insertId;
}

// Nuevas funciones
export async function findAll() {
  const [rows] = await pool.query('SELECT id_usuario, nombre, apellido, dni, telefono, email, usuario, rol, estado FROM usuario ORDER BY id_usuario ASC');
  return rows;
}

export async function findByRole(rol) {
  const [rows] = await pool.query('SELECT id_usuario, nombre, apellido, dni, telefono, email, usuario, rol, estado FROM usuario WHERE rol = ? ORDER BY id_usuario ASC', [rol]);
  return rows;
}

export async function findByRoles(roles = []) {
  if (!Array.isArray(roles) || roles.length === 0) return [];
  const placeholders = roles.map(() => '?').join(',');
  const [rows] = await pool.query(`SELECT id_usuario, nombre, apellido, dni, telefono, email, usuario, rol, estado FROM usuario WHERE rol IN (${placeholders}) ORDER BY id_usuario ASC`, roles);
  return rows;
}

// Nuevas funciones para actualizar rol, clave y eliminar usuario
export async function updateRole(id, rol) {
  const [result] = await pool.query('UPDATE usuario SET rol = ? WHERE id_usuario = ?', [rol, id]);
  return result.affectedRows;
}

export async function updateClave(id, hashedClave) {
  const [result] = await pool.query('UPDATE usuario SET clave = ? WHERE id_usuario = ?', [hashedClave, id]);
  return result.affectedRows;
}

export async function updateEstado(id, estado) {
  const [result] = await pool.query('UPDATE usuario SET estado = ? WHERE id_usuario = ?', [estado, id]);
  return result.affectedRows;
}

export async function deleteById(id) {
  const [result] = await pool.query('DELETE FROM usuario WHERE id_usuario = ?', [id]);
  return result.affectedRows;
}