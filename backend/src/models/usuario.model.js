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
  // la 'clave' debe llegar ya hasheada desde el controlador
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