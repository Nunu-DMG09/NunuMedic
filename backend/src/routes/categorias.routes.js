import express from "express";
import { getCategorias, addCategoria } from "../controllers/categoria.controller.js";

const router = express.Router();

router.get("/", getCategorias);
router.post("/", addCategoria);

export default router;
