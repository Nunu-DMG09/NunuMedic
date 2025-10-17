import pool from '../config/db.js';

export async function findAll() {
  const [rows] = await pool.query('SELECT * FROM categoria ORDER BY nombre_categoria');
  return rows;
}

export async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM categoria WHERE id_categoria = ?', [id]);
  return rows[0];
}

export async function createCategoria({ nombre_categoria, descripcion }) {
  const [result] = await pool.query(
    'INSERT INTO categoria (nombre_categoria, descripcion) VALUES (?, ?)',
    [nombre_categoria, descripcion]
  );
  return result.insertId;
}

export async function updateCategoria(id, { nombre_categoria, descripcion }) {
  const [result] = await pool.query(
    'UPDATE categoria SET nombre_categoria = ?, descripcion = ? WHERE id_categoria = ?',
    [nombre_categoria, descripcion, id]
  );
  return result.affectedRows;
}

export async function deleteCategoria(id) {
  const [result] = await pool.query('DELETE FROM categoria WHERE id_categoria = ?', [id]);
  return result.affectedRows;
}