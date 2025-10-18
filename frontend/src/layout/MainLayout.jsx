import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function MainLayout() {
  const { user, logout } = useAuth();
  return (
    <div>
      <header style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
        <nav>
          <Link to="/" style={{ marginRight: 8 }}>Home</Link>
          <Link to="/inventario" style={{ marginRight: 8 }}>Inventario</Link>
          <Link to="/ventas" style={{ marginRight: 8 }}>Ventas</Link>
          {!user ? <Link to="/login">Login</Link> :
            <>
              <span style={{ marginLeft: 12 }}>Hola {user.nombre}</span>
              <button onClick={logout} style={{ marginLeft: 8 }}>Salir</button>
            </>}
        </nav>
      </header>
      <main style={{ padding: 12 }}>
        <Outlet />
      </main>
    </div>
  );
}