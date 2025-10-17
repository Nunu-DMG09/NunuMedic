import pool from '../config/db.js';

export async function findAll() {
  const [rows] = await pool.query('SELECT * FROM producto ORDER BY nombre_producto');
  return rows;
}

export async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM producto WHERE id_producto = ?', [id]);
  return rows[0];
}

export async function createProducto(data) {
  const { nombre_producto, descripcion, id_categoria, precio_compra, precio_venta, stock, stock_minimo, fecha_vencimiento } = data;
  const [result] = await pool.query(
    `INSERT INTO producto (nombre_producto, descripcion, id_categoria, precio_compra, precio_venta, stock, stock_minimo, fecha_vencimiento)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [nombre_producto, descripcion, id_categoria, precio_compra, precio_venta, stock ?? 0, stock_minimo ?? 5, fecha_vencimiento ?? null]
  );
  return result.insertId;
}

export async function updateProducto(id, data) {
  const fields = [];
  const values = [];
  for (const [k, v] of Object.entries(data)) {
    fields.push(`${k} = ?`);
    values.push(v);
  }
  if (!fields.length) return 0;
  values.push(id);
  const [result] = await pool.query(`UPDATE producto SET ${fields.join(', ')} WHERE id_producto = ?`, values);
  return result.affectedRows;
}

export async function deleteProducto(id) {
  const [result] = await pool.query('DELETE FROM producto WHERE id_producto = ?', [id]);
  return result.affectedRows;
}

/**
 * Ajusta el stock del producto (delta puede ser positivo o negativo)
 * Devuelve affectedRows
 */
export async function adjustStock(id_producto, delta) {
  const [result] = await pool.query('UPDATE producto SET stock = GREATEST(0, stock + ?) WHERE id_producto = ?', [delta, id_producto]);
  return result.affectedRows;
}