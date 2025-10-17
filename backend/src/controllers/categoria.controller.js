import * as Categoria from '../models/categoria.model.js';

export async function getAllCategorias(req, res) {
    try {
        const rows = await Categoria.findAll();
        return res.status(200).json({ data: rows });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al obtener categorias' });
    }
}

export async function getCategoriaById(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id) return res.status(400).json({ error: 'ID inválido' });
        const row = await Categoria.findById(id);
        if (!row) return res.status(404).json({ error: 'Categoría no encontrada' });
        return res.status(200).json({ data: row });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al obtener categoría' });
    }
}

export async function createCategoria(req, res) {
    try {
        const { nombre_categoria } = req.body;
        if (!nombre_categoria) return res.status(400).json({ error: 'nombre_categoria es requerido' });

        const id = await Categoria.createCategoria(req.body);
        return res.status(201).json({ message: 'Categoría creada', id_categoria: id });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al crear categoría' });
    }
}

export async function updateCategoria(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id) return res.status(400).json({ error: 'ID inválido' });

        const affected = await Categoria.updateCategoria(id, req.body);
        if (!affected) return res.status(404).json({ error: 'Categoría no encontrada o sin cambios' });
        return res.status(200).json({ message: 'Categoría actualizada' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al actualizar categoría' });
    }
}

export async function deleteCategoria(req, res) {
    try {
        const id = parseInt(req.params.id, 10);
        if (!id) return res.status(400).json({ error: 'ID inválido' });

        const affected = await Categoria.deleteCategoria(id);
        if (!affected) return res.status(404).json({ error: 'Categoría no encontrada' });
        return res.status(200).json({ message: 'Categoría eliminada' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error al eliminar categoría' });
    }
}