import express from 'express';
import { getUsuarioById, createUsuario } from '../controllers/usuario.controller.js';

const router = express.Router();

router.get('/:id', getUsuarioById);
router.post('/', createUsuario);

export default router;