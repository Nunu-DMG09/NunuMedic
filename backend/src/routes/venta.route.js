import express from 'express';
import { createVenta, getVentaById } from '../controllers/venta.controller.js';

const router = express.Router();

router.post('/', createVenta);
router.get('/:id', getVentaById);

export default router;