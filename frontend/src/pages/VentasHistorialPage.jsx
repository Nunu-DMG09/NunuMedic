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

  // paginación
  const [page, setPage] = useState(1);
  const perPage = 10;

  useEffect(() => { fetchVentas(); }, []);

  async function fetchVentas() {
    setLoading(true);
    try {
      const res = await api.get('/api/ventas/listar');
      const data = res.data?.data || res.data || [];
      setVentas(Array.isArray(data) ? data : []);
      setPage(1);
    } catch (err) {
      console.error('fetchVentas', err);
      alert('Error cargando ventas');
      setVentas([]);
    } finally {
      setLoading(false);
    }
  }

  function openDetail(v) { setSelected(v); }
  function closeDetail() { setSelected(null); }

  // Filtrado local
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

  // Calcular estadísticas
  const totalVentasAmount = filteredVentas.reduce((sum, v) => sum + Number(v.total || 0), 0);
  const ventasHoy = filteredVentas.filter(v => {
    const today = new Date().toISOString().split('T')[0];
    return v.fecha?.startsWith(today);
  });
  const ingresoHoy = ventasHoy.reduce((sum, v) => sum + Number(v.total || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <VentasHeader />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Total Ventas</div>
                  <div className="text-2xl font-bold text-slate-800">{filteredVentas.length}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Ingresos Totales</div>
                  <div className="text-xl font-bold text-slate-800">S/. {totalVentasAmount.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-100 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Ventas Hoy</div>
                  <div className="text-2xl font-bold text-slate-800">{ventasHoy.length}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-full -translate-y-10 translate-x-10 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Ingresos Hoy</div>
                  <div className="text-xl font-bold text-slate-800">S/. {ingresoHoy.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <svg className="w-6 h-6 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
                Historial de Ventas
              </h3>
              <div className="text-slate-600 mt-2">
                Mostrando <span className="font-semibold">{paginatedVentas.length}</span> de <span className="font-semibold">{totalItems}</span> ventas
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={exportAllPdf}
                disabled={!filteredVentas.length}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:shadow-none transition-all duration-200 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
                Exportar PDF
              </button>
              
              <button 
                onClick={fetchVentas}
                disabled={loading}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                </svg>
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-slate-50 rounded-xl border-2 border-slate-200 p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Buscar Cliente</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={clienteSearch}
                    onChange={e => setClienteSearch(e.target.value)}
                    placeholder="Nombre o apellido del cliente..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Fecha Desde</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Fecha Hasta</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => { setClienteSearch(''); setDateFrom(''); setDateTo(''); }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all duration-200 hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                  </svg>
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-slate-800 to-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Fecha</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white">Cliente</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-white">Total</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-white">Items</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-white">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center">
                        <div className="flex items-center justify-center gap-3 text-slate-500">
                          <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          <span className="text-lg">Cargando ventas...</span>
                        </div>
                      </td>
                    </tr>
                  ) : paginatedVentas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                            </svg>
                          </div>
                          <div className="text-xl font-semibold text-slate-600 mb-2">No hay ventas registradas</div>
                          <div className="text-slate-500">No se encontraron ventas con los filtros aplicados</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedVentas.map((v, index) => (
                      <tr key={v.id_venta} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-600">#{v.id_venta}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-800 font-medium">
                            {v.fecha ? new Date(v.fecha).toLocaleDateString('es-PE', {
                              day: '2-digit',
                              month: '2-digit', 
                              year: 'numeric'
                            }) : '-'}
                          </div>
                          <div className="text-slate-500 text-sm">
                            {v.fecha ? new Date(v.fecha).toLocaleTimeString('es-PE', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-xs">
                                {v.cliente_nombre ? v.cliente_nombre.charAt(0) : 'C'}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800">
                                {v.cliente_nombre ? `${v.cliente_nombre} ${v.cliente_apellido || ''}` : 'Cliente Anónimo'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-xl font-bold text-slate-800">S/. {Number(v.total).toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            {(v.items || []).length} productos
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openDetail(v)}
                              className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                              </svg>
                              Ver
                            </button>
                            <button
                              onClick={() => exportSalePdf(v)}
                              className="flex items-center gap-2 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-colors"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                              </svg>
                              PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <div className="text-slate-600">
              Página <span className="font-semibold">{page}</span> de <span className="font-semibold">{totalPages}</span> — 
              Total: <span className="font-semibold">{totalItems}</span> ventas
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1} 
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 disabled:text-slate-400 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
                Anterior
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages} 
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 disabled:text-slate-400 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
              >
                Siguiente
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Modal de Detalle */}
        {selected && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-900 px-8 py-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-16 translate-x-16"></div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Detalle de Venta #{selected.id_venta}</h3>
                      <p className="text-slate-300">Información completa de la transacción</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => exportSalePdf(selected)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                      Exportar PDF
                    </button>
                    <button 
                      onClick={closeDetail}
                      className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8 max-h-[70vh] overflow-y-auto">
                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <div className="text-sm text-slate-600 mb-2">Fecha de Venta</div>
                    <div className="text-lg font-bold text-slate-800">
                      {selected.fecha ? new Date(selected.fecha).toLocaleDateString('es-PE') : '-'}
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <div className="text-sm text-slate-600 mb-2">Cliente</div>
                    <div className="text-lg font-bold text-slate-800">
                      {selected.cliente_nombre ? `${selected.cliente_nombre} ${selected.cliente_apellido || ''}` : 'Cliente Anónimo'}
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="text-sm text-green-600 mb-2">Total de la Venta</div>
                    <div className="text-2xl font-bold text-green-800">S/. {Number(selected.total).toFixed(2)}</div>
                  </div>
                </div>

                {/* Products Table */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 bg-slate-100 border-b border-slate-200">
                    <h4 className="text-lg font-bold text-slate-800">Productos Vendidos</h4>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-slate-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700">Producto</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">Cantidad</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">Precio Unit.</th>
                          <th className="px-6 py-3 text-right text-sm font-semibold text-slate-700">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {(selected.items || []).map((it, idx) => (
                          <tr key={it.id_detalle_venta || `${it.id_producto}-${idx}`}>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-800">{it.nombre_producto || '-'}</div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {it.cantidad}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right font-medium text-slate-800">
                              S/. {Number(it.precio_unitario).toFixed(2)}
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-slate-800">
                              S/. {(Number(it.cantidad) * Number(it.precio_unitario)).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="px-6 py-4 bg-slate-100 border-t border-slate-200">
                    <div className="flex justify-end">
                      <div className="text-xl font-bold text-slate-800">
                        Total: S/. {Number(selected.total).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}