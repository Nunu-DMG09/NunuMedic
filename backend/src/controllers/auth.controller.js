import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import { createJWT, verifyJWT, getExpiryMs } from '../services/jwt.service.js';

const revokedTokens = new Set();

export async function login(req, res) {
  try {
    const { usuario, clave } = req.body || {};
    if (!usuario || !clave) return res.status(400).json({ error: 'usuario y clave son requeridos' });

    const [rows] = await pool.query('SELECT * FROM usuario WHERE usuario = ? LIMIT 1', [usuario]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    let match = false;
    if (typeof user.clave === 'string' && user.clave.startsWith('$2')) {
      match = await bcrypt.compare(clave, user.clave);
    } else {
      match = clave === user.clave;
    }
    if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

    if (user.estado === 'inactivo') return res.status(403).json({ error: 'Usuario inactivo' });

    const token = createJWT({
      id: user.id_usuario,
      usuario: user.usuario,
      rol: user.rol,
      estado: user.estado
    });

    // set cookie
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: getExpiryMs()
    };
    res.cookie('access_token', token, cookieOptions);

    // don't send password
    delete user.clave;
    return res.status(200).json({ message: 'Inicio de sesión correcto', user, token });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    return res.status(500).json({ error: 'Error en login' });
  }
}

export function logout(req, res) {
  try {
    // revoke token if provided (header, body or cookie)
    const authHeader = req.headers.authorization || '';
    const tokenFromHeader = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    const token = tokenFromHeader || req.body?.token || req.query?.token || req.cookies?.access_token;
    if (token) {
      revokedTokens.add(token);
      console.log('[LOGOUT] token revocado');
    }

    // clear cookie
    res.clearCookie('access_token', { path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production', httpOnly: true });
    return res.status(200).json({ message: 'Cierre de sesión OK' });
  } catch (err) {
    console.error('Logout error', err);
    return res.status(500).json({ error: 'Error al cerrar sesión' });
  }
}

export function isTokenRevoked(token) {
  return revokedTokens.has(token);
}

export function revokeToken(token) {
  if (token) revokedTokens.add(token);
}

// refresh endpoint: valida cookie o header, verifica usuario y reemite cookie (rol/change detection)
export async function refresh(req, res) {
  try {
    const token = req.cookies?.access_token || (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null);
    if (!token) {
      // Force logout client-side
      res.clearCookie('access_token', { path: '/', sameSite: 'lax', secure: process.env.NODE_ENV === 'production', httpOnly: true });
      return res.status(401).json({ error: 'Token no válido', forceLogout: true });
    }

    if (isTokenRevoked(token)) {
      res.clearCookie('access_token');
      return res.status(401).json({ error: 'Token revocado', forceLogout: true });
    }

    let decoded;
    try {
      decoded = verifyJWT(token);
    } catch (e) {
      console.error('[REFRESH] verify error', e);
      res.clearCookie('access_token');
      return res.status(401).json({ error: 'Token no válido', forceLogout: true });
    }

    const data = decoded.data || decoded?.payload?.data || decoded;
    if (!data || !data.id || !data.usuario) {
      res.clearCookie('access_token');
      return res.status(401).json({ error: 'Token inválido: datos incompletos', forceLogout: true });
    }

    // fetch user fresh
    const [rows] = await pool.query('SELECT * FROM usuario WHERE id_usuario = ? LIMIT 1', [data.id]);
    const user = rows[0];
    if (!user) {
      res.clearCookie('access_token');
      return res.status(401).json({ error: 'Usuario no encontrado', forceLogout: true });
    }

    const estado = (user.estado || '').toString().toLowerCase();
    if (!['activo', '1', 'true'].includes(estado)) {
      res.clearCookie('access_token');
      return res.status(401).json({ error: 'Tu cuenta ha sido desactivada', forceLogout: true });
    }

    const roleChanged = (String(user.rol) !== String(data.rol));
    if (roleChanged) {
      const newToken = createJWT({
        id: user.id_usuario,
        usuario: user.usuario,
        rol: user.rol,
        estado: user.estado
      });
      res.cookie('access_token', newToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: getExpiryMs()
      });

      delete user.clave;
      return res.status(200).json({
        role_changed: true,
        user: {
          id: user.id_usuario,
          usuario: user.usuario,
          estado: user.estado,
          rol: user.rol,
          nombre: user.nombre ?? 'Usuario'
        }
      });
    }

    delete user.clave;
    return res.status(200).json({
      role_changed: false,
      user: {
        id: user.id_usuario,
        usuario: user.usuario,
        estado: user.estado,
        rol: user.rol,
        nombre: user.nombre ?? 'Usuario'
      }
    });

  } catch (err) {
    console.error('[REFRESH ERROR]', err);
    res.clearCookie('access_token');
    return res.status(500).json({ error: 'Error en refresh', forceLogout: true });
  }
}