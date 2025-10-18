import * as Producto from '../models/producto.model.js';

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

