import express from 'express';
import { getUsuarioById, createUsuario, getAllUsuarios } from '../controllers/usuario.controller.js';

const router = express.Router();

router.get('/listar', getAllUsuarios);
router.get('/:id', getUsuarioById);
router.post('/', createUsuario);

export default router;