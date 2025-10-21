import React, { useState } from 'react';
import VentasForm from '../components/ventas/VentasForm';
import ClienteForm from '../components/ventas/ClienteForm';
import Modal from '../components/inventario/Modal';

export default function VentasPage() {
  const [cliente, setCliente] = useState(null);

  function handleClienteCreated(c) {
    setCliente(c);
  }

  function clearCliente() {
    setCliente(null);
  }

  return (
    <div className="container" style={{ paddingTop: 24 }}>
      {!cliente ? (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h3 style={{ margin: 0 }}>Registrar Cliente</h3>
              <div className="small-muted" style={{ marginTop: 4 }}>Ingresa DNI, nombre y apellido antes de crear la venta</div>
            </div>
          </div>
          <ClienteForm onCreated={handleClienteCreated} />
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <h3 style={{ margin: 0 }}>Registrar venta — Cliente: {cliente.nombre} {cliente.apellido} ({cliente.dni})</h3>
              <div className="small-muted" style={{ marginTop: 4 }}>ID cliente: {cliente.id_cliente ?? '—'}</div>
            </div>
            <div>
              <button className="btn btn-outline" onClick={clearCliente}>Cambiar cliente</button>
            </div>
          </div>

          <div className="card" style={{ padding: 16 }}>
            {/* VentasForm debe aceptar prop "cliente" o "id_cliente" para usarlo al crear la venta */}
            <VentasForm cliente={cliente} />
          </div>
        </div>
      )}
    </div>
  );
}