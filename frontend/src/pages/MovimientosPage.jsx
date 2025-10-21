import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function MovimientosPage() {
  const [movimientos, setMovimientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchMovimientos(); }, []);

  async function fetchMovimientos() {
    setLoading(true);
    try {
      const res = await api.get('api/movimientos/listar');
      setMovimientos(res.data.data || []);
    } catch (err) {
      console.error('fetchMovimientos', err);
      alert('Error cargando movimientos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <h2 className="app-title">Historial de Movimientos</h2>
          <p className="small-muted">Entradas y salidas de stock</p>
        </div>
        <div>
          <button className="btn btn-outline" onClick={fetchMovimientos} disabled={loading}>Refrescar</button>
        </div>
      </div>

      <div className="card" style={{ marginTop:12 }}>
        {loading ? <div>Cargando...</div> : (
          <table className="table">
            <thead>
              <tr>
                <th>#</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Descripción</th><th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map(m => (
                <tr key={m.id_movimiento}>
                  <td>{m.id_movimiento}</td>
                  <td>{m.nombre_producto || '-'}</td>
                  <td>{m.tipo}</td>
                  <td>{m.cantidad}</td>
                  <td>{m.descripcion || '-'}</td>
                  <td>{m.fecha_movimiento}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}