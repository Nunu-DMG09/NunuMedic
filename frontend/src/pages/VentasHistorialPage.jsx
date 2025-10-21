import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export default function VentasHistorialPage() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchVentas(); }, []);

  async function fetchVentas() {
    setLoading(true);
    try {
      const res = await api.get('api/ventas/listar');
      setVentas(res.data.data || []);
    } catch (err) {
      console.error('fetchVentas', err);
      alert('Error cargando ventas');
    } finally {
      setLoading(false);
    }
  }

  function openDetail(v) { setSelected(v); }
  function closeDetail() { setSelected(null); }

  function exportSalePdf(venta) {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Venta #${venta.id_venta}`, 14, 18);
    doc.setFontSize(10);
    doc.text(`Fecha: ${venta.fecha || ''}`, 14, 26);
    const cliente = (venta.cliente_nombre ? `${venta.cliente_nombre} ${venta.cliente_apellido || ''}` : 'Cliente genérico');
    doc.text(`Cliente: ${cliente}`, 14, 32);
    doc.autoTable({
      startY: 40,
      head: [['ID', 'Producto', 'Cantidad', 'P.Unit', 'Subtotal']],
      body: (venta.items || []).map(it => [
        it.id_producto,
        it.nombre_producto || '-',
        it.cantidad,
        Number(it.precio_unitario).toFixed(2),
        (Number(it.cantidad) * Number(it.precio_unitario)).toFixed(2)
      ]),
      styles: { fontSize: 9 }
    });
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 80;
    doc.setFontSize(12);
    doc.text(`Total: S/. ${Number(venta.total).toFixed(2)}`, 14, finalY);
    doc.save(`venta_${venta.id_venta}.pdf`);
  }

  function exportAllPdf() {
    if (!ventas || ventas.length === 0) return alert('No hay ventas para exportar');
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Historial de Ventas', 14, 18);
    let cursorY = 26;
    ventas.forEach((v, idx) => {
      doc.setFontSize(11);
      doc.text(`Venta #${v.id_venta} — Fecha: ${v.fecha || ''} — Total: S/. ${Number(v.total).toFixed(2)}`, 14, cursorY);
      cursorY += 6;
      const rows = (v.items || []).map(it => [
        it.id_producto, it.nombre_producto || '-', it.cantidad, Number(it.precio_unitario).toFixed(2),
        (Number(it.cantidad) * Number(it.precio_unitario)).toFixed(2)
      ]);
      doc.autoTable({
        startY: cursorY,
        head: [['ID','Producto','Cant','P.Unit','Subtotal']],
        body: rows,
        styles: { fontSize: 8 },
        margin: { left: 14, right: 14 }
      });
      cursorY = doc.lastAutoTable.finalY + 8;
      if (idx < ventas.length - 1 && cursorY > 240) { doc.addPage(); cursorY = 20; }
    });
    doc.save('historial_ventas.pdf');
  }

  return (
    <div className="container">
      <div className="header" style={{ padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="app-title">Historial de Ventas</h2>
            <p className="small-muted">Listado de ventas realizadas</p>
          </div>
          <div>
            <button className="btn btn-outline" onClick={fetchVentas} disabled={loading}>Refrescar</button>
            <button className="btn btn-primary" style={{ marginLeft: 8 }} onClick={exportAllPdf}>Exportar todo (PDF)</button>
          </div>
        </div>
      </div>

      {loading ? <div className="card">Cargando...</div> : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th><th>Fecha</th><th>Cliente</th><th>Total</th><th>Ítems</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map(v => (
                <tr key={v.id_venta}>
                  <td>{v.id_venta}</td>
                  <td>{v.fecha}</td>
                  <td>{v.cliente_nombre ? `${v.cliente_nombre} ${v.cliente_apellido || ''}` : '-'}</td>
                  <td>S/. {Number(v.total).toFixed(2)}</td>
                  <td>{(v.items || []).length}</td>
                  <td>
                    <button className="btn btn-outline" onClick={() => openDetail(v)}>Ver</button>
                    <button className="btn btn-primary" style={{ marginLeft: 8 }} onClick={() => exportSalePdf(v)}>Exportar PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div role="dialog" aria-modal="true" style={{ position:'fixed', inset:0, display:'grid', placeItems:'center', background:'rgba(0,0,0,0.4)' }}>
          <div className="card" style={{ width: '90%', maxWidth: 800 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <h3>Venta #{selected.id_venta}</h3>
              <div>
                <button className="btn btn-outline" onClick={closeDetail}>Cerrar</button>
                <button className="btn btn-primary" style={{ marginLeft: 8 }} onClick={() => exportSalePdf(selected)}>Exportar PDF</button>
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <div className="small-muted">Fecha: {selected.fecha}</div>
              <div className="small-muted">Cliente: {selected.cliente_nombre ? `${selected.cliente_nombre} ${selected.cliente_apellido || ''}` : '-'}</div>
              <table className="table" style={{ marginTop: 8 }}>
                <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unit.</th><th>Subtotal</th></tr></thead>
                <tbody>
                  {(selected.items || []).map(it => (
                    <tr key={it.id_detalle_venta || `${it.id_producto}-${it.cantidad}`}>
                      <td>{it.nombre_producto || '-'}</td>
                      <td>{it.cantidad}</td>
                      <td>S/. {Number(it.precio_unitario).toFixed(2)}</td>
                      <td>S/. {(Number(it.cantidad) * Number(it.precio_unitario)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ display:'flex', justifyContent:'flex-end', marginTop: 12 }}>
                <div className="font-semibold">Total: S/. {Number(selected.total).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}