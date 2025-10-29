import * as Cliente from '../models/cliente.model.js';

export async function getAllClientes(req, res) {
  try {
    const rows = await Cliente.findAll();
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.error('Error en getAllClientes:', err);
    return res.status(500).json({ error: 'Error al obtener clientes', details: err.message });
  }
}

export async function getClienteById(req, res) {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id || isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
    
    const row = await Cliente.findById(id);
    if (!row) return res.status(404).json({ error: 'Cliente no encontrado' });
    
    return res.status(200).json({ data: row });
  } catch (err) {
    console.error('Error en getClienteById:', err);
    return res.status(500).json({ error: 'Error al obtener cliente', details: err.message });
  }
}

export async function createCliente(req, res) {
  try {
    const { nombre, apellido, dni } = req.body;
    
    // Validaciones
    if (!nombre || !apellido) {
      return res.status(400).json({ error: 'Nombre y apellido son requeridos' });
    }
    
    if (!dni) {
      return res.status(400).json({ error: 'DNI es requerido' });
    }

    // Verificar si ya existe un cliente con ese DNI
    try {
      const existingCliente = await Cliente.findByDni(dni);
      if (existingCliente) {
        return res.status(409).json({ 
          error: 'Ya existe un cliente con ese DNI',
          data: existingCliente 
        });
      }
    } catch (findError) {
      console.log('No se pudo verificar DNI existente:', findError.message);
    }

    // Crear cliente
    const id = await Cliente.createCliente(req.body);
    
    // Obtener el cliente creado
    const clienteCreado = await Cliente.findById(id);
    
    return res.status(201).json({ 
      message: 'Cliente creado exitosamente', 
      data: clienteCreado,
      id_cliente: id 
    });
    
  } catch (err) {
    console.error('Error en createCliente:', err);
    return res.status(500).json({ 
      error: 'Error al crear cliente', 
      details: err.message,
      code: err.code 
    });
  }
}