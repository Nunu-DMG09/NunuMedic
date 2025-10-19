import * as Producto from '../models/producto.model.js';
import nodemailer from 'nodemailer';

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

        const affected = await Producto.updateProducto(id, req.body);
        if (!affected) return res.status(404).json({ error: 'Producto no encontrado o sin cambios' });
        return res.status(200).json({ message: 'Producto actualizado' });
    } catch (err) {
        console.error(err);
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
        console.error(err);
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

