import { pool } from "../config/db.js";

export const getCategorias = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categoria");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener categorías" });
  }
};

export const addCategoria = async (req, res) => {
  try {
    const { nombre_categoria, descripcion } = req.body;
    const [result] = await pool.query(
      "INSERT INTO categoria (nombre_categoria, descripcion) VALUES (?, ?)",
      [nombre_categoria, descripcion]
    );
    res.status(201).json({ id: result.insertId, nombre_categoria, descripcion });
  } catch (error) {
    res.status(500).json({ message: "Error al agregar categoría" });
  }
};
