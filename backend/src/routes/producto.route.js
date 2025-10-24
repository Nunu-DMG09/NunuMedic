import express from 'express';
import {
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  notifyStockMinimum,
  adjustStockController,
  searchByNameController,
  productosByCategoriaNameController,
  productosByEstadoController,
  paginarProductosController
} from '../controllers/producto.controller.js';

const router = express.Router();

// Rutas públicas / estáticas primero
router.get('/listar', getAllProductos);

// Buscar por nombre de producto (segmento URL): /api/productos/buscar/:q
router.get('/buscar/:q', searchByNameController);

// Buscar por nombre de categoría (segmento URL): /api/productos/categoria/:name
router.get('/categoria/:name', productosByCategoriaNameController);

// Buscar por estado (mantener): /api/productos/estado/:estado  (acepta ?page= para paginar)
router.get('/estado/:estado', productosByEstadoController);

// Paginación general 10 en 10: /api/productos/paginar?page=1
router.get('/paginar', paginarProductosController);

// Rutas CRUD y utilidades (dinámicas al final para evitar conflictos con rutas estáticas)
router.get('/:id', getProductoById);
router.post('/create', createProducto);
router.put('/:id', updateProducto);
router.delete('/:id', deleteProducto);
router.post('/notificacion', notifyStockMinimum);
router.post('/:id/ajustar-stock', adjustStockController);

export default router;