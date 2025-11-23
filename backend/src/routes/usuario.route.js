import express from 'express';
import { getUsuarioById, createUsuario, getAllUsuarios, updateUsuarioRol, updateUsuarioClave, deleteUsuario, updateUsuarioEstado } from '../controllers/usuario.controller.js';
import { requirePermission } from '../filters/permissions.js';
import { PERMISSIONS } from '../filters/permissions.js';

const router = express.Router();

router.get('/listar', getAllUsuarios);
router.post('/', createUsuario);

// rutas para actualizar rol, clave, estado y eliminar
router.put('/:id/rol', updateUsuarioRol);
router.put('/:id/clave', updateUsuarioClave);
router.put('/:id/estado', updateUsuarioEstado);
router.delete('/:id', requirePermission(PERMISSIONS.USERS_MANAGE), deleteUsuario);

router.get('/:id', getUsuarioById);

// proteger rutas de usuarios: solo super_admin puede gestionarlas
router.use('/', requirePermission(PERMISSIONS.USERS_PANEL));

export default router;