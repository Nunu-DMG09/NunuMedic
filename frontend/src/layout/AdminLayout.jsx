import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <aside style={{
        width: 220,
        padding: 16,
        borderRight: '1px solid rgba(0,0,0,0.06)',
        background: 'var(--panel-bg)'
      }}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Nunumed</div>
          <div className="small-muted">Panel administrativo</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link to="/app" style={{ padding: 8 }}>Dashboard</Link>
          <Link to="/app/inventario" style={{ padding: 8 }}>Inventario</Link>
          <Link to="/app/ventas" style={{ padding: 8 }}>Ventas</Link>
        </nav>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          background: 'transparent'
        }}>
          <div />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {user ? (
              <>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>{user.nombre} {user.apellido}</div>
                  <div className="small-muted" style={{ fontSize: 12 }}>{user.rol}</div>
                </div>
                <button className="btn btn-outline" onClick={handleLogout}>Cerrar sesión</button>
              </>
            ) : (
              <Link to="/login">Entrar</Link>
            )}
          </div>
        </header>

        <main style={{ padding: 20 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}