import * as Usuario from '../models/usuario.model.js';

export async function getUsuarioById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'ID inválido' });
    const user = await Usuario.findById(id);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.status(200).json({ data: user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener usuario' });
  }
}


export async function createUsuario(req, res) {
  try {
    const { usuario, clave } = req.body;
    if (!usuario || !clave) return res.status(400).json({ error: 'usuario y clave son requeridos' });
    const id = await Usuario.createUsuario(req.body);
    return res.status(201).json({ message: 'Usuario creado', id_usuario: id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al crear usuario' });
  }
}

export async function getAllUsuarios(req, res) {
  try {
    const users = await Usuario.findAll();
    return res.status(200).json(users); 
  } catch (err) {
    console.error('getAllUsuarios error', err);
    return res.status(500).json({ error: 'Error al obtener usuarios' });
  }
}