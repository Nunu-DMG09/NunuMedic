import React from 'react';

export default function ModuleCard({ title, subtitle, bg, icon, href, onClick }) {
  return (
    <article className="card" style={{ display: 'flex', gap: 16, alignItems: 'center', padding: 20 }}>
      <div style={{
        width: 72,
        height: 72,
        borderRadius: 16,
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        background: bg
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h3>
        <p className="small-muted" style={{ margin: '6px 0 0' }}>{subtitle}</p>
        <div style={{ marginTop: 12 }}>
          {href ? <a href={href} className="small-muted">Acceder al módulo</a> :
            <button className="btn btn-outline" onClick={onClick}>Acceder</button>}
        </div>
      </div>
    </article>
  );
}