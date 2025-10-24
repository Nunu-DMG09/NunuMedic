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

export async function findByName(term) {
  const q = `%${String(term ?? '').trim().toLowerCase()}%`;
  const sql = `
    SELECT p.*, c.nombre_categoria AS categoria_nombre
    FROM producto p
    LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
    WHERE LOWER(p.nombre_producto) LIKE ?
    ORDER BY p.id_producto DESC
  `;
  try {
    console.log('[producto.model.findByName] sql:', sql.replace(/\s+/g,' '), 'params:', [q]);
    const [rows] = await pool.query(sql, [q]);
    console.log('[producto.model.findByName] rows:', Array.isArray(rows) ? rows.length : String(rows));
    return rows.map(r => ({
      ...r,
      categoria_nombre: r.categoria_nombre ?? null,
      categoria: r.id_categoria != null ? { id_categoria: r.id_categoria, nombre: r.categoria_nombre ?? null } : null
    }));
  } catch (err) {
    console.error('findByName SQL error', { sql, params: [q], err: err.message ?? err });
    throw err;
  }
}

export async function findByCategoriaName(catName) {
  const q = `%${String(catName ?? '').trim().toLowerCase()}%`;
  const [rows] = await pool.query(
    `SELECT p.*, c.nombre_categoria AS categoria_nombre
     FROM producto p
     JOIN categoria c ON p.id_categoria = c.id_categoria
     WHERE LOWER(c.nombre_categoria) LIKE ?
     ORDER BY p.id_producto DESC`,
    [q]
  );
  return rows.map(r => ({
    ...r,
    categoria_nombre: r.categoria_nombre ?? null,
    categoria: r.id_categoria != null ? { id_categoria: r.id_categoria, nombre: r.categoria_nombre ?? null } : null
  }));
}

export async function findByEstado(estado) {
  const [rows] = await pool.query(
    `SELECT p.*, c.nombre_categoria AS categoria_nombre
     FROM producto p
     LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
     WHERE p.estado = ?
     ORDER BY p.id_producto DESC`,
    [estado]
  );
  return rows.map(r => ({
    ...r,
    categoria_nombre: r.categoria_nombre ?? null,
    categoria: r.id_categoria != null ? { id_categoria: r.id_categoria, nombre: r.categoria_nombre ?? null } : null
  }));
}

export async function findPaginated({ page = 1, perPage = 10, search = null, categoria = null, estado = null, minStock = null, maxStock = null } = {}) {
  const where = [];
  const params = [];

  if (search) {
    where.push('(LOWER(p.nombre_producto) LIKE ? OR LOWER(p.descripcion) LIKE ?)');
    const q = `%${String(search).trim().toLowerCase()}%`;
    params.push(q, q);
  }
  if (categoria) {
    // acepta id o nombre (si es numérico se usa id, sino nombre LIKE)
    if (!isNaN(Number(categoria))) {
      where.push('p.id_categoria = ?');
      params.push(Number(categoria));
    } else {
      where.push('LOWER(c.nombre_categoria) LIKE ?');
      params.push(`%${String(categoria).trim().toLowerCase()}%`);
    }
  }
  if (estado) {
    where.push('p.estado = ?');
    params.push(estado);
  }
  if (minStock !== null && minStock !== undefined && minStock !== '') {
    where.push('p.stock >= ?');
    params.push(Number(minStock));
  }
  if (maxStock !== null && maxStock !== undefined && maxStock !== '') {
    where.push('p.stock <= ?');
    params.push(Number(maxStock));
  }

  const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM producto p
     LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
     ${whereSql}`,
    params
  );
  const total = Number(countRows[0]?.total ?? 0);

  const limit = Number(perPage) || 10;
  const pageNum = Math.max(1, Number(page) || 1);
  const offset = (pageNum - 1) * limit;

  const sql = `
    SELECT p.*, c.nombre_categoria AS categoria_nombre
    FROM producto p
    LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
    ${whereSql}
    ORDER BY p.id_producto DESC
    LIMIT ? OFFSET ?
  `;
  const execParams = [...params, limit, offset];
  const [rows] = await pool.query(sql, execParams);

  const items = rows.map(r => ({
    ...r,
    categoria_nombre: r.categoria_nombre ?? null,
    categoria: r.id_categoria != null ? { id_categoria: r.id_categoria, nombre: r.categoria_nombre ?? null } : null
  }));

  return { items, total, page: pageNum, perPage: limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}