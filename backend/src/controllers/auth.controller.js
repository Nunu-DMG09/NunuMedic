import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function login(req, res) {
    try {
        console.log('[LOGIN] origin=', req.headers.origin, 'ip=', req.ip, 'method=', req.method, 'body=', req.body);
        const { usuario, clave } = req.body || {};
        if (!usuario || !clave) return res.status(400).json({ error: 'usuario y clave son requeridos' });

        const [rows] = await pool.query('SELECT * FROM usuario WHERE usuario = ? LIMIT 1', [usuario]);
        const user = rows[0];
        if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

        let match = false;
        if (typeof user.clave === 'string' && user.clave.startsWith('$2')) {
            match = await bcrypt.compare(clave, user.clave);
        } else {
            match = clave === user.clave; // solo para pruebas locales
        }
        if (!match) return res.status(401).json({ error: 'Credenciales inválidas' });

        if (user.estado === 'inactivo') return res.status(403).json({ error: 'Usuario inactivo' });

        const secret = process.env.JWT_SECRET || 'secret_de_prueba';
        let token = null;
        try {
            token = jwt.sign(
                { id_usuario: user.id_usuario, usuario: user.usuario, rol: user.rol },
                secret,
                { expiresIn: '8h' }
            );
        } catch (e) {
            // si no está jsonwebtoken instalado o falla, no interrumpe el login
            console.error('JWT error:', e.message || e);
        }

        // no devolver la clave
        delete user.clave;
        return res.status(200).json({ message: 'Inicio de sesión correcto', user, token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Error en login' });
    }
}