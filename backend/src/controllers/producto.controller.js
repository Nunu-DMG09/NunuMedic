import * as Movimiento from '../models/movimiento_stock.model.js';
import * as Producto from '../models/producto.model.js';
import nodemailer from 'nodemailer';

const ProductoModel = Producto;

// Helpers
function toNumberOrNull(val) {
    if (val === undefined || val === null || val === '') return null;
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
}

function normalizeFecha(fecha) {
    if (!fecha) return null; // permitir null
    const s = String(fecha).trim();
    // Formato ISO YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        // Validar fecha real
        const [y, m, d] = s.split('-').map(Number);
        const dt = new Date(Date.UTC(y, m - 1, d));
        if (dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d) return s;
        return null;
    }
    // Formato DD-MM-YYYY
    if (/^\d{2}-\d{2}-\d{4}$/.test(s)) {
        const [dd, mm, yyyy] = s.split('-').map(Number);
        const dt = new Date(Date.UTC(yyyy, mm - 1, dd));
        if (dt.getUTCFullYear() === yyyy && dt.getUTCMonth() === mm - 1 && dt.getUTCDate() === dd) {
            return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
        }
        return null;
    }
    // Formato DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
        const [dd, mm, yyyy] = s.split('/').map(Number);
        const dt = new Date(Date.UTC(yyyy, mm - 1, dd));
        if (dt.getUTCFullYear() === yyyy && dt.getUTCMonth() === mm - 1 && dt.getUTCDate() === dd) {
            return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
        }
        return null;
    }
    return null; // formato desconocido
}

export async function getAllProductos (req, res){
    try{
        const rows = await Producto.findAll();
        return res.status(200).json({data: rows});
    } catch(err) {
        console.error(err);
        return res.status(500).json({error: 'Error al obtener productos'})
    }
}

export async function getProductoById(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id) return res.status(400).json({ error: 'ID inválido' });
        const producto = await Producto.findById(id);
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
        return res.status(200).json({ data: producto });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al obtener producto' });
    }
}

export async function createProducto(req, res) {
    try {
        const {
            nombre_producto,
            descripcion,
            id_categoria,
            precio_compra,
            precio_venta,
            stock,
            stock_minimo,
            fecha_vencimiento,
        } = req.body || {};

        if (!nombre_producto || String(nombre_producto).trim() === '') {
            return res.status(400).json({ error: 'nombre_producto es requerido' });
        }

        // Coerciones y validaciones básicas
        const idCategoriaNum = toNumberOrNull(id_categoria);
        const precioCompraNum = toNumberOrNull(precio_compra);
        const precioVentaNum = toNumberOrNull(precio_venta);
        const stockNum = toNumberOrNull(stock ?? 0);
        const stockMinNum = toNumberOrNull(stock_minimo ?? 5);
        const fechaISO = normalizeFecha(fecha_vencimiento);

        if (precioCompraNum === null || precioVentaNum === null) {
            return res.status(400).json({ error: 'precio_compra y precio_venta deben ser numéricos' });
        }
        if (stockNum === null || stockMinNum === null) {
            return res.status(400).json({ error: 'stock y stock_minimo deben ser numéricos' });
        }
        if (fecha_vencimiento !== undefined && fecha_vencimiento !== null && fechaISO === null) {
            return res.status(400).json({ error: 'fecha_vencimiento inválida. Use YYYY-MM-DD o DD-MM-YYYY' });
        }

        const payload = {
            nombre_producto: String(nombre_producto).trim(),
            descripcion: descripcion ?? null,
            id_categoria: idCategoriaNum, // puede ser null si no envían categoría
            precio_compra: precioCompraNum,
            precio_venta: precioVentaNum,
            stock: stockNum,
            stock_minimo: stockMinNum,
            fecha_vencimiento: fechaISO, // YYYY-MM-DD o null
        };

        const id = await Producto.createProducto(payload);
        return res.status(201).json({ message: 'Producto creado', id_producto: id });
    } catch (err) {
        console.error(err);
        // Errores comunes de MySQL/MariaDB
        if (err && (err.code === 'ER_NO_REFERENCED_ROW' || err.code === 'ER_NO_REFERENCED_ROW_2' || /foreign key constraint/i.test(err.sqlMessage || err.message))) {
            return res.status(400).json({ error: 'La categoría especificada no existe (id_categoria inválido)' });
        }
        if (err && (err.code === 'ER_TRUNCATED_WRONG_VALUE' || err.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD' || /Incorrect (date|datetime) value/i.test(err.sqlMessage || err.message))) {
            return res.status(400).json({ error: 'Fecha inválida. Use YYYY-MM-DD o DD-MM-YYYY' });
        }
        return res.status(500).json({ error: 'Error al crear producto' });
    }
}


export async function updateProducto(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'ID inválido' });

    // obtener producto actual antes de cambios
    const existing = await Producto.findById(id);
    if (!existing) return res.status(404).json({ error: 'Producto no encontrado' });

    // campos permitidos para actualizar
    const allowed = ['nombre_producto', 'descripcion', 'id_categoria', 'precio_compra', 'precio_venta', 'stock', 'stock_minimo', 'fecha_vencimiento', 'estado'];
    const body = req.body || {};

    // Construir payload solo con campos permitidos y normalizar valores
    const payload = {};
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        const val = body[key];
        if (key === 'id_categoria') {
          payload.id_categoria = val === null || val === '' ? null : toNumberOrNull(val);
        } else if (['precio_compra', 'precio_venta'].includes(key)) {
          payload[key] = toNumberOrNull(val);
        } else if (['stock', 'stock_minimo'].includes(key)) {
          payload[key] = toNumberOrNull(val);
        } else if (key === 'fecha_vencimiento') {
          const fechaISO = normalizeFecha(val);
          if (val !== undefined && val !== null && String(val).trim() !== '' && fechaISO === null) {
            return res.status(400).json({ error: 'fecha_vencimiento inválida. Use YYYY-MM-DD o DD-MM-YYYY' });
          }
          payload.fecha_vencimiento = fechaISO;
        } else {
          // nombre_producto, descripcion, estado (permite null / string)
          payload[key] = val === '' ? null : val;
        }
      }
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    // calcular delta de stock si se envió stock en payload
    const stockBefore = Number(existing.stock ?? 0);
    const willChangeStock = Object.prototype.hasOwnProperty.call(payload, 'stock');
    const newStockVal = willChangeStock ? (payload.stock === null ? null : Number(payload.stock)) : stockBefore;
    const delta = willChangeStock && newStockVal !== null ? (newStockVal - stockBefore) : 0;

    const affected = await Producto.updateProducto(id, payload);
    if (!affected) return res.status(404).json({ error: 'Producto no encontrado o sin cambios' });

    // Si hubo cambio de stock, registrar movimiento (entrada/salida)
    if (willChangeStock && Number.isFinite(delta) && delta !== 0) {
      try {
        await Movimiento.createMovimiento({
          id_producto: id,
          tipo: delta > 0 ? 'entrada' : 'salida',
          cantidad: Math.abs(delta),
          descripcion: `Ajuste por edición de producto`
        });
      } catch (movErr) {
        console.error('Error creando movimiento por ajuste de stock', movErr);
        // no bloquear la respuesta principal
      }
    }

    return res.status(200).json({ message: 'Producto actualizado' });
  } catch (err) {
    console.error('updateProducto error', err);
    // errores comunes y respuestas más claras
    const msg = err && (err.sqlMessage || err.message) ? String(err.sqlMessage || err.message) : 'Error al actualizar producto';
    if (/foreign key constraint/i.test(msg) || err.code === 'ER_NO_REFERENCED_ROW' || err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ error: 'id_categoria inválido (categoría no existe)' });
    }
    if (/Incorrect (date|datetime) value/i.test(msg) || err.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD') {
      return res.status(400).json({ error: 'Fecha inválida. Use YYYY-MM-DD o DD-MM-YYYY' });
    }
    return res.status(500).json({ error: 'Error al actualizar producto' });
  }
}

export async function deleteProducto(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'ID inválido' });

    const affected = await Producto.deleteProducto(id);
    if (!affected) return res.status(404).json({ error: 'Producto no encontrado' });
    return res.status(200).json({ message: 'Producto eliminado' });
  } catch (err) {
    console.error('deleteProducto error', err);

    // Errores de FK (MySQL): ER_ROW_IS_REFERENCED_2 / ER_ROW_IS_REFERENCED
    if (err && (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED' || /foreign key/i.test(err.message || err.sqlMessage || ''))) {
      return res.status(400).json({
        error: 'No se puede eliminar el producto porque existen registros relacionados (ventas o movimientos). Elimina o desvincula primero las filas relacionadas en detalle_venta / movimiento_stock.'
      });
    }

    return res.status(500).json({ error: 'Error al eliminar producto' });
  }
}

export async function notifyStockMinimum(req, res) {
  try {
    const id_producto = req.body?.id_producto ?? (req.query?.id_producto ? Number(req.query.id_producto) : undefined);
    if (!id_producto) return res.status(400).json({ error: 'id_producto required' });

    // usar el modelo en vez de usar pool directamente
    const product = await Producto.findById(Number(id_producto));
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

    // SMTP config (soporta SMTP_PASSWORD o SMTP_PASS)
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD ?? process.env.SMTP_PASS;
    const smtpSecureEnv = (process.env.SMTP_SECURE === 'true');
    const secure = smtpSecureEnv || smtpPort === 465;

    if (!smtpHost) {
      console.warn('SMTP_HOST no configurado - saltando envío de correo');
      return res.json({ ok: true, warned: false, reason: 'no-smtp-host' });
    }

    const transport = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure,
      auth: smtpUser ? { user: smtpUser, pass: smtpPass } : undefined,
      tls: { rejectUnauthorized: false }
    });

    // verificar conexión SMTP y reportar error claro
    try {
      await transport.verify();
    } catch (verifyErr) {
      console.error('SMTP verify failed', verifyErr);
      return res.status(500).json({ error: 'SMTP verify failed', details: verifyErr.message ?? String(verifyErr) });
    }

    const to = process.env.ALERT_EMAIL_TO;
    if (!to) {
      console.warn('ALERT_EMAIL_TO not set - skipping email send');
      return res.json({ ok: true, warned: false, reason: 'no-alert-email' });
    }

    const subject = `Alerta: stock mínimo alcanzado - ${product.nombre_producto}`;
    const html = `
      <p>El producto <strong>${product.nombre_producto}</strong> (ID ${product.id_producto}) ha alcanzado el stock mínimo.</p>
      <ul>
        <li>Categoría: ${product.categoria_nombre ?? product.categoria?.nombre ?? '—'}</li>
        <li>Stock actual: ${product.stock}</li>
        <li>Stock mínimo: ${product.stock_minimo}</li>
      </ul>
    `;

    await transport.sendMail({
      from: process.env.SMTP_FROM || smtpUser,
      to,
      subject,
      html
    });

    return res.json({ ok: true, warned: true });
  } catch (err) {
    console.error('notifyStockMinimum error', err);
    return res.status(500).json({ error: 'Error sending notification', details: err.message ?? String(err) });
  }
}


export async function adjustStockController(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'ID inválido' });

    const { delta, descripcion } = req.body;
    const d = Number(delta);
    if (!Number.isFinite(d) || d === 0) {
      return res.status(400).json({ error: 'delta inválido (debe ser número distinto de 0)' });
    }

    // comprobar existencia del producto
    const producto = await Producto.findById(id);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    // aplicar ajuste
    const affected = await Producto.adjustStock(id, d);
    if (!affected) return res.status(404).json({ error: 'No se pudo ajustar stock' });

    // crear movimiento de stock correspondiente
    try {
      const movimientoId = await Movimiento.createMovimiento({
        id_producto: id,
        tipo: d > 0 ? 'entrada' : 'salida',
        cantidad: Math.abs(d),
        descripcion: descripcion ?? `Ajuste manual de stock (delta: ${d})`
      });
      return res.status(200).json({ message: 'Stock ajustado', id_movimiento: movimientoId });
    } catch (movErr) {
      console.error('Error creando movimiento tras ajuste', movErr);
      return res.status(200).json({ message: 'Stock ajustado (movimiento no registrado)' });
    }
  } catch (err) {
    console.error('adjustStockController error', err);
    return res.status(500).json({ error: 'Error al ajustar stock' });
  }
}

// Buscar por nombre de producto (segmento URL: /api/productos/buscar/:q)
export async function searchByNameController(req, res) {
  try {
    const raw = String(req.params.q || '').trim();
    if (!raw) return res.status(400).json({ error: 'Término de búsqueda requerido' });

    // decodificar por si viene con %20
    const term = decodeURIComponent(raw);
    console.log('[searchByNameController] term:', term);

    const rows = await ProductoModel.findByName(term);
    console.log('[searchByNameController] found:', Array.isArray(rows) ? rows.length : 0);

    // devolver resultado con conteo para debug
    return res.status(200).json({ term, count: Array.isArray(rows) ? rows.length : 0, data: rows });
  } catch (err) {
    console.error('searchByNameController error', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: 'Error al buscar productos por nombre' });
  }
}

// Buscar por nombre de categoría (segmento URL: /api/productos/categoria/:name)
export async function productosByCategoriaNameController(req, res) {
  try {
    const name = String(req.params.name || '').trim();
    if (!name) return res.status(400).json({ error: 'Nombre de categoría requerido' });
    const rows = await ProductoModel.findByCategoriaName(name);
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.error('productosByCategoriaNameController error', err);
    return res.status(500).json({ error: 'Error al obtener productos por categoría' });
  }
}

// Productos por estado (puede aceptar ?page= y ?perPage= para paginar)
export async function productosByEstadoController(req, res) {
  try {
    const estado = String(req.params.estado || '').trim();
    if (!estado) return res.status(400).json({ error: 'Estado inválido' });

    const page = Number(req.query.page || 0);
    const perPage = Number(req.query.perPage || 10);

    if (page > 0) {
      const result = await ProductoModel.findPaginated({ page, perPage, estado });
      return res.status(200).json(result);
    } else {
      const rows = await ProductoModel.findByEstado(estado);
      return res.status(200).json({ data: rows });
    }
  } catch (err) {
    console.error('productosByEstadoController error', err);
    return res.status(500).json({ error: 'Error al obtener productos por estado' });
  }
}

// Paginación general: /api/productos/paginar?page=1 (perPage opcional, por defecto 10)
export async function paginarProductosController(req, res) {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const perPage = Number(req.query.perPage || 10);
    const search = req.query.search ?? null;
    const categoria = req.query.categoria ?? null;
    const estado = req.query.estado ?? null;
    const minStock = req.query.minStock ?? null;
    const maxStock = req.query.maxStock ?? null;

    const result = await ProductoModel.findPaginated({ page, perPage, search, categoria, estado, minStock, maxStock });
    return res.status(200).json(result);
  } catch (err) {
    console.error('paginarProductosController error', err);
    return res.status(500).json({ error: 'Error en paginación de productos' });
  }
}



