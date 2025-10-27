// ...existing code...
import React, { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import VentasHeader from '../components/inventario/VentasHeader';

export default function VentasHistorialPage() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const [clienteSearch, setClienteSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // paginación cliente
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => { fetchVentas(); }, []);

  async function fetchVentas() {
    setLoading(true);
    try {
      const res = await api.get('api/ventas/listar');
      setVentas(res.data.data || []);
      setPage(1);
    } catch (err) {
      console.error('fetchVentas', err);
      alert('Error cargando ventas');
    } finally {
      setLoading(false);
    }
  }

  function openDetail(v) { setSelected(v); }
  function closeDetail() { setSelected(null); }

  // Filtrado local: por nombre de cliente y rango de fechas
  const filteredVentas = useMemo(() => {
    if (!ventas || ventas.length === 0) return [];

    const q = (clienteSearch || '').trim().toLowerCase();

    let fromTs = null;
    let toTs = null;
    if (dateFrom) {
      const d = new Date(dateFrom);
      d.setHours(0,0,0,0);
      fromTs = d.getTime();
    }
    if (dateTo) {
      const d = new Date(dateTo);
      d.setHours(23,59,59,999);
      toTs = d.getTime();
    }

    return ventas.filter(v => {
      const nombreCliente = `${v.cliente_nombre || ''} ${v.cliente_apellido || ''}`.trim().toLowerCase();
      if (q && !nombreCliente.includes(q)) return false;

      if ((fromTs !== null) || (toTs !== null)) {
        const fechaStr = v.fecha || v.fecha_venta || v.created_at || null;
        if (!fechaStr) return false;
        const ts = new Date(fechaStr).getTime();
        if (fromTs !== null && ts < fromTs) return false;
        if (toTs !== null && ts > toTs) return false;
      }

      return true;
    });
  }, [ventas, clienteSearch, dateFrom, dateTo]);

  // cuando cambian filtros resetear página a 1
  useEffect(() => { setPage(1); }, [clienteSearch, dateFrom, dateTo]);

  const totalItems = filteredVentas.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const paginatedVentas = filteredVentas.slice((page - 1) * perPage, page * perPage);

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
    const source = filteredVentas && filteredVentas.length ? filteredVentas : ventas;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Historial de Ventas', 14, 18);
    let cursorY = 26;
    source.forEach((v, idx) => {
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
      if (idx < source.length - 1 && cursorY > 240) { doc.addPage(); cursorY = 20; }
    });
    doc.save('historial_ventas.pdf');
  }

  return (
    <div className="container mx-auto p-6">
      <VentasHeader />

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Historial de ventas</h3>
            <div className="text-sm text-gray-500">Mostrando {totalItems} — Página {page} / {totalPages}</div>
          </div>
          <div>
            <button
              onClick={fetchVentas}
              disabled={loading}
              className="px-3 py-2 border border-blue-200 text-blue-700 rounded-md"
            >
              {loading ? 'Cargando...' : 'Refrescar'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-blue-700">Buscar cliente</label>
            <input
              type="text"
              value={clienteSearch}
              onChange={e => setClienteSearch(e.target.value)}
              placeholder="Nombre o apellido del cliente"
              className="w-full px-3 py-2 border-2 border-blue-200 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium text-blue-700">Desde</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full px-3 py-2 border-2 border-blue-200 bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          <div className="flex items-end justify-end gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => { setClienteSearch(''); setDateFrom(''); setDateTo(''); }}
                className="px-3 py-2 bg-blue-50 text-blue-800 border-2 border-blue-100 rounded-md hover:bg-blue-100"
              >
                Limpiar
              </button>

              <button
                onClick={exportAllPdf}
                className="px-3 py-2 bg-blue-600 text-white rounded-md"
              >
                Exportar todo (PDF)
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">ID</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Fecha</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Cliente</th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Total</th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">Ítems</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-500">Cargando...</td></tr>
              ) : paginatedVentas.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-500">No hay ventas</td></tr>
              ) : paginatedVentas.map(v => (
                <tr key={v.id_venta}>
                  <td className="px-4 py-3 text-sm text-gray-700">{v.id_venta}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{v.fecha}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{v.cliente_nombre ? `${v.cliente_nombre} ${v.cliente_apellido || ''}` : '-'}</td>
                  <td className="px-4 py-3 text-right text-gray-700">S/. {Number(v.total).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{(v.items || []).length}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <button
                        className="px-3 py-1 border border-blue-200 text-blue-700 rounded-md"
                        onClick={() => openDetail(v)}
                      >
                        Ver
                      </button>
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded-md"
                        onClick={() => exportSalePdf(v)}
                      >
                        Exportar PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-500">Página {page} / {totalPages} — Total {totalItems}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-2 border border-gray-200 rounded-md text-gray-700">Anterior</button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-2 border border-gray-200 rounded-md text-gray-700">Siguiente</button>
          </div>
        </div>

        {selected && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 grid place-items-center bg-black/40">
            <div className="bg-white rounded-lg shadow w-11/12 max-w-2xl p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Venta #{selected.id_venta}</h3>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 border border-blue-200 text-blue-700 rounded-md" onClick={closeDetail}>Cerrar</button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded-md" onClick={() => exportSalePdf(selected)}>Exportar PDF</button>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm text-gray-500">Fecha: {selected.fecha}</div>
                <div className="text-sm text-gray-500">Cliente: {selected.cliente_nombre ? `${selected.cliente_nombre} ${selected.cliente_apellido || ''}` : '-'}</div>

                <div className="overflow-x-auto mt-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Producto</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Cantidad</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Precio unit.</th>
                        <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(selected.items || []).map(it => (
                        <tr key={it.id_detalle_venta || `${it.id_producto}-${it.cantidad}`}>
                          <td className="px-4 py-3 text-sm text-gray-700">{it.nombre_producto || '-'}</td>
                          <td className="px-4 py-3 text-right text-gray-700">{it.cantidad}</td>
                          <td className="px-4 py-3 text-right text-gray-700">S/. {Number(it.precio_unitario).toFixed(2)}</td>
                          <td className="px-4 py-3 text-right text-gray-700">S/. {(Number(it.cantidad) * Number(it.precio_unitario)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-4">
                  <div className="text-lg font-semibold">Total: S/. {Number(selected.total).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// ...existing code...