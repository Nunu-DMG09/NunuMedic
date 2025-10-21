import express from 'express';
import { createVenta, getVentaById, getAllVentas } from '../controllers/venta.controller.js';

const router = express.Router();

router.post('/create', createVenta);
router.get('/listar', getAllVentas);
router.get('/:id', getVentaById);



export default router;