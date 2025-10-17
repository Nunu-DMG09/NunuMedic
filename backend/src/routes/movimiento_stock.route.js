import express from 'express';
import { createMovimiento, getMovimientosByProducto } from '../controllers/movimiento_stock.controller.js';

const router = express.Router();

router.post('/', createMovimiento);
router.get('/producto/:id', getMovimientosByProducto);

export default router;