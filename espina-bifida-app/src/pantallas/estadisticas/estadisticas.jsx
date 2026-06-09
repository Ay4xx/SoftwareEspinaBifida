import React, { useEffect, useState, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  Users, Heart, CalendarDays, Stethoscope, Pill,
  DollarSign, Bell, Activity, Package,
  Download, Filter,
} from "lucide-react";

import { getEstadisticas } from "../../services/estadisticasService";
import ReporteMensualModal from "../../pantallas/estadisticas/ReporteMensualModal";
import "./estadisticas.css";

// ── Helpers de formato ────────────────────────────────────────────────────────

const fmt      = (n) => Number(n || 0).toLocaleString("es-MX");
const fmtMoney = (n) => `$${Number(n || 0).toLocaleString("es-MX", { minimumFractionDigits: 0 })}`;
const pct      = (a, b) => (!b ? "0%" : `${((a / b) * 100).toFixed(1)}%`);

// Mapea un array [{mes, total}] a [{mes, <key>: total}]
const mapSerie = (arr, key) => arr.map((r) => ({ mes: r.mes, [key]: r.total }));

// ── Paleta de colores ─────────────────────────────────────────────────────────

const COLORS = {
  blue:   "#378ADD",
  teal:   "#1D9E75",
  amber:  "#EF9F27",
  coral:  "#D85A30",
  purple: "#7F77DD",
  green:  "#639922",
  red:    "#E24B4A",
  gray:   "#888780",
};

// ── Componentes reutilizables ─────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, color = "blue", trend, className = "" }) {
  return (
    <div className={`kpi-card kpi-${color} ${className}`}>
      <div className="kpi-icon-wrap"><Icon size={20} strokeWidth={2} /></div>
      <div className="kpi-body">
        <p className="kpi-label">{label}</p>
        <p className="kpi-value">{value}</p>
        {sub && <p className="kpi-sub">{sub}</p>}
        {trend !== undefined && (
          <span className={`kpi-trend ${trend >= 0 ? "up" : "down"}`}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title, description, extra }) {
  return (
    <div className="section-header">
      <div>
        <h2 className="section-title">{title}</h2>
        {description && <p className="section-desc">{description}</p>}
      </div>
      {extra}
    </div>
  );
}

function ChartCard({ title, children, className = "" }) {
  return (
    <div className={`chart-card ${className}`}>
      {title && <p className="chart-title">{title}</p>}
      {children}
    </div>
  );
}

function ChartLegend({ items }) {
  return (
    <div className="chart-legend">
      {items.map((it, i) => (
        <span key={i} className="legend-item">
          <span
            className="legend-dot"
            style={{
              background: it.color,
              ...(it.dash ? { background: "transparent", border: `2px dashed ${it.color}` } : {}),
            }}
          />
          {it.label}
        </span>
      ))}
    </div>
  );
}

function DonutChart({ data, colors }) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  return (
    <div className="donut-wrap">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
            {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
          </Pie>
          <Tooltip formatter={(v) => fmt(v)} />
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-legend">
        {data.map((d, i) => (
          <div key={i} className="donut-legend-item">
            <span className="donut-dot" style={{ background: colors[i % colors.length] }} />
            <span className="donut-label">{d.name}</span>
            <span className="donut-value">{fmt(d.value)}</span>
            <span className="donut-pct">{pct(d.value, total)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label, money }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="ct-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="ct-value">
          {p.name}: {money ? fmtMoney(p.value) : fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

function DataTable({ title, columns, rows, filterKey, filterLabel = "Buscar…" }) {
  const [q,       setQ]       = useState("");
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const filtered = useMemo(() => {
    let data = rows;
    if (q && filterKey) {
      data = data.filter((r) => String(r[filterKey] ?? "").toLowerCase().includes(q.toLowerCase()));
    }
    if (sortCol) {
      data = [...data].sort((a, b) => {
        const av = a[sortCol], bv = b[sortCol];
        const cmp = typeof av === "number" ? av - bv : String(av).localeCompare(String(bv));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return data;
  }, [rows, q, filterKey, sortCol, sortDir]);

  const toggle = (col) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortCol(col); setSortDir("asc"); }
  };

  return (
    <div className="table-card">
      <div className="table-header">
        <p className="chart-title" style={{ margin: 0 }}>{title}</p>
        <div className="table-search-wrap">
          <Filter size={14} />
          <input className="table-search" placeholder={filterLabel} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} onClick={() => toggle(c.key)} className={c.numeric ? "num" : ""}>
                  {c.label}{sortCol === c.key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={columns.length} className="empty-row">Sin resultados</td></tr>
            ) : (
              filtered.map((row, i) => (
                <tr key={i}>
                  {columns.map((c) => (
                    <td key={c.key} className={c.numeric ? "num" : ""}>
                      {c.format ? c.format(row[c.key]) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="table-count">{filtered.length} registros</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="estadisticas-page">
      <div className="skeleton-header" />
      <div className="kpi-grid">
        {Array(8).fill(0).map((_, i) => <div key={i} className="skeleton-kpi" />)}
      </div>
      <div className="charts-row-2">
        <div className="skeleton-chart" />
        <div className="skeleton-chart" />
      </div>
    </div>
  );
}

// ── Helper para combinar series ───────────────────────────────────────────────

function mergeSeries(...args) {
  const maps = [];
  const keys = [];
  for (let i = 0; i < args.length; i += 2) {
    const arr = args[i], key = args[i + 1];
    keys.push(key);
    const m = {};
    arr.forEach((r) => { m[r.mes] = r.total; });
    maps.push(m);
  }
  const allMeses = [...new Set(args.filter((_, i) => i % 2 === 0).flatMap((a) => a.map((r) => r.mes)))].sort();
  return allMeses.map((mes) => {
    const obj = { mes };
    keys.forEach((k, i) => { obj[k] = maps[i][mes] ?? 0; });
    return obj;
  });
}

// ── Configuración de navegación ───────────────────────────────────────────────

const NAV_ITEMS = [
  { key: "resumen",        label: "Resumen" },
  { key: "pacientes",      label: "Pacientes" },
  { key: "citas",          label: "Citas" },
  { key: "visitas",        label: "Visitas e ingresos" },
  { key: "inventario",     label: "Inventario" },
  { key: "notificaciones", label: "Registros" },
];

const AXIS_PROPS = { tick: { fontSize: 11 }, tickLine: false };

// ── Página principal ──────────────────────────────────────────────────────────

export default function EstadisticasPage() {
  const [stats,         setStats]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [openReporte,   setOpenReporte]   = useState(false);
  const [activeSection, setActiveSection] = useState("resumen");

  useEffect(() => {
    (async () => {
      try {
        setStats(await getEstadisticas());
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar las estadísticas.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error)   return <div className="estadisticas-page"><p className="estadisticas-error">{error}</p></div>;
  if (!stats)  return null;

  const { pacientes, citas, visitas, membresias, servicios, medicinas, equipo, notificaciones, series } = stats;

  // Series combinadas
  const citasSerie     = mergeSeries(series.citasMes, "total_citas", series.citasAtendidasMes, "atendidas", series.citasCanceladasMes, "canceladas");
  const ingresosSerie  = mergeSeries(series.ingresosMes, "ingresos", series.descuentosMes, "descuentos");
  const serviciosSerie = mergeSeries(series.visitasMes, "visitas", series.serviciosMes, "servicios", series.medicinasUtilizadasMes, "medicinas");

  const pacientesSerie = mapSerie(series.pacientesNuevosMes,    "nuevos");
  const equipoSerie    = mapSerie(series.equiposEnUsoMes,       "en_uso");
  const notifSerie     = mapSerie(series.notificacionesMes,     "notif");
  const medicinaSerie  = mapSerie(series.medicinasUtilizadasMes,"utilizadas");
  const actSerie       = mapSerie(series.actualizacionesMes,    "actualizaciones");

  // Tablas
  const tablaCitas = citasSerie.map((r) => ({
    mes: r.mes, total: r.total_citas ?? 0, atendidas: r.atendidas ?? 0, canceladas: r.canceladas ?? 0,
    tasa: r.total_citas ? `${(((r.atendidas ?? 0) / r.total_citas) * 100).toFixed(1)}%` : "—",
  }));
  const tablaIngresos  = ingresosSerie.map((r)  => ({ mes: r.mes, ingresos: r.ingresos ?? 0, descuentos: r.descuentos ?? 0, neto: (r.ingresos ?? 0) - (r.descuentos ?? 0) }));
  const tablaServicios = serviciosSerie.map((r) => ({ mes: r.mes, visitas: r.visitas ?? 0, servicios: r.servicios ?? 0, medicinas: r.medicinas ?? 0 }));

  // Donuts
  const donutMembresias = [{ name: "Activas", value: membresias.activas }, { name: "Inactivas", value: membresias.inactivas }, { name: "Vencidas", value: membresias.vencidas }];
  const donutEquipo     = [{ name: "En uso", value: equipo.en_uso }, { name: "Regresados", value: equipo.regresados }];
  const donutCitas      = [{ name: "Atendidas", value: citas.atendidas }, { name: "Canceladas", value: citas.canceladas }, { name: "Pendientes", value: citas.pendientes }];

  const tasaAprobacion = notificaciones.mes > 0
    ? (((notificaciones.mes - notificaciones.rechazados) / notificaciones.mes) * 100).toFixed(1)
    : 0;

  return (
    <div className="estadisticas-page">

      {/* Top bar */}
      <div className="top-bar">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-desc">Estadísticas generales del sistema</p>
        </div>
        <button className="btn-primary" onClick={() => setOpenReporte(true)}>
          <Download size={15} strokeWidth={2.5} /> Descargar reporte
        </button>
      </div>

      {/* Navegación */}
      <nav className="dash-nav">
        {NAV_ITEMS.map((n) => (
          <button key={n.key} className={`dash-nav-btn ${activeSection === n.key ? "active" : ""}`} onClick={() => setActiveSection(n.key)}>
            {n.label}
          </button>
        ))}
      </nav>

      {/* ── RESUMEN ── */}
      {activeSection === "resumen" && (
        <section>
          <div className="kpi-grid">
            <KpiCard icon={Users}        label="Total pacientes"    value={fmt(pacientes.total)}               color="blue" />
            <KpiCard icon={CalendarDays} label="Servicios otorgados"     value={fmt(citas.mes)}                     color="purple" sub={`${fmt(citas.atendidas)} atendidas`} />
            <KpiCard icon={Activity}     label="Visitas este mes"   value={fmt(visitas.mes)}                   color="teal"   sub={`${fmt(visitas.total)} totales`} />
            <KpiCard icon={DollarSign}   label="Ingresos totales"   value={fmtMoney(visitas.ingresos_totales)} color="green"  sub={`Promedio ${fmtMoney(visitas.ingreso_promedio)}`} />
            <KpiCard icon={Pill}         label="Medicinas vendidas"   value={fmt(medicinas.utilizadas)}          color="amber"  sub={`${fmt(medicinas.bajo_stock)} bajo stock`} />
            <KpiCard icon={Package}      label="Comodato"      value={fmt(equipo.en_uso)}                 color="coral"  sub={`${equipo.porcentaje_retorno}% retorno`} />
            <KpiCard icon={Heart}        label="Membresías activas" value={fmt(membresias.activas)}            color="pink"   sub={`${fmt(membresias.vencidas)} vencidas`} />
            <KpiCard icon={Bell}         label="Registros mes"      value={fmt(notificaciones.mes)}            color="gray"   sub={`${tasaAprobacion}% aprobación`} />
          </div>
          <div className="charts-row-2">
            <ChartCard title="Visitas por mes">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={mapSerie(series.visitasMes, "total")}>
                  <defs>
                    <linearGradient id="gVisitas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={COLORS.blue} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                  <XAxis dataKey="mes" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total" name="Visitas" stroke={COLORS.blue} fill="url(#gVisitas)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Ingresos vs Descuentos">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ingresosSerie} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                  <XAxis dataKey="mes" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip money />} />
                  <Bar dataKey="ingresos"   name="Ingresos"   fill={COLORS.teal}  radius={[3,3,0,0]} />
                  <Bar dataKey="descuentos" name="Descuentos" fill={COLORS.amber} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <ChartLegend items={[{ color: COLORS.teal, label: "Ingresos" }, { color: COLORS.amber, label: "Descuentos" }]} />
            </ChartCard>
          </div>
        </section>
      )}

      {/* ── PACIENTES ── */}
      {activeSection === "pacientes" && (
        <section>
          <div className="kpi-grid kpi-grid-4">
            <KpiCard icon={Users}       label="Total"                value={fmt(pacientes.total)}             color="blue" />
            <KpiCard icon={Users}       label="Nuevos mes"           value={fmt(pacientes.nuevos_mes)}        color="purple" />
            <KpiCard icon={Activity}    label="Con válvula"          value={fmt(pacientes.con_valvula)}       color="teal" />
            <KpiCard icon={Stethoscope} label="Padecimiento anotado"    value={fmt(pacientes.con_padecimientos)} color="amber" />
            <KpiCard icon={Heart}       label="Membresías activas"   value={fmt(membresias.activas)}          color="pink"  sub={`${fmt(membresias.vencidas)} vencidas`} />
            <KpiCard icon={Users}       label="Membresías inactivas" value={fmt(membresias.inactivas)}        color="gray" />
          </div>
          <div className="charts-row-2">
            <ChartCard title="Nuevos pacientes por mes">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={pacientesSerie}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                  <XAxis dataKey="mes" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="nuevos" name="Pacientes nuevos" fill={COLORS.purple} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Estado de membresías">
              <DonutChart data={donutMembresias} colors={[COLORS.teal, COLORS.gray, COLORS.red]} />
            </ChartCard>
          </div>
          <DataTable title="Pacientes nuevos por mes" rows={pacientesSerie} columns={[{ key: "mes", label: "Mes" }, { key: "nuevos", label: "Nuevos", numeric: true, format: fmt }]} filterKey="mes" filterLabel="Filtrar por mes…" />
        </section>
      )}

      {/* ── CITAS ── */}
      {activeSection === "citas" && (
        <section>
          <div className="kpi-grid kpi-grid-4">
            <KpiCard icon={CalendarDays} label="Total citas"  value={fmt(citas.total)}      color="blue" />
            <KpiCard icon={CalendarDays} label="Atendidas"    value={fmt(citas.atendidas)}  color="green" sub={pct(citas.atendidas, citas.total)} />
            <KpiCard icon={CalendarDays} label="Canceladas"   value={fmt(citas.canceladas)} color="red"   sub={pct(citas.canceladas, citas.total)} />
            <KpiCard icon={CalendarDays} label="Pendientes"   value={fmt(citas.pendientes)} color="amber" />
          </div>
          <div className="charts-row-2">
            <ChartCard title="Citas por mes">
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={citasSerie}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                  <XAxis dataKey="mes" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="total_citas" name="Total"      stroke={COLORS.blue} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="atendidas"   name="Atendidas"  stroke={COLORS.teal} strokeWidth={2} dot={false} strokeDasharray="4 2" />
                  <Line type="monotone" dataKey="canceladas"  name="Canceladas" stroke={COLORS.red}  strokeWidth={2} dot={false} strokeDasharray="2 3" />
                </LineChart>
              </ResponsiveContainer>
              <ChartLegend items={[{ color: COLORS.blue, label: "Total" }, { color: COLORS.teal, label: "Atendidas", dash: true }, { color: COLORS.red, label: "Canceladas", dash: true }]} />
            </ChartCard>
            <ChartCard title="Distribución de citas">
              <DonutChart data={donutCitas} colors={[COLORS.teal, COLORS.red, COLORS.amber]} />
            </ChartCard>
          </div>
          <DataTable title="Detalle de citas por mes" rows={tablaCitas} columns={[{ key: "mes", label: "Mes" }, { key: "total", label: "Total", numeric: true, format: fmt }, { key: "atendidas", label: "Atendidas", numeric: true, format: fmt }, { key: "canceladas", label: "Canceladas", numeric: true, format: fmt }, { key: "tasa", label: "Tasa atención" }]} filterKey="mes" filterLabel="Filtrar por mes…" />
        </section>
      )}

      {/* ── VISITAS E INGRESOS ── */}
      {activeSection === "visitas" && (
        <section>
          <div className="kpi-grid kpi-grid-4">
            <KpiCard icon={Activity}    label="Total recibos"        value={fmt(visitas.total)}                   color="blue" />
            <KpiCard icon={DollarSign}  label="Ingresos totales"     value={fmtMoney(visitas.ingresos_totales)}   color="green" />
            <KpiCard icon={DollarSign}  label="Descuentos"           value={fmtMoney(visitas.descuentos_totales)} color="amber" />
            <KpiCard icon={DollarSign}  label="Pago promedio"        value={fmtMoney(visitas.ingreso_promedio)}   color="teal" />
            <KpiCard icon={Stethoscope} label="Servicios totales"    value={fmt(servicios.total)}                 color="purple" />
            <KpiCard icon={Stethoscope} label="Servicios del mes"    value={fmt(servicios.mes)}                   color="coral" />
            <KpiCard icon={Activity}    label="% pago completo"      value={`${visitas.porcentaje_pago}%`}        color="gray" />
            <KpiCard icon={Pill}        label="Medicinas entregadas" value={fmt(medicinas.utilizadas)}            color="pink" />
          </div>
          <div className="charts-row-2">
            <ChartCard title="Ingresos y descuentos por mes" className="chart-wide">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={ingresosSerie}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                  <XAxis dataKey="mes" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip money />} />
                  <Bar dataKey="ingresos"   name="Ingresos"   fill={COLORS.teal}  radius={[3,3,0,0]} />
                  <Bar dataKey="descuentos" name="Descuentos" fill={COLORS.amber} radius={[3,3,0,0]} />
                </BarChart>
              </ResponsiveContainer>
              <ChartLegend items={[{ color: COLORS.teal, label: "Ingresos" }, { color: COLORS.amber, label: "Descuentos" }]} />
            </ChartCard>
            <ChartCard title="Visitas y servicios por mes">
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={serviciosSerie}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                  <XAxis dataKey="mes" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="visitas"   name="Visitas"   stroke={COLORS.blue}   strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="servicios" name="Servicios" stroke={COLORS.purple} strokeWidth={2} dot={false} strokeDasharray="4 2" />
                  <Line type="monotone" dataKey="medicinas" name="Medicinas" stroke={COLORS.amber}  strokeWidth={2} dot={false} strokeDasharray="2 3" />
                </LineChart>
              </ResponsiveContainer>
              <ChartLegend items={[{ color: COLORS.blue, label: "Visitas" }, { color: COLORS.purple, label: "Servicios", dash: true }, { color: COLORS.amber, label: "Medicinas", dash: true }]} />
            </ChartCard>
          </div>
          <DataTable title="Ingresos por mes" rows={tablaIngresos} columns={[{ key: "mes", label: "Mes" }, { key: "ingresos", label: "Ingresos", numeric: true, format: fmtMoney }, { key: "descuentos", label: "Descuentos", numeric: true, format: fmtMoney }, { key: "neto", label: "Neto", numeric: true, format: fmtMoney }]} filterKey="mes" filterLabel="Filtrar por mes…" />
          <DataTable title="Servicios por mes" rows={tablaServicios} columns={[{ key: "mes", label: "Mes" }, { key: "visitas", label: "Visitas", numeric: true, format: fmt }, { key: "servicios", label: "Servicios", numeric: true, format: fmt }, { key: "medicinas", label: "Medicinas", numeric: true, format: fmt }]} filterKey="mes" filterLabel="Filtrar por mes…" />
        </section>
      )}

      {/* ── INVENTARIO ── */}
      {activeSection === "inventario" && (
        <section>
          <SectionHeader title="Medicinas" />
          <div className="kpi-grid kpi-grid-4">
            <KpiCard icon={Pill} label="Total medicinas"  value={fmt(medicinas.total)}                color="blue" />
            <KpiCard icon={Pill} label="Stock total"      value={fmt(medicinas.stock_total)}          color="teal" />
            <KpiCard icon={Pill} label="Bajo stock"       value={fmt(medicinas.bajo_stock)}           color="amber" sub={pct(medicinas.bajo_stock, medicinas.total)} />
            <KpiCard className="kpi-card-long" icon={Pill} label="Valor inventario" value={fmtMoney(medicinas.valor_inventario)} color="green" />
          </div>
          <SectionHeader title="Comodatos" />
          <div className="kpi-grid kpi-grid-4">
            <KpiCard icon={Package} label="Total comodatos"       value={fmt(equipo.total)}          color="blue" />
            <KpiCard icon={Package} label="Cantidad disponible" value={fmt(equipo.cantidad_total)} color="teal" />
            <KpiCard icon={Package} label="Bajo stock"          value={fmt(equipo.bajo_stock)}     color="amber" sub={pct(equipo.bajo_stock, equipo.total)} />
            <KpiCard icon={Package} label="En uso"              value={fmt(equipo.en_uso)}         color="coral" sub={pct(equipo.en_uso, equipo.total)} />
            <KpiCard className="kpi-card-long" icon={Package} label="Valor total" value={fmtMoney(equipo.valor_total)} color="purple" />
          </div>
          <div className="charts-row-2">
            <ChartCard title="Medicinas utilizadas por mes">
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={medicinaSerie}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                  <XAxis dataKey="mes" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="utilizadas" name="Medicinas utilizadas" fill={COLORS.amber} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Estado de los comodatos">
              <DonutChart data={donutEquipo} colors={[COLORS.coral, COLORS.teal]} />
            </ChartCard>
          </div>
          <div className="charts-row-2">
            <ChartCard title="Comodatos en uso por mes">
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={equipoSerie}>
                  <defs>
                    <linearGradient id="gEquipo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={COLORS.coral} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.coral} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                  <XAxis dataKey="mes" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="en_uso" name="Equipos en uso" stroke={COLORS.coral} fill="url(#gEquipo)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Actualizaciones de inventario por mes">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={actSerie}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                  <XAxis dataKey="mes" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="actualizaciones" name="Actualizaciones" fill={COLORS.green} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </section>
      )}

      {/* ── REGISTROS ── */}
      {activeSection === "notificaciones" && (
        <section>
          <div className="kpi-grid kpi-grid-4">
            <KpiCard icon={Bell} label="Este mes"        value={fmt(notificaciones.mes)}        color="blue" />
            <KpiCard icon={Bell} label="Rechazados"      value={fmt(notificaciones.rechazados)} color="red" />
            <KpiCard icon={Bell} label="Tasa aprobación" value={`${tasaAprobacion}%`}           color="green" />
          </div>
          <div className="charts-row-2">
            <ChartCard title="Registros por mes" className="chart-wide">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={notifSerie}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
                  <XAxis dataKey="mes" {...AXIS_PROPS} />
                  <YAxis {...AXIS_PROPS} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="notif" name="Registros" fill={COLORS.blue} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
          <DataTable title="Registros por mes" rows={notifSerie.map((r) => ({ mes: r.mes, total: r.notif }))} columns={[{ key: "mes", label: "Mes" }, { key: "total", label: "Total", numeric: true, format: fmt }]} filterKey="mes" filterLabel="Filtrar por mes…" />
        </section>
      )}

      <ReporteMensualModal open={openReporte} onClose={() => setOpenReporte(false)} />
    </div>
  );
}
