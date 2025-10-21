import express from 'express';
import { createVenta, getVentaById, getAllVentas } from '../controllers/venta.controller.js';

const router = express.Router();

router.post('/create', createVenta);
router.get('/:id', getVentaById);
router.get('/', getAllVentas);


export default router;