import * as Cliente from '../models/cliente.model.js';

export async function getAllClientes(req, res) {
  try {
    const rows = await Cliente.findAll();
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener clientes' });
  }
}

export async function getClienteById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'ID inválido' });
    const row = await Cliente.findById(id);
    if (!row) return res.status(404).json({ error: 'Cliente no encontrado' });
    return res.status(200).json({ data: row });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener cliente' });
  }
}

export async function createCliente(req, res) {
  try {
    const { nombre, apellido } = req.body;
    if (!nombre || !apellido) return res.status(400).json({ error: 'nombre y apellido son requeridos' });
    const id = await Cliente.createCliente(req.body);
    return res.status(201).json({ message: 'Cliente creado', id_cliente: id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al crear cliente' });
  }
}import * as Cliente from '../models/cliente.model.js';

export async function getAllClientes(req, res) {
  try {
    const rows = await Cliente.findAll();
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener clientes' });
  }
}

export async function getClienteById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'ID inválido' });
    const row = await Cliente.findById(id);
    if (!row) return res.status(404).json({ error: 'Cliente no encontrado' });
    return res.status(200).json({ data: row });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al obtener cliente' });
  }
}

export async function createCliente(req, res) {
  try {
    const { nombre, apellido } = req.body;
    if (!nombre || !apellido) return res.status(400).json({ error: 'nombre y apellido son requeridos' });
    const id = await Cliente.createCliente(req.body);
    return res.status(201).json({ message: 'Cliente creado', id_cliente: id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error al crear cliente' });
  }
}