import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import ReporteMensualModal from "../../pantallas/estadisticas/ReporteMensualModal";
import { descargarReporteMensual } from "../../services/estadisticasService";

jest.mock("../../services/estadisticasService", () => ({
  descargarReporteMensual: jest.fn(),
}));

describe("ReporteMensualModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("no debe renderizar nada si open es false", () => {
    const { container } = render(
      <ReporteMensualModal open={false} onClose={jest.fn()} />
    );

    expect(container.firstChild).toBeNull();
  });

  test("debe renderizar el modal si open es true", () => {
    render(<ReporteMensualModal open={true} onClose={jest.fn()} />);

    expect(screen.getByText("Reporte Mensual")).toBeInTheDocument();
    expect(
      screen.getByText("Selecciona qué información deseas incluir en el reporte.")
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Inventario")).toBeChecked();
    expect(screen.getByLabelText("Pacientes")).toBeChecked();
    expect(screen.getByLabelText("Servicios")).toBeChecked();
    expect(screen.getByLabelText("Reportes")).toBeChecked();
  });

  test("debe cerrar el modal al dar click en el botón X", () => {
    const onClose = jest.fn();

    render(<ReporteMensualModal open={true} onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: /✕/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("debe permitir marcar y desmarcar checkboxes", () => {
    render(<ReporteMensualModal open={true} onClose={jest.fn()} />);

    const inventarioCheckbox = screen.getByLabelText("Inventario");
    const pacientesCheckbox = screen.getByLabelText("Pacientes");

    expect(inventarioCheckbox).toBeChecked();
    expect(pacientesCheckbox).toBeChecked();

    fireEvent.click(inventarioCheckbox);
    fireEvent.click(pacientesCheckbox);

    expect(inventarioCheckbox).not.toBeChecked();
    expect(pacientesCheckbox).not.toBeChecked();
  });

  test("debe permitir cambiar fechas", () => {
    render(<ReporteMensualModal open={true} onClose={jest.fn()} />);

    const inputsFecha = screen.getAllByDisplayValue("");

    const fechaInicioInput = inputsFecha[0];
    const fechaFinInput = inputsFecha[1];

    fireEvent.change(fechaInicioInput, {
      target: { value: "2026-05-01" },
    });

    fireEvent.change(fechaFinInput, {
      target: { value: "2026-05-29" },
    });

    expect(fechaInicioInput).toHaveValue("2026-05-01");
    expect(fechaFinInput).toHaveValue("2026-05-29");
  });

  test("debe permitir cambiar el tipo de archivo", () => {
    render(<ReporteMensualModal open={true} onClose={jest.fn()} />);

    const select = screen.getByRole("combobox");

    expect(select).toHaveValue("excel");

    fireEvent.change(select, {
      target: { value: "pdf" },
    });

    expect(select).toHaveValue("pdf");

    fireEvent.change(select, {
      target: { value: "csv" },
    });

    expect(select).toHaveValue("csv");
  });

  test("debe descargar reporte con los valores por defecto", async () => {
    const onClose = jest.fn();

    descargarReporteMensual.mockResolvedValueOnce({
      ok: true,
    });

    render(<ReporteMensualModal open={true} onClose={onClose} />);

    fireEvent.click(
      screen.getByRole("button", { name: /descargar reporte/i })
    );

    await waitFor(() => {
      expect(descargarReporteMensual).toHaveBeenCalledWith({
        inventario: true,
        pacientes: true,
        servicios: true,
        reportes: true,
        fechaInicio: "",
        fechaFin: "",
        tipoArchivo: "excel",
      });
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("debe descargar reporte con valores modificados", async () => {
    const onClose = jest.fn();

    descargarReporteMensual.mockResolvedValueOnce({
      ok: true,
    });

    render(<ReporteMensualModal open={true} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText("Inventario"));

    const inputsFecha = screen.getAllByDisplayValue("");
    const fechaInicioInput = inputsFecha[0];
    const fechaFinInput = inputsFecha[1];

    fireEvent.change(fechaInicioInput, {
      target: { value: "2026-05-01" },
    });

    fireEvent.change(fechaFinInput, {
      target: { value: "2026-05-29" },
    });

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "pdf" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /descargar reporte/i })
    );

    await waitFor(() => {
      expect(descargarReporteMensual).toHaveBeenCalledWith({
        inventario: false,
        pacientes: true,
        servicios: true,
        reportes: true,
        fechaInicio: "2026-05-01",
        fechaFin: "2026-05-29",
        tipoArchivo: "pdf",
      });
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("no debe cerrar el modal si falla la descarga", async () => {
    const onClose = jest.fn();

    descargarReporteMensual.mockRejectedValueOnce(new Error("Error descarga"));

    render(<ReporteMensualModal open={true} onClose={onClose} />);

    fireEvent.click(
      screen.getByRole("button", { name: /descargar reporte/i })
    );

    await waitFor(() => {
      expect(descargarReporteMensual).toHaveBeenCalledTimes(1);
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});