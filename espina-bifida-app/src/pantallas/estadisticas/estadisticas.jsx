import React, { useEffect, useState } from "react";
import {
  Package,
  CheckCircle,
  AlertCircle,
  XCircle,
  Users,
  UserCheck,
  UserX,
  UserPlus,
  CalendarDays,
  Stethoscope,
  Pill,
  DollarSign,
  FileText,
  ClipboardList,
  Bell,
  RotateCcw,
} from "lucide-react";

import StatCard from "../../componentes/statCard/statCard";
import "./estadisticas.css";

function EstadisticasPage() {
  const [stats, setStats] = useState({
    // Inventario
    totalArticulos: 84,
    existenciasNormal: 61,
    existenciasBajas: 15,
    existenciasAgotadas: 8,

    // Pacientes
    totalPacientes: 120,
    pacientesActivos: 108,
    pacientesInactivos: 12,
    pacientesNuevosMes: 9,

    // Servicios
    visitasMes: 34,
    serviciosRealizados: 27,
    medicinasEntregadas: 45,
    equipoSinRegresar: 4,

    // Reportes
    ingresosMes: 12500,
    registrosPendientes: 6,
    notificacionesMes: 18,
    totalReportes: 10,
  });

  useEffect(() => {
    // Aquí después puedes conectar tu API:
    // fetch("http://localhost:3001/api/estadisticas")
    //   .then((res) => res.json())
    //   .then((res) => setStats(res.data))
    //   .catch(console.error);
  }, []);

  const getPercentage = (value, total) => {
    if (!total || total === 0) return "0%";
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const formatMoney = (value) => {
    return `$${Number(value).toLocaleString("es-MX")}`;
  };

  return (
    <div className="estadisticas-page">
      {/* INVENTARIO */}
      <section className="stats-section">
        <div className="section-header">
          <h2>Inventario</h2>
          <p>Resumen de existencias de medicinas y equipo médico.</p>
        </div>

        <div className="stats-row">
          <StatCard
            title="TOTAL ARTÍCULOS"
            value={stats.totalArticulos}
            color="blue"
            icon={<Package size={38} strokeWidth={2.5} />}
          />

          <StatCard
            title="EXISTENCIAS NORMAL"
            value={stats.existenciasNormal}
            percentage={getPercentage(
              stats.existenciasNormal,
              stats.totalArticulos
            )}
            color="green"
            icon={<CheckCircle size={42} strokeWidth={2.5} />}
          />

          <StatCard
            title="EXISTENCIAS BAJAS"
            value={stats.existenciasBajas}
            percentage={getPercentage(
              stats.existenciasBajas,
              stats.totalArticulos
            )}
            color="yellow"
            icon={<AlertCircle size={42} strokeWidth={2.5} />}
          />

          <StatCard
            title="EXISTENCIAS AGOTADAS"
            value={stats.existenciasAgotadas}
            percentage={getPercentage(
              stats.existenciasAgotadas,
              stats.totalArticulos
            )}
            color="red"
            icon={<XCircle size={42} strokeWidth={2.5} />}
          />
        </div>
      </section>

      {/* PACIENTES */}
      <section className="stats-section">
        <div className="section-header">
          <h2>Pacientes</h2>
          <p>Información general sobre pacientes registrados en el sistema.</p>
        </div>

        <div className="stats-row">
          <StatCard
            title="TOTAL PACIENTES"
            value={stats.totalPacientes}
            color="purple"
            icon={<Users size={40} strokeWidth={2.5} />}
          />

          <StatCard
            title="PACIENTES ACTIVOS"
            value={stats.pacientesActivos}
            percentage={getPercentage(
              stats.pacientesActivos,
              stats.totalPacientes
            )}
            color="green"
            icon={<UserCheck size={40} strokeWidth={2.5} />}
          />

          <StatCard
            title="PACIENTES INACTIVOS"
            value={stats.pacientesInactivos}
            percentage={getPercentage(
              stats.pacientesInactivos,
              stats.totalPacientes
            )}
            color="red"
            icon={<UserX size={40} strokeWidth={2.5} />}
          />

          <StatCard
            title="NUEVOS ESTE MES"
            value={stats.pacientesNuevosMes}
            color="blue"
            icon={<UserPlus size={40} strokeWidth={2.5} />}
          />
        </div>
      </section>

      {/* SERVICIOS */}
      <section className="stats-section">
        <div className="section-header">
          <h2>Servicios</h2>
          <p>Actividad mensual relacionada con visitas, servicios y entregas.</p>
        </div>

        <div className="stats-row">
          <StatCard
            title="VISITAS DEL MES"
            value={stats.visitasMes}
            color="blue"
            icon={<CalendarDays size={40} strokeWidth={2.5} />}
          />

          <StatCard
            title="SERVICIOS REALIZADOS"
            value={stats.serviciosRealizados}
            color="green"
            icon={<Stethoscope size={40} strokeWidth={2.5} />}
          />

          <StatCard
            title="MEDICINAS ENTREGADAS"
            value={stats.medicinasEntregadas}
            color="purple"
            icon={<Pill size={40} strokeWidth={2.5} />}
          />

          <StatCard
            title="EQUIPO SIN REGRESAR"
            value={stats.equipoSinRegresar}
            color="red"
            icon={<RotateCcw size={40} strokeWidth={2.5} />}
          />
        </div>
      </section>

      {/* REPORTES */}
      <section className="stats-section">
        <div className="section-header">
          <h2>Reportes</h2>
          <p>Indicadores útiles para auditoría, seguimiento y administración.</p>
        </div>

        <div className="stats-row">
          <StatCard
            title="INGRESOS DEL MES"
            value={formatMoney(stats.ingresosMes)}
            color="green"
            icon={<DollarSign size={40} strokeWidth={2.5} />}
          />

          <StatCard
            title="REGISTROS PENDIENTES"
            value={stats.registrosPendientes}
            color="yellow"
            icon={<Bell size={40} strokeWidth={2.5} />}
          />

          <StatCard
            title="NOTIFICACIONES DEL MES"
            value={stats.notificacionesMes}
            color="blue"
            icon={<ClipboardList size={40} strokeWidth={2.5} />}
          />

          <StatCard
            title="REPORTES GENERADOS"
            value={stats.totalReportes}
            color="purple"
            icon={<FileText size={40} strokeWidth={2.5} />}
          />
        </div>
      </section>
    </div>
  );
}

export default EstadisticasPage;