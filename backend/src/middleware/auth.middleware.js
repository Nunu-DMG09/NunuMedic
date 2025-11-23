import pool from '../config/db.js';
import { verifyJWT } from '../services/jwt.service.js';

export default async function authMiddleware(req, res, next) {
  try {
    const token =
      req.cookies?.access_token ||
      (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) {
      return res.status(401).json({ error: 'No autorizado: token ausente' });
    }

    let decoded;
    try {
      decoded = verifyJWT(token);
    } catch (e) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const data = decoded?.data || decoded;
    if (!data?.id) return res.status(401).json({ error: 'Token inválido: datos incompletos' });

    const [rows] = await pool.query('SELECT id_usuario, nombre, apellido, usuario, rol, estado FROM usuario WHERE id_usuario = ? LIMIT 1', [data.id]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Usuario no encontrado' });

    const estado = (user.estado || '').toString().toLowerCase();
    if (!['activo', '1', 'true'].includes(estado)) {
      return res.status(403).json({ error: 'Cuenta desactivada' });
    }

    // attach user to request for downstream handlers
    req.user = {
      id: user.id_usuario,
      nombre: user.nombre,
      apellido: user.apellido,
      usuario: user.usuario,
      rol: user.rol,
      estado: user.estado
    };

    next();
  } catch (err) {
    console.error('[AUTH MIDDLEWARE]', err);
    return res.status(401).json({ error: 'No autorizado' });
  }
}