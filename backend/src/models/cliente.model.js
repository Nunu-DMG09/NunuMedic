import pool from '../config/db.js';

export async function findAll() {
  try {
    const [rows] = await pool.query('SELECT * FROM cliente ORDER BY nombre, apellido');
    return rows;
  } catch (error) {
    console.error('Error en findAll clientes:', error);
    throw error;
  }
}

export async function findById(id) {
  try {
    const [rows] = await pool.query('SELECT * FROM cliente WHERE id_cliente = ?', [id]);
    return rows[0];
  } catch (error) {
    console.error('Error en findById cliente:', error);
    throw error;
  }
}

export async function findByDni(dni) {
  try {
    const [rows] = await pool.query('SELECT * FROM cliente WHERE dni = ?', [dni]);
    return rows[0];
  } catch (error) {
    console.error('Error en findByDni cliente:', error);
    throw error;
  }
}

export async function createCliente({ nombre, apellido, dni, telefono = null, direccion = null, email = null }) {
  try {
    const [result] = await pool.query(
      `INSERT INTO cliente (nombre, apellido, dni, telefono, direccion, email)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, dni, telefono, direccion, email]
    );
    return result.insertId;
  } catch (error) {
    console.error('Error en createCliente:', error);
    throw error;
  }
}