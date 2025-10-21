import express from 'express';
import { createMovimiento, getAllMovimientos, getMovimientosByProducto } from '../controllers/movimiento_stock.controller.js';

const router = express.Router();

router.post('/', createMovimiento);
router.get('/listar', getAllMovimientos);
router.get('/producto/:id', getMovimientosByProducto);

export default router;