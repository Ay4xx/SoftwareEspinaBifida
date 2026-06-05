import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import EstadisticasPage from "../../pantallas/estadisticas/estadisticas";
import {
  getEstadisticas,
  descargarReporteMensual,
} from "../../services/estadisticasService";

jest.mock("../../services/estadisticasService", () => ({
  getEstadisticas: jest.fn(),
  descargarReporteMensual: jest.fn(),
}));

jest.mock("recharts", () => {
  const React = require("react");

  return {
    ResponsiveContainer: ({ children }) =>
      React.createElement("div", { "data-testid": "responsive-container" }, children),

    AreaChart: ({ children }) =>
      React.createElement("div", { "data-testid": "area-chart" }, children),

    Area: () => React.createElement("div", { "data-testid": "area" }),

    BarChart: ({ children }) =>
      React.createElement("div", { "data-testid": "bar-chart" }, children),

    Bar: () => React.createElement("div", { "data-testid": "bar" }),

    LineChart: ({ children }) =>
      React.createElement("div", { "data-testid": "line-chart" }, children),

    Line: () => React.createElement("div", { "data-testid": "line" }),

    XAxis: () => React.createElement("div", { "data-testid": "x-axis" }),
    YAxis: () => React.createElement("div", { "data-testid": "y-axis" }),
    CartesianGrid: () => React.createElement("div", { "data-testid": "grid" }),
    Tooltip: () => React.createElement("div", { "data-testid": "tooltip" }),
    Legend: () => React.createElement("div", { "data-testid": "legend" }),

    PieChart: ({ children }) =>
      React.createElement("div", { "data-testid": "pie-chart" }, children),

    Pie: ({ children }) =>
      React.createElement("div", { "data-testid": "pie" }, children),

    Cell: () => React.createElement("div", { "data-testid": "cell" }),
  };
});

const mockStats = {
  pacientes: {
    total: 50,
    vivos: 35,
    fallecidos: 15,
    nuevos_mes: 5,
    con_valvula: 10,
    con_padecimientos: 20,
  },
  citas: {
    total: 30,
    atendidas: 20,
    canceladas: 5,
    pendientes: 5,
    mes: 12,
  },
  visitas: {
    total: 100,
    mes: 25,
    cuotas_totales: 20000,
    ingresos_totales: 15000,
    descuentos_totales: 5000,
    ingreso_promedio: 600,
    porcentaje_pago: 75,
  },
  membresias: {
    activas: 35,
    inactivas: 10,
    vencidas: 5,
  },
  servicios: {
    total: 18,
    mes: 8,
  },
  medicinas: {
    total: 100,
    stock_total: 70,
    bajo_stock: 20,
    valor_inventario: 50000,
    utilizadas: 12,
    actualizaciones_inventario: 6,
  },
  equipo: {
    total: 10,
    cantidad_total: 15,
    en_uso: 3,
    regresados: 7,
    porcentaje_retorno: 70,
    valor_total: 30000,
  },
  notificaciones: {
    rechazados: 4,
    tasa_aprobacion: 80,
    mes: 8,
  },
  series: {
    pacientesNuevosMes: [{ mes: "2026-05", total: 5 }],
    citasMes: [{ mes: "2026-05", total: 12 }],
    citasAtendidasMes: [{ mes: "2026-05", total: 20 }],
    citasCanceladasMes: [{ mes: "2026-05", total: 5 }],
    visitasMes: [{ mes: "2026-05", total: 25 }],
    ingresosMes: [{ mes: "2026-05", total: 15000 }],
    descuentosMes: [{ mes: "2026-05", total: 5000 }],
    serviciosMes: [{ mes: "2026-05", total: 8 }],
    medicinasUtilizadasMes: [{ mes: "2026-05", total: 12 }],
    actualizacionesMes: [{ mes: "2026-05", total: 6 }],
    equiposEnUsoMes: [{ mes: "2026-05", total: 3 }],
    notificacionesMes: [{ mes: "2026-05", total: 8 }],
  },
};

describe("EstadisticasPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("muestra skeleton mientras carga", () => {
    getEstadisticas.mockImplementationOnce(() => new Promise(() => {}));

    const { container } = render(<EstadisticasPage />);

    expect(container.querySelector(".skeleton-header")).toBeInTheDocument();
    expect(container.querySelectorAll(".skeleton-kpi").length).toBe(8);
    expect(container.querySelectorAll(".skeleton-chart").length).toBe(2);
  });

  test("carga y muestra el dashboard principal", async () => {
    getEstadisticas.mockResolvedValueOnce(mockStats);

    render(<EstadisticasPage />);

    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Estadísticas generales del sistema")).toBeInTheDocument();

    expect(screen.getByText("Total pacientes")).toBeInTheDocument();
    expect(screen.getByText("Citas este mes")).toBeInTheDocument();
    expect(screen.getByText("Visitas este mes")).toBeInTheDocument();
    expect(screen.getByText("Ingresos totales")).toBeInTheDocument();
    expect(screen.getByText("Medicinas usadas")).toBeInTheDocument();
    expect(screen.getByText("Equipo en uso")).toBeInTheDocument();
    expect(screen.getByText("Membresías activas")).toBeInTheDocument();
    expect(screen.getByText("Preregistros mes")).toBeInTheDocument();

    expect(screen.getByText("$15,000")).toBeInTheDocument();
    expect(getEstadisticas).toHaveBeenCalledTimes(1);
  });

  test("muestra error si falla la carga", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    getEstadisticas.mockRejectedValueOnce(new Error("Error de servidor"));

    render(<EstadisticasPage />);

    expect(
      await screen.findByText("No se pudieron cargar las estadísticas.")
    ).toBeInTheDocument();

    console.error.mockRestore();
  });

  test("cambia a sección Pacientes", async () => {
    getEstadisticas.mockResolvedValueOnce(mockStats);

    render(<EstadisticasPage />);

    await screen.findByText("Dashboard");

    fireEvent.click(screen.getByRole("button", { name: "Pacientes" }));

    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("Vivos")).toBeInTheDocument();
    expect(screen.getByText("Fallecidos")).toBeInTheDocument();
    expect(screen.getByText("Nuevos mes")).toBeInTheDocument();
    expect(screen.getByText("Con válvula")).toBeInTheDocument();
    expect(screen.getByText("Con padecimientos")).toBeInTheDocument();
  });

  test("cambia a sección Citas", async () => {
    getEstadisticas.mockResolvedValueOnce(mockStats);

    render(<EstadisticasPage />);

    await screen.findByText("Dashboard");

    fireEvent.click(screen.getByRole("button", { name: "Citas" }));

    expect(screen.getByText("Total citas")).toBeInTheDocument();
    expect(screen.getAllByText("Atendidas").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Canceladas").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Pendientes").length).toBeGreaterThan(0);
    expect(screen.getByText("Detalle de citas por mes")).toBeInTheDocument();
  });

  test("cambia a sección Visitas e ingresos", async () => {
    getEstadisticas.mockResolvedValueOnce(mockStats);

    render(<EstadisticasPage />);

    await screen.findByText("Dashboard");

    fireEvent.click(screen.getByRole("button", { name: "Visitas e ingresos" }));

    expect(screen.getByText("Total visitas")).toBeInTheDocument();
    expect(screen.getAllByText("Ingresos totales").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Descuentos").length).toBeGreaterThan(0);
    expect(screen.getByText("Pago promedio")).toBeInTheDocument();
    expect(screen.getByText("Ingresos por mes")).toBeInTheDocument();
    expect(screen.getByText("Servicios por mes")).toBeInTheDocument();
  });

  test("cambia a sección Inventario", async () => {
    getEstadisticas.mockResolvedValueOnce(mockStats);

    render(<EstadisticasPage />);

    await screen.findByText("Dashboard");

    fireEvent.click(screen.getByRole("button", { name: "Inventario" }));

    expect(screen.getByText("Medicinas")).toBeInTheDocument();
    expect(screen.getByText("Total medicinas")).toBeInTheDocument();
    expect(screen.getByText("Stock total")).toBeInTheDocument();
    expect(screen.getByText("Bajo stock")).toBeInTheDocument();
    expect(screen.getByText("Valor inventario")).toBeInTheDocument();

    expect(screen.getByText("Equipo médico")).toBeInTheDocument();
    expect(screen.getByText("Total equipos")).toBeInTheDocument();
    expect(screen.getByText("Cantidad disponible")).toBeInTheDocument();
  });

  test("cambia a sección Notificaciones", async () => {
    getEstadisticas.mockResolvedValueOnce(mockStats);

    render(<EstadisticasPage />);

    await screen.findByText("Dashboard");

    fireEvent.click(screen.getByRole("button", { name: "Notificaciones" }));

    expect(screen.getByText("Este mes")).toBeInTheDocument();
    expect(screen.getByText("Rechazados")).toBeInTheDocument();
    expect(screen.getByText("Tasa aprobación")).toBeInTheDocument();
    expect(screen.getAllByText("Notificaciones por mes").length).toBeGreaterThan(0);
  });

  test("abre el modal de descargar reporte", async () => {
    getEstadisticas.mockResolvedValueOnce(mockStats);

    render(<EstadisticasPage />);

    await screen.findByText("Dashboard");

    const botones = screen.getAllByRole("button", {
      name: /descargar reporte/i,
    });

    fireEvent.click(botones[0]);

    expect(
      screen.getByText("Elige las secciones y el formato del archivo.")
    ).toBeInTheDocument();

    expect(screen.getByText("Secciones (8/8)")).toBeInTheDocument();
    expect(screen.getByText("Formato de exportación")).toBeInTheDocument();
  });

  test("cierra el modal", async () => {
    getEstadisticas.mockResolvedValueOnce(mockStats);

    render(<EstadisticasPage />);

    await screen.findByText("Dashboard");

    const botones = screen.getAllByRole("button", {
      name: /descargar reporte/i,
    });

    fireEvent.click(botones[0]);

    expect(
      screen.getByText("Elige las secciones y el formato del archivo.")
    ).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Cerrar"));

    await waitFor(() => {
      expect(
        screen.queryByText("Elige las secciones y el formato del archivo.")
      ).not.toBeInTheDocument();
    });
  });
});