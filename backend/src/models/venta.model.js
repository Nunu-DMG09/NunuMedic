import pool from '../config/db.js';

export async function createVenta({ id_usuario = null, id_cliente = null, total, metodo_pago = null, items = [] }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [ventaRes] = await conn.query(
      `INSERT INTO venta (id_usuario, id_cliente, total, metodo_pago) VALUES (?, ?, ?, ?)`,
      [id_usuario, id_cliente, total, metodo_pago]
    );
    const id_venta = ventaRes.insertId;

  
    for (const it of items) {
      const { id_producto, cantidad, precio_unitario } = it;
      await conn.query(
        `INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)`,
        [id_venta, id_producto, cantidad, precio_unitario]
      );

     
      await conn.query(
        `UPDATE producto SET stock = GREATEST(0, stock - ?) WHERE id_producto = ?`,
        [cantidad, id_producto]
      );

     
      await conn.query(
        `INSERT INTO movimiento_stock (id_producto, tipo, cantidad, descripcion) VALUES (?, 'salida', ?, ?)`,
        [id_producto, cantidad, `Venta #${id_venta}`]
      );
    }

    await conn.commit();
    return { id_venta };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function findById(id_venta) {
  const [rows] = await pool.query('SELECT * FROM venta WHERE id_venta = ?', [id_venta]);
  if (!rows.length) return null;
  const venta = rows[0];
  const [items] = await pool.query('SELECT * FROM detalle_venta WHERE id_venta = ?', [id_venta]);
  venta.items = items;
  return venta;
}

export async function findAll() {
 
  const [cols] = await pool.query(
    'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
    [process.env.DB_NAME, 'venta']
  );
  const colNames = cols.map(c => c.COLUMN_NAME);
  const dateCol = colNames.includes('fecha') ? 'fecha'
    : colNames.includes('created_at') ? 'created_at'
    : colNames.includes('fecha_venta') ? 'fecha_venta'
    : null;

  let sql;
  if (dateCol) {
    sql = `
      SELECT v.*, DATE_FORMAT(v.${dateCol}, '%Y-%m-%d %H:%i:%s') AS fecha_formateada,
             c.nombre AS cliente_nombre, c.apellido AS cliente_apellido
      FROM venta v
      LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
      ORDER BY v.${dateCol} DESC
    `;
  } else {
    sql = `
      SELECT v.*, c.nombre AS cliente_nombre, c.apellido AS cliente_apellido
      FROM venta v
      LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
      ORDER BY v.id_venta DESC
    `;
  }

  const [ventas] = await pool.query(sql);

  for (const venta of ventas) {
    const [items] = await pool.query(
      `SELECT dv.*, p.nombre_producto
       FROM detalle_venta dv
       LEFT JOIN producto p ON dv.id_producto = p.id_producto
       WHERE dv.id_venta = ?`,
      [venta.id_venta]
    );
    venta.items = items;
    if (dateCol) {
      venta.fecha = venta.fecha_formateada || venta[dateCol] || null;
      delete venta.fecha_formateada;
    }
  }

  return ventas;
}