import express from 'express';
import { getUsuarioById, createUsuario, getAllUsuarios, updateUsuarioRol, updateUsuarioClave, deleteUsuario, updateUsuarioEstado } from '../controllers/usuario.controller.js';

const router = express.Router();

router.get('/listar', getAllUsuarios);
router.post('/', createUsuario);

// rutas para actualizar rol, clave, estado y eliminar
router.put('/:id/rol', updateUsuarioRol);
router.put('/:id/clave', updateUsuarioClave);
router.put('/:id/estado', updateUsuarioEstado);
router.delete('/:id', deleteUsuario);

router.get('/:id', getUsuarioById);

export default router;