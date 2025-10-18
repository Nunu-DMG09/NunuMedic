import pool from '../config/db.js';

export async function findAll() {
  const [rows] = await pool.query(
    `SELECT p.*, c.nombre_categoria AS categoria_nombre
     FROM producto p
     LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
     ORDER BY p.id_producto DESC`
  );

  // añadir objeto categoria para cada fila
  return rows.map(r => ({
    ...r,
    categoria_nombre: r.categoria_nombre ?? null,
    categoria: r.id_categoria != null
      ? { id_categoria: r.id_categoria, nombre: r.categoria_nombre ?? null }
      : null
  }));
}

export async function findById(id) {
  const [rows] = await pool.query(
    `SELECT p.*, c.nombre_categoria AS categoria_nombre
     FROM producto p
     LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
     WHERE p.id_producto = ?`,
    [id]
  );
  const row = rows[0];
  if (!row) return null;

  return {
    ...row,
    categoria_nombre: row.categoria_nombre ?? null,
    categoria: row.id_categoria != null ? { id_categoria: row.id_categoria, nombre: row.categoria_nombre ?? null } : null
  };
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