import express from 'express';
import { getUsuarioById, createUsuario, getAllUsuarios, updateUsuarioRol, updateUsuarioClave, deleteUsuario } from '../controllers/usuario.controller.js';

const router = express.Router();

router.get('/listar', getAllUsuarios);
router.post('/', createUsuario);

// rutas para actualizar rol, clave y eliminar
router.put('/:id/rol', updateUsuarioRol);
router.put('/:id/clave', updateUsuarioClave);
router.delete('/:id', deleteUsuario);

router.get('/:id', getUsuarioById);

export default router;