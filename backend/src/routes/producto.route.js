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


router.get('/listar', getAllProductos);
router.get('/buscar/:q', searchByNameController);
router.get('/categoria/:name', productosByCategoriaNameController);
router.get('/estado/:estado', productosByEstadoController);
router.get('/paginar', paginarProductosController);
router.get('/:id', getProductoById);
router.post('/create', createProducto);
router.put('/:id', updateProducto);
router.delete('/:id', deleteProducto);
router.post('/notificacion', notifyStockMinimum);
router.post('/:id/ajustar-stock', adjustStockController);

export default router;