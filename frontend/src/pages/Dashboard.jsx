import React from 'react';
import ModuleCard from '../components/ModuleCard';

const IconUsers = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M16 11c1.657 0 3-1.343 3-3S17.657 5 16 5s-3 1.343-3 3 1.343 3 3 3zM8 11c1.657 0 3-1.343 3-3S9.657 5 8 5 5 6.343 5 8s1.343 3 3 3z" stroke="#000000" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 20c0-2.5 3.582-4.5 8-4.5s8 2 8 4.5" stroke="#000000" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconSales = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3 11h18M7 7h.01M11 7h.01M15 7h.01M19 7h.01" stroke="#000000" trokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 15V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8" stroke="#000000" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 21h10" stroke="#000000" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconInventory = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M3 7l9-4 9 4v10l-9 4-9-4V7z" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 3v14" stroke="#000000" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconHistory = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M21 12a9 9 0 1 1-3-6.5" stroke="#000000" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 7v6l4 2" stroke="#000000" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Dashboard() {
  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
        <div>
          <h1 className="app-title" style={{ margin: 0 }}>Panel de Administración</h1>
          <div className="small-muted" style={{ marginTop: 6 }}>¡Bienvenido, <strong>ADMINISTRADOR</strong> — <span className="badge">Super Admin</span></div>
        </div>
        <div>
          <button className="btn btn-primary">Cerrar Sesión</button>
        </div>
      </div>

      <h2 style={{ marginTop: 6, marginBottom: 12 }}>Módulos Principales</h2>

      <div style={{
        display: 'grid',
        gap: 16,
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
      }}>
        <ModuleCard
          title="Administrar Usuarios"
          subtitle="Gestionar usuarios del sistema"
          bg="linear-gradient(135deg,#e6f0ff,#e9f2ff)"
          icon={IconUsers}
          href="/usuarios"
        />
        <ModuleCard
          title="Hacer Ventas"
          subtitle="Registrar ventas y cobros"
          bg="linear-gradient(135deg,#ffe7e7,#fff0f3)"
          icon={IconSales}
          href="/ventas"
        />
        <ModuleCard
          title="Ver Inventario"
          subtitle="Consultar y editar productos"
          bg="linear-gradient(135deg,#ecfff2,#f0fff6)"
          icon={IconInventory}
          href="/inventario"
        />
        <ModuleCard
          title="Historial de Ventas"
          subtitle="Ver ventas realizadas"
          bg="linear-gradient(135deg,#f8f0ff,#fbf6ff)"
          icon={IconHistory}
          href="/ventas/historial"
        />

        <ModuleCard
          title="Historial de Movimientos"
          subtitle="Ver entradas y salidas de stock"
          bg="linear-gradient(135deg,#f8f0ff,#fbf6ff)"
          icon={IconHistory}
          href="/movimientos"
        />
      </div>
    </div>
  );
}