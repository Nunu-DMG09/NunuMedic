import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import  pool  from "./config/db.js";
import categoriaRoutes from "./routes/categoria.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// rutas
app.use("/api/categorias", categoriaRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
