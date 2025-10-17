import * as Producto from '../models/producto.model';

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
        const { nombre_producto } = req.body;
        if (!nombre_producto) return res.status(400).json({ error: 'nombre_producto es requerido' });

        const id = await Producto.createProducto(req.body);
        return res.status(201).json({ message: 'Producto creado', id_producto: id });
    } catch (err) {
        console.error(err);
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

