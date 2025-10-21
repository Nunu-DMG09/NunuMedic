import express from 'express';
import { getAllClientes, getClienteById, createCliente } from '../controllers/cliente.controller.js';

const router = express.Router();

router.get('/', getAllClientes);
router.get('/:id', getClienteById);
router.post('/create', createCliente);

export default router;