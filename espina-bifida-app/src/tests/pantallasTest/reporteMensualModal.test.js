import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import ReporteMensualModal from "../../pantallas/estadisticas/ReporteMensualModal";
import { descargarReporteMensual } from "../../services/estadisticasService";

jest.mock("../../services/estadisticasService", () => ({
  descargarReporteMensual: jest.fn(),
}));

jest.mock("lucide-react", () => {
  const React = require("react");

  const MockIcon = (props) =>
    React.createElement("svg", {
      "data-testid": "mock-icon",
      ...props,
    });

  return {
    X: MockIcon,
    Download: MockIcon,
    FileSpreadsheet: MockIcon,
    FileText: MockIcon,
    FileDown: MockIcon,
    Users: MockIcon,
    CalendarDays: MockIcon,
    Activity: MockIcon,
    Heart: MockIcon,
    Stethoscope: MockIcon,
    Pill: MockIcon,
    Package: MockIcon,
    Bell: MockIcon,
  };
});

describe("ReporteMensualModal", () => {
  let onClose;
  let createObjectURLSpy;
  let revokeObjectURLSpy;
  let appendChildSpy;
  let removeChildSpy;
  let clickSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    onClose = jest.fn();

    global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = jest.fn();

    appendChildSpy = jest.spyOn(document.body, "appendChild");
    removeChildSpy = jest.spyOn(document.body, "removeChild");

    clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();

    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
    clickSpy.mockRestore();
    consoleErrorSpy.mockRestore();

    delete global.URL.createObjectURL;
    delete global.URL.revokeObjectURL;
  });

  test("no renderiza nada si open es false", () => {
    const { container } = render(
      <ReporteMensualModal open={false} onClose={onClose} />
    );

    expect(container.firstChild).toBeNull();
  });

  test("renderiza título, descripción, secciones y formatos cuando open es true", () => {
    render(<ReporteMensualModal open={true} onClose={onClose} />);

    expect(screen.getAllByText("Descargar reporte").length).toBeGreaterThan(0);
    expect(
      screen.getByText("Elige las secciones y el formato del archivo.")
    ).toBeInTheDocument();

    expect(screen.getByText("Secciones (8/8)")).toBeInTheDocument();

    expect(screen.getByText("Pacientes")).toBeInTheDocument();
    expect(screen.getByText("Citas")).toBeInTheDocument();
    expect(screen.getByText("Visitas e ingresos")).toBeInTheDocument();
    expect(screen.getByText("Membresías")).toBeInTheDocument();
    expect(screen.getByText("Servicios")).toBeInTheDocument();
    expect(screen.getByText("Medicinas")).toBeInTheDocument();
    expect(screen.getByText("Equipo médico")).toBeInTheDocument();
    expect(screen.getByText("Notificaciones")).toBeInTheDocument();

    expect(screen.getByText("Formato de exportación")).toBeInTheDocument();
    expect(screen.getByText("Excel (.xlsx)")).toBeInTheDocument();
    expect(screen.getByText("PDF (.pdf)")).toBeInTheDocument();
    expect(screen.getByText("CSV (.csv)")).toBeInTheDocument();
  });

  test("cierra el modal al presionar el botón Cerrar", () => {
    render(<ReporteMensualModal open={true} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText("Cerrar"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("cierra el modal al hacer click en el overlay", () => {
    const { container } = render(
      <ReporteMensualModal open={true} onClose={onClose} />
    );

    const overlay = container.querySelector(".rm-overlay");

    fireEvent.click(overlay);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("no cierra el modal al hacer click dentro del contenido", () => {
    const { container } = render(
      <ReporteMensualModal open={true} onClose={onClose} />
    );

    const modal = container.querySelector(".rm-modal");

    fireEvent.click(modal);

    expect(onClose).not.toHaveBeenCalled();
  });

  test("todas las secciones están seleccionadas por defecto", () => {
    render(<ReporteMensualModal open={true} onClose={onClose} />);

    const checkboxes = screen.getAllByRole("checkbox");

    expect(checkboxes).toHaveLength(8);
    checkboxes.forEach((checkbox) => {
      expect(checkbox).toBeChecked();
    });
  });

  test("permite deseleccionar y volver a seleccionar una sección", () => {
    render(<ReporteMensualModal open={true} onClose={onClose} />);

    const pacientesCheckbox = screen.getByLabelText(/Pacientes/i);

    expect(screen.getByText("Secciones (8/8)")).toBeInTheDocument();
    expect(pacientesCheckbox).toBeChecked();

    fireEvent.click(pacientesCheckbox);

    expect(pacientesCheckbox).not.toBeChecked();
    expect(screen.getByText("Secciones (7/8)")).toBeInTheDocument();

    fireEvent.click(pacientesCheckbox);

    expect(pacientesCheckbox).toBeChecked();
    expect(screen.getByText("Secciones (8/8)")).toBeInTheDocument();
  });

  test("botón Ninguna deselecciona todas las secciones", () => {
    render(<ReporteMensualModal open={true} onClose={onClose} />);

    fireEvent.click(screen.getByText("Ninguna"));

    expect(screen.getByText("Secciones (0/8)")).toBeInTheDocument();

    screen.getAllByRole("checkbox").forEach((checkbox) => {
      expect(checkbox).not.toBeChecked();
    });
  });

  test("botón Todas selecciona todas las secciones", () => {
    render(<ReporteMensualModal open={true} onClose={onClose} />);

    fireEvent.click(screen.getByText("Ninguna"));
    expect(screen.getByText("Secciones (0/8)")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Todas"));

    expect(screen.getByText("Secciones (8/8)")).toBeInTheDocument();

    screen.getAllByRole("checkbox").forEach((checkbox) => {
      expect(checkbox).toBeChecked();
    });
  });

  test("Excel está seleccionado por defecto", () => {
    render(<ReporteMensualModal open={true} onClose={onClose} />);

    const excelRadio = screen.getByLabelText(/Excel/i);
    const pdfRadio = screen.getByLabelText(/PDF/i);
    const csvRadio = screen.getByLabelText(/CSV/i);

    expect(excelRadio).toBeChecked();
    expect(pdfRadio).not.toBeChecked();
    expect(csvRadio).not.toBeChecked();
  });

  test("permite cambiar el formato a PDF", () => {
    render(<ReporteMensualModal open={true} onClose={onClose} />);

    const pdfRadio = screen.getByLabelText(/PDF/i);

    fireEvent.click(pdfRadio);

    expect(pdfRadio).toBeChecked();
  });

  test("permite cambiar el formato a CSV", () => {
    render(<ReporteMensualModal open={true} onClose={onClose} />);

    const csvRadio = screen.getByLabelText(/CSV/i);

    fireEvent.click(csvRadio);

    expect(csvRadio).toBeChecked();
  });

  test("muestra error si intenta descargar sin seleccionar secciones", async () => {
    render(<ReporteMensualModal open={true} onClose={onClose} />);

    fireEvent.click(screen.getByText("Ninguna"));

    fireEvent.click(screen.getByRole("button", { name: /Descargar reporte/i }));

    expect(
      await screen.findByText("Selecciona al menos una sección.")
    ).toBeInTheDocument();

    expect(descargarReporteMensual).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  test("descarga reporte Excel correctamente", async () => {
    descargarReporteMensual.mockResolvedValueOnce(
      new Blob(["excel"], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
    );

    render(<ReporteMensualModal open={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /Descargar reporte/i }));

    await waitFor(() => {
      expect(descargarReporteMensual).toHaveBeenCalledWith({
        pacientes: true,
        citas: true,
        visitas: true,
        membresias: true,
        servicios: true,
        medicinas: true,
        equipo: true,
        notificaciones: true,
        tipoArchivo: "excel",
      });
    });

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

    jest.runOnlyPendingTimers();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("descarga reporte PDF correctamente", async () => {
    descargarReporteMensual.mockResolvedValueOnce(Buffer.from("pdf"));

    render(<ReporteMensualModal open={true} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText(/PDF/i));

    fireEvent.click(screen.getByRole("button", { name: /Descargar reporte/i }));

    await waitFor(() => {
      expect(descargarReporteMensual).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoArchivo: "pdf",
        })
      );
    });

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

    jest.runOnlyPendingTimers();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("descarga reporte CSV correctamente", async () => {
    descargarReporteMensual.mockResolvedValueOnce("campo,valor\ntotal,10");

    render(<ReporteMensualModal open={true} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText(/CSV/i));

    fireEvent.click(screen.getByRole("button", { name: /Descargar reporte/i }));

    await waitFor(() => {
      expect(descargarReporteMensual).toHaveBeenCalledWith(
        expect.objectContaining({
          tipoArchivo: "csv",
        })
      );
    });

    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(global.URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");

    jest.runOnlyPendingTimers();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("muestra estado de loading mientras descarga", async () => {
    descargarReporteMensual.mockImplementationOnce(
      () => new Promise(() => {})
    );

    render(<ReporteMensualModal open={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /Descargar reporte/i }));

    expect(
      await screen.findByText("Generando reporte…")
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Generando reporte/i })).toBeDisabled();
  });

  test("muestra error si falla la descarga", async () => {
    descargarReporteMensual.mockRejectedValueOnce(new Error("Error reporte"));

    render(<ReporteMensualModal open={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /Descargar reporte/i }));

    expect(
      await screen.findByText("Error al generar el reporte. Intenta de nuevo.")
    ).toBeInTheDocument();

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
    expect(onClose).not.toHaveBeenCalled();
  });

  test("no dispara dos descargas si ya está cargando", async () => {
    descargarReporteMensual.mockImplementationOnce(
      () => new Promise(() => {})
    );

    render(<ReporteMensualModal open={true} onClose={onClose} />);

    const boton = screen.getByRole("button", { name: /Descargar reporte/i });

    fireEvent.click(boton);
    fireEvent.click(boton);

    await waitFor(() => {
      expect(descargarReporteMensual).toHaveBeenCalledTimes(1);
    });
  });
});