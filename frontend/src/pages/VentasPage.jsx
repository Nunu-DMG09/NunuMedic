import React from 'react';
import VentasForm from '../components/ventas/VentasForm';
import Modal from '../components/inventario/Modal';

export default function VentasPage() {
  // Página simple que muestra el formulario de venta dentro de una tarjeta
  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h3 style={{ margin: 0 }}>Registrar venta</h3>
            <div className="small-muted" style={{ marginTop: 4 }}>Registre ventas y ajuste stock automáticamente</div>
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <VentasForm />
        </div>
      </div>
    </div>
  );
}