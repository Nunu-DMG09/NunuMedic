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
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { usuario, clave });

      if (response.status === 200 && response.data?.user) {
        const { user, token } = response.data;
        login(user, token || null);
        setSuccess('¡Bienvenido! Redirigiendo al dashboard...');
        setTimeout(() => navigate('/dashboard'), 1000);
        return;
      }

      setError('Respuesta inesperada del servidor.');
    } catch (err) {
      const r = err.response;
      if (r) {
        if (r.status === 400) setError(r.data?.error || 'Datos inválidos.');
        else if (r.status === 401) setError(r.data?.error || 'Usuario o contraseña incorrectos.');
        else if (r.status === 403) setError(r.data?.error || 'Acceso denegado.');
        else setError(r.data?.error || `Error del servidor (${r.status}).`);
      } else {
        setError('Error de conexión. Verifica tu conexión a internet.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen max-h-screen overflow-hidden bg-slate-100 flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl"
        style={{ 
          background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 25%, #ef4444 75%, #dc2626 100%)'
        }}
      >
        {/* Logo Section */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          {/* Tu logo aquí */}
          <img 
            src="/logo-nunumedic." 
            alt="NUNUMEDIC Logo" 
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto object-contain mb-3 sm:mb-5 drop-shadow-2xl"
            onError={(e) => {
              // Fallback si no hay imagen
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          {/* Fallback Logo */}
          <div 
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-white rounded-2xl shadow-xl mb-3 sm:mb-5 flex items-center justify-center transform hover:scale-105 transition-transform duration-300"
            style={{ display: 'none' }}
          >
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
            </svg>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3 drop-shadow-lg">
            NUNUMEDIC
          </h1>
          <p className="text-sm sm:text-base text-white/90 font-medium mb-2 sm:mb-3">Sistema de Gestión Farmacéutica</p>
          <div className="w-16 sm:w-20 h-0.5 bg-white/50 mx-auto rounded-full"></div>
        </div>

        {/* Form Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 sm:mb-3 text-center">Iniciar Sesión</h2>
          <p className="text-slate-600 mb-4 sm:mb-7 text-center">Ingresa tus credenciales</p>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                </svg>
                <p className="text-red-800 font-medium text-sm sm:text-base">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
              <div className="flex items-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 sm:mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                <p className="text-green-800 font-medium text-sm sm:text-base">{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Usuario Input */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1 sm:mb-2 text-sm sm:text-base">Usuario</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={usuario}
                  onChange={e => setUsuario(e.target.value)}
                  required
                  placeholder="Ingresa tu usuario"
                  autoComplete="username"
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 hover:border-slate-300 text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1 sm:mb-2 text-sm sm:text-base">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
                  </svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={clave}
                  onChange={e => setClave(e.target.value)}
                  required
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  className="w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-3 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 hover:border-slate-300 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd"/>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-4 px-4 sm:px-6 text-white font-bold rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 flex items-center justify-center gap-2 sm:gap-3 mt-5 sm:mt-7 text-sm sm:text-base"
              style={{
                background: loading 
                  ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                  : 'linear-gradient(135deg, #2563eb 0%, #dc2626 100%)',
                boxShadow: loading 
                  ? 'none' 
                  : '0 8px 25px rgba(37, 99, 235, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.boxShadow = '0 12px 35px rgba(37, 99, 235, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.target.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.3)';
                }
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 sm:mt-7 text-center">
            <p className="text-slate-500 text-xs sm:text-sm">
              ¿Problemas para acceder? 
              <span className="text-blue-600 font-semibold ml-1 cursor-pointer hover:text-blue-700 transition-colors hover:underline">
                Contacta al administrador
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}