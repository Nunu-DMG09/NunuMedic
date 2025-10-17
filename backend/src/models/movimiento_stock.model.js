import pool from '../config/db.js';

export async function createMovimiento({ id_producto, tipo, cantidad, descripcion }) {
  const [result] = await pool.query(
    `INSERT INTO movimiento_stock (id_producto, tipo, cantidad, descripcion)
     VALUES (?, ?, ?, ?)`,
    [id_producto, tipo, cantidad, descripcion ?? null]
  );
  return result.insertId;
}

export async function findByProducto(id_producto) {
  const [rows] = await pool.query('SELECT * FROM movimiento_stock WHERE id_producto = ? ORDER BY fecha_movimiento DESC', [id_producto]);
  return rows;
}