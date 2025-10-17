import express from 'express';
import {
  getAllProductos,
  getProductoById,
  createProducto,
  updateProducto,
  deleteProducto
} from '../controllers/producto.controller.js';

const router = express.Router();

router.get('/listar', getAllProductos);
router.get('/:id', getProductoById);
router.post('/create', createProducto);
router.put('/:id', updateProducto);
router.delete('/:id', deleteProducto);

export default router;