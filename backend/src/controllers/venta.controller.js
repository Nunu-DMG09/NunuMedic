import * as Venta from '../models/venta.model.js';

export async function createVenta(req, res) {
  try {
    const { total, items, id_cliente = null, id_usuario = null, metodo_pago = null } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items es requerido y debe ser un array no vacío' });
    }
    if (typeof total !== 'number' && typeof total !== 'string') {
      return res.status(400).json({ error: 'total inválido' });
    }

    const result = await Venta.createVenta({ id_usuario, id_cliente, total: Number(total), metodo_pago, items });
    return res.status(201).json({ message: 'Venta creada', id_venta: result.id_venta });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al crear venta' });
  }
}

export async function getVentaById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'ID inválido' });
    const venta = await Venta.findById(id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    return res.status(200).json({ data: venta });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener venta' });
  }
}