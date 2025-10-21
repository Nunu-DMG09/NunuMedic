import express from 'express';
import {
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto,
  notifyStockMinimum,
  adjustStockController
} from '../controllers/producto.controller.js';

const router = express.Router();

router.get('/listar', getAllProductos);
router.get('/:id', getProductoById);
router.post('/create', createProducto);
router.put('/:id', updateProducto);
router.delete('/:id', deleteProducto);
router.post('/notificacion', notifyStockMinimum);
router.post('/:id/ajustar-stock', adjustStockController);

export default router;