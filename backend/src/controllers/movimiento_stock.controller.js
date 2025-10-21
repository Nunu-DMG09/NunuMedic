import * as Movimiento from '../models/movimiento_stock.model.js';
import * as Producto from '../models/producto.model.js';

export async function createMovimiento(req, res) {
  try {
    const { id_producto, tipo, cantidad, descripcion } = req.body;
    if (!id_producto || !tipo || !cantidad) return res.status(400).json({ error: 'id_producto, tipo y cantidad son requeridos' });
    // tipo: 'entrada' | 'salida'
    const id = await Movimiento.createMovimiento({ id_producto, tipo, cantidad, descripcion });
    // ajustar stock en producto (entrada suma, salida resta)
    const delta = tipo === 'entrada' ? Number(cantidad) : -Math.abs(Number(cantidad));
    await Producto.adjustStock(id_producto, delta);
    return res.status(201).json({ message: 'Movimiento registrado', id_movimiento: id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al crear movimiento' });
  }
}

export async function getMovimientosByProducto(req, res) {
  try {
    const id_producto = parseInt(req.params.id, 10);
    if (!id_producto) return res.status(400).json({ error: 'ID inválido' });
    const rows = await Movimiento.findByProducto(id_producto);
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener movimientos' });
  }
}

export async function getAllMovimientos(req, res) {
  try {
    const rows = await Movimiento.findAll();
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.error('getAllMovimientos error', err);
    return res.status(500).json({ error: 'Error al obtener movimientos' });
  }
}