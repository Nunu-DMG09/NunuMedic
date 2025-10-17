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