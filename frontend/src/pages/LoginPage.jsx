
import React, { useState } from 'react';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { usuario, clave });

      // Respuesta 200 OK
      if (response.status === 200 && response.data?.user) {
        const { user, token } = response.data;
        // Guardar en contexto
        login(user, token || null);
        setSuccess('Inicio de sesión correcto.');
        // mostrar la data (solo en desarrollo) — eliminar en producción
        // setSuccess(JSON.stringify(response.data, null, 2));

        // Redirigir breve delay
        setTimeout(() => navigate('/'), 700);
        return;
      }

      // Si el backend devolviera 200 pero sin user
      setError('Respuesta inesperada del servidor.');
    } catch (err) {
      // Manejo por códigos (400, 401, 403, otros)
      const r = err.response;
      if (r) {
        if (r.status === 400) setError(r.data?.error || 'Datos inválidos (400).');
        else if (r.status === 401) setError(r.data?.error || 'Credenciales inválidas (401).');
        else if (r.status === 403) setError(r.data?.error || 'Acceso denegado (403).');
        else setError(r.data?.error || `Error del servidor (${r.status}).`);
      } else {
        setError('Error de conexión. Comprueba el backend.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-nunumed-800 to-nunumed-900 p-6">
      <div className="w-full max-w-md bg-white/95 dark:bg-[#071127] rounded-xl shadow-lg p-8">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-nunumed-700">Nunumed</h1>
          <p className="text-sm text-gray-500 mt-1">Accede a tu cuenta</p>
        </header>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-800 border border-red-100 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-800 border border-green-100 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input
              className="input" // usa estilos base de index.css + tailwind si aplica
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              required
              placeholder="tu_usuario"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clave</label>
            <input
              type="password"
              className="input"
              value={clave}
              onChange={e => setClave(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between mt-2">
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Ingresando...' : 'Entrar'}
            </button>
          </div>
        </form>

        <footer className="mt-4 text-center text-sm text-gray-500">
          <div>¿Problemas para entrar? Contacta con el administrador.</div>
        </footer>

        {/* Debug: mostrar data de respuesta en desarrollo */}
        {/* <pre className="mt-4 text-xs text-gray-600">{JSON.stringify({ usuario }, null, 2)}</pre> */}
      </div>
    </div>
  );
}
