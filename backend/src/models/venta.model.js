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

    // insertar detalle_venta y ajustar stock por cada item
    for (const it of items) {
      const { id_producto, cantidad, precio_unitario } = it;
      await conn.query(
        `INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)`,
        [id_venta, id_producto, cantidad, precio_unitario]
      );

      // actualizar stock (resta)
      await conn.query(
        `UPDATE producto SET stock = GREATEST(0, stock - ?) WHERE id_producto = ?`,
        [cantidad, id_producto]
      );

      // registrar movimiento_stock tipo 'salida'
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