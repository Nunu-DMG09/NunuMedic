import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/db.js";
import corsMiddleware from './middleware/cors.middleware.js';

import categoriaRoutes from "./routes/categoria.route.js";
import productoRoutes from "./routes/producto.route.js";
import ventaRoutes from "./routes/venta.route.js";
import movimientoRoutes from "./routes/movimiento_stock.route.js";
import clienteRoutes from "./routes/cliente.route.js";
import usuarioRoutes from "./routes/usuario.route.js";
import authRoute from './routes/auth.route.js';
dotenv.config();

const app = express();
app.use(corsMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// health
app.get("/", (req, res) => {
  res.status(200).json({ ok: true, service: "NUNUFHARMA API" });
});

// rutas API
app.use("/api/categorias", categoriaRoutes);
app.use("/api/productos", productoRoutes);
app.use("/api/ventas", ventaRoutes);
app.use("/api/movimientos", movimientoRoutes);
app.use("/api/clientes", clienteRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use('/api/auth', authRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});