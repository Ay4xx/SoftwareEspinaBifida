import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import EstadisticasPage from "../../pantallas/estadisticas/estadisticas";
import { getEstadisticas } from "../../services/estadisticasService";

jest.mock("../../services/estadisticasService", () => ({
  getEstadisticas: jest.fn(),
}));

jest.mock("../../componentes/statCard/statSection", () => {
  return function MockStatsSection({ title, description, cards }) {
    return (
      <section data-testid="stats-section">
        <h2>{title}</h2>
        <p>{description}</p>

        {cards.map((card) => (
          <div data-testid="stat-card" key={card.title}>
            <span>{card.title}</span>
            <strong>{card.value}</strong>
            {card.percentage && <small>{card.percentage}</small>}
          </div>
        ))}
      </section>
    );
  };
});

jest.mock("../../componentes/statCard/statSectionSkeleton", () => {
  return function MockStatsSectionSkeleton({ title, description }) {
    return (
      <section data-testid="stats-section-skeleton">
        <h2>{title}</h2>
        <p>{description}</p>
      </section>
    );
  };
});

jest.mock("../../pantallas/estadisticas/ReporteMensualModal", () => {
  return function MockReporteMensualModal({ open, onClose }) {
    if (!open) return null;

    return (
      <div data-testid="reporte-modal">
        <h2>Reporte Mensual</h2>
        <button onClick={onClose}>Cerrar modal</button>
      </div>
    );
  };
});

const mockStats = {
  totalArticulos: 100,
  existenciasNormal: 70,
  existenciasBajas: 20,
  existenciasAgotadas: 10,

  totalPacientes: 50,
  pacientesActivos: 35,
  pacientesInactivos: 15,
  pacientesNuevosMes: 5,

  visitasMes: 25,
  serviciosRealizados: 18,
  medicinasEntregadas: 12,
  equipoSinRegresar: 3,

  ingresosMes: 15000,
  registrosPendientes: 4,
  notificacionesMes: 8,
  totalReportes: 6,
};

describe("EstadisticasPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("debe mostrar skeletons mientras carga", () => {
    getEstadisticas.mockImplementationOnce(() => new Promise(() => {}));

    render(<EstadisticasPage />);

    expect(screen.getAllByTestId("stats-section-skeleton")).toHaveLength(4);
    expect(screen.getByText("Inventario")).toBeInTheDocument();
    expect(screen.getByText("Pacientes")).toBeInTheDocument();
    expect(screen.getByText("Servicios")).toBeInTheDocument();
    expect(screen.getByText("Reportes")).toBeInTheDocument();
  });

  test("debe cargar y mostrar las estadísticas", async () => {
    getEstadisticas.mockResolvedValueOnce(mockStats);

    render(<EstadisticasPage />);

    await waitFor(() => {
      expect(getEstadisticas).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText("TOTAL ARTÍCULOS")).toBeInTheDocument();
    expect(screen.getByText("EXISTENCIAS NORMAL")).toBeInTheDocument();
    expect(screen.getByText("EXISTENCIAS BAJAS")).toBeInTheDocument();
    expect(screen.getByText("EXISTENCIAS AGOTADAS")).toBeInTheDocument();

    expect(screen.getByText("TOTAL PACIENTES")).toBeInTheDocument();
    expect(screen.getByText("PACIENTES ACTIVOS")).toBeInTheDocument();
    expect(screen.getByText("PACIENTES INACTIVOS")).toBeInTheDocument();
    expect(screen.getByText("NUEVOS ESTE MES")).toBeInTheDocument();

    expect(screen.getByText("VISITAS DEL MES")).toBeInTheDocument();
    expect(screen.getByText("SERVICIOS REALIZADOS")).toBeInTheDocument();
    expect(screen.getByText("MEDICINAS ENTREGADAS")).toBeInTheDocument();
    expect(screen.getByText("EQUIPO SIN REGRESAR")).toBeInTheDocument();

    expect(screen.getByText("INGRESOS DEL MES")).toBeInTheDocument();
    expect(screen.getByText("$15,000")).toBeInTheDocument();
  });

  test("debe mostrar porcentajes correctos", async () => {
    getEstadisticas.mockResolvedValueOnce(mockStats);

    render(<EstadisticasPage />);

    await screen.findByText("TOTAL ARTÍCULOS");

    expect(screen.getByText("20.0%")).toBeInTheDocument();
    expect(screen.getByText("10.0%")).toBeInTheDocument();
    expect(screen.getAllByText("70.0%")).toHaveLength(2);
    expect(screen.getByText("30.0%")).toBeInTheDocument();
  });

  test("debe mostrar error si falla la carga de estadísticas", async () => {
    getEstadisticas.mockRejectedValueOnce(new Error("Error de servidor"));

    render(<EstadisticasPage />);

    await waitFor(() => {
      expect(
        screen.getByText("No se pudieron cargar las estadísticas.")
      ).toBeInTheDocument();
    });
  });

  test("debe abrir el modal al dar click en Descargar Reporte Mensual", async () => {
    getEstadisticas.mockResolvedValueOnce(mockStats);

    render(<EstadisticasPage />);

    await waitFor(() => {
      expect(screen.getByText("TOTAL ARTÍCULOS")).toBeInTheDocument();
    });

    const boton = screen.getByRole("button", {
      name: /descargar reporte mensual/i,
    });

    fireEvent.click(boton);

    expect(screen.getByTestId("reporte-modal")).toBeInTheDocument();
    expect(screen.getByText("Reporte Mensual")).toBeInTheDocument();
  });

  test("debe cerrar el modal", async () => {
    getEstadisticas.mockResolvedValueOnce(mockStats);

    render(<EstadisticasPage />);

    await waitFor(() => {
      expect(screen.getByText("TOTAL ARTÍCULOS")).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", { name: /descargar reporte mensual/i })
    );

    expect(screen.getByTestId("reporte-modal")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /cerrar modal/i }));

    expect(screen.queryByTestId("reporte-modal")).not.toBeInTheDocument();
  });
});