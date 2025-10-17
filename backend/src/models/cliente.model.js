import pool from '../config/db.js';

export async function findAll() {
  const [rows] = await pool.query('SELECT * FROM cliente ORDER BY nombre, apellido');
  return rows;
}

export async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM cliente WHERE id_cliente = ?', [id]);
  return rows[0];
}

export async function createCliente({ nombre, apellido, dni, telefono, direccion, email }) {
  const [result] = await pool.query(
    `INSERT INTO cliente (nombre, apellido, dni, telefono, direccion, email)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nombre, apellido, dni, telefono, direccion, email]
  );
  return result.insertId;
}