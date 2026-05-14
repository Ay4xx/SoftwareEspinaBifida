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

import StatsSection from "../../componentes/statCard/statSection";
import { getEstadisticas } from "../../services/estadisticasService";
import StatsSectionSkeleton from "../../componentes/statCard/statSectionSkeleton";
import "./estadisticas.css";

function EstadisticasPage() {
  const [stats, setStats] = useState({
    totalArticulos: 0,
    existenciasNormal: 0,
    existenciasBajas: 0,
    existenciasAgotadas: 0,

    totalPacientes: 0,
    pacientesActivos: 0,
    pacientesInactivos: 0,
    pacientesNuevosMes: 0,

    visitasMes: 0,
    serviciosRealizados: 0,
    medicinasEntregadas: 0,
    equipoSinRegresar: 0,

    ingresosMes: 0,
    registrosPendientes: 0,
    notificacionesMes: 0,
    totalReportes: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getPercentage = (value, total) => {
    if (!total || total === 0) return "0%";
    return `${((value / total) * 100).toFixed(1)}%`;
  };

  const formatMoney = (value) => {
    return `$${Number(value).toLocaleString("es-MX")}`;
  };

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getEstadisticas();
        setStats(data);
      } catch (error) {
        console.error("Error cargando estadísticas:", error);
        setError("No se pudieron cargar las estadísticas.");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const inventarioCards = [
    {
      title: "TOTAL ARTÍCULOS",
      value: stats.totalArticulos,
      color: "blue",
      icon: <Package size={38} strokeWidth={2.5} />,
    },
    {
      title: "EXISTENCIAS NORMAL",
      value: stats.existenciasNormal,
      percentage: getPercentage(stats.existenciasNormal, stats.totalArticulos),
      color: "green",
      icon: <CheckCircle size={42} strokeWidth={2.5} />,
    },
    {
      title: "EXISTENCIAS BAJAS",
      value: stats.existenciasBajas,
      percentage: getPercentage(stats.existenciasBajas, stats.totalArticulos),
      color: "yellow",
      icon: <AlertCircle size={42} strokeWidth={2.5} />,
    },
    {
      title: "EXISTENCIAS AGOTADAS",
      value: stats.existenciasAgotadas,
      percentage: getPercentage(stats.existenciasAgotadas, stats.totalArticulos),
      color: "red",
      icon: <XCircle size={42} strokeWidth={2.5} />,
    },
  ];

  const pacientesCards = [
    {
      title: "TOTAL PACIENTES",
      value: stats.totalPacientes,
      color: "purple",
      icon: <Users size={40} strokeWidth={2.5} />,
    },
    {
      title: "PACIENTES ACTIVOS",
      value: stats.pacientesActivos,
      percentage: getPercentage(stats.pacientesActivos, stats.totalPacientes),
      color: "green",
      icon: <UserCheck size={40} strokeWidth={2.5} />,
    },
    {
      title: "PACIENTES INACTIVOS",
      value: stats.pacientesInactivos,
      percentage: getPercentage(stats.pacientesInactivos, stats.totalPacientes),
      color: "red",
      icon: <UserX size={40} strokeWidth={2.5} />,
    },
    {
      title: "NUEVOS ESTE MES",
      value: stats.pacientesNuevosMes,
      color: "blue",
      icon: <UserPlus size={40} strokeWidth={2.5} />,
    },
  ];

  const serviciosCards = [
    {
      title: "VISITAS DEL MES",
      value: stats.visitasMes,
      color: "blue",
      icon: <CalendarDays size={40} strokeWidth={2.5} />,
    },
    {
      title: "SERVICIOS REALIZADOS",
      value: stats.serviciosRealizados,
      color: "green",
      icon: <Stethoscope size={40} strokeWidth={2.5} />,
    },
    {
      title: "MEDICINAS ENTREGADAS",
      value: stats.medicinasEntregadas,
      color: "purple",
      icon: <Pill size={40} strokeWidth={2.5} />,
    },
    {
      title: "EQUIPO SIN REGRESAR",
      value: stats.equipoSinRegresar,
      color: "red",
      icon: <RotateCcw size={40} strokeWidth={2.5} />,
    },
  ];

  const reportesCards = [
    {
      title: "INGRESOS DEL MES",
      value: formatMoney(stats.ingresosMes),
      color: "green",
      icon: <DollarSign size={40} strokeWidth={2.5} />,
    },
    {
      title: "REGISTROS PENDIENTES",
      value: stats.registrosPendientes,
      color: "yellow",
      icon: <Bell size={40} strokeWidth={2.5} />,
    },
    {
      title: "NOTIFICACIONES DEL MES",
      value: stats.notificacionesMes,
      color: "blue",
      icon: <ClipboardList size={40} strokeWidth={2.5} />,
    },
    {
      title: "REPORTES GENERADOS",
      value: stats.totalReportes,
      color: "purple",
      icon: <FileText size={40} strokeWidth={2.5} />,
    },
  ];

  if (loading) {
  return (
    <div className="estadisticas-page">
      <StatsSectionSkeleton
        title="Inventario"
        description="Resumen de existencias de medicinas y equipo médico."
      />

      <StatsSectionSkeleton
        title="Pacientes"
        description="Información general sobre pacientes registrados en el sistema."
      />

      <StatsSectionSkeleton
        title="Servicios"
        description="Actividad mensual relacionada con visitas, servicios y entregas."
      />

      <StatsSectionSkeleton
        title="Reportes"
        description="Indicadores útiles para auditoría, seguimiento y administración."
      />
    </div>
  );
}

  if (error) {
    return (
      <div className="estadisticas-page">
        <p className="estadisticas-error">{error}</p>
      </div>
    );
  }

  return (
    <div className="estadisticas-page">
      <StatsSection
        title="Inventario"
        description="Resumen de existencias de medicinas y equipo médico."
        cards={inventarioCards}
      />

      <StatsSection
        title="Pacientes"
        description="Información general sobre pacientes registrados en el sistema."
        cards={pacientesCards}
      />

      <StatsSection
        title="Servicios"
        description="Actividad mensual relacionada con visitas, servicios y entregas."
        cards={serviciosCards}
      />

      <StatsSection
        title="Reportes"
        description="Indicadores útiles para auditoría, seguimiento y administración."
        cards={reportesCards}
      />
    </div>
  );
}

export default EstadisticasPage;