import React from 'react';

export default function Header({ tab = 'inventory', setTab = () => {} }) {
  return (
    <header className="header">
      <div className="container" style={{ padding: 0 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo / marca */}
            <div className="flex items-center gap-3">
              <div
                aria-hidden
                className="rounded-full"
                style={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(180deg,var(--nunumed-500),var(--nunumed-600))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 18px rgba(30,123,255,0.18)'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M12 3v18M3 12h18" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="app-title">NunuFharma</div>
                <div className="app-subtitle small-muted">Inventario y ventas · Botica</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Navegación principal */}
            <nav className="flex gap-2" role="tablist" aria-label="Secciones">
              <button
                role="tab"
                aria-selected={tab === 'inventory'}
                onClick={() => setTab('inventory')}
                className={tab === 'inventory' ? 'btn btn-primary' : 'btn btn-outline'}
              >
                Inventario
              </button>
              <button
                role="tab"
                aria-selected={tab === 'ventas'}
                onClick={() => setTab('ventas')}
                className={tab === 'ventas' ? 'btn btn-primary' : 'btn btn-outline'}
              >
                Ventas
              </button>
            </nav>

            {/* Buscador rápido */}
            <div className="hidden sm:block" style={{ minWidth: 220 }}>
              <label htmlFor="search" className="sr-only">Buscar producto</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input id="search" className="input" placeholder="Buscar producto..." />
                <button className="btn btn-primary" aria-label="Buscar">Ir</button>
              </div>
            </div>

            {/* Usuario / avatar */}
            <button className="rounded-full" title="Perfil" style={{ width: 40, height: 40, display: 'grid', placeItems: 'center', background: 'transparent', border: '1px solid rgba(15,23,42,0.04)' }}>
              <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(180deg,var(--nunumed-400),var(--nunumed-600))', display: 'inline-block' }} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}