import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import html2pdf from "html2pdf.js";
import ModalGenerarRecibo from "../../componentes/historial/ModalRecibo";

jest.mock("html2pdf.js", () => jest.fn());

const mockSave = jest.fn(() => Promise.resolve());

const mockFrom = jest.fn(() => ({
  save: mockSave,
}));

const mockSet = jest.fn(() => ({
  from: mockFrom,
}));

const mockHtml2PdfInstance = {
  set: mockSet,
  from: mockFrom,
  save: mockSave,
};

describe("ModalGenerarRecibo", () => {
  const visitasMock = [
    {
      fecha: "5/6/2026",
      servicios: [
        {
          nombre: "Consulta médica",
          precio: 500,
          cantidad: 1,
        },
      ],
      medicamentos: [
        {
          nombre: "Medicamento A",
          precio: 200,
          cantidad: 1,
        },
      ],
      equipo: [
        {
          nombre: "Equipo médico",
          precio: 300,
          cantidad: 1,
        },
      ],
    },
    {
      fecha: "10/6/2026",
      servicios: [
        {
          nombre: "Terapia",
          precio: 400,
          cantidad: 1,
        },
      ],
      medicamentos: [],
      equipo: [],
    },
  ];

  const renderComponent = (props = {}) => {
    const defaultProps = {
      visitas: visitasMock,
      pacienteId: 7,
      onClose: jest.fn(),
    };

    return render(
      <ModalGenerarRecibo
        {...defaultProps}
        {...props}
      />
    );
  };

  const getDayButton = (day) => {
    return screen
      .getAllByRole("button")
      .find(
        (button) =>
          button.textContent.trim() === String(day)
      );
  };

  beforeEach(() => {
  jest.clearAllMocks();

  mockSet.mockReturnValue(mockHtml2PdfInstance);
  mockFrom.mockReturnValue(mockHtml2PdfInstance);
  mockSave.mockResolvedValue();

  html2pdf.mockReturnValue(mockHtml2PdfInstance);
  });

  test("renderiza correctamente el modal para generar recibo", () => {
    renderComponent();

    expect(screen.getByText("Generar recibo")).toBeInTheDocument();

    expect(
      screen.getByText("Selecciona una fecha con visita")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "📄 Generar PDF" })
    ).toBeDisabled();

    expect(
      screen.getByRole("button", { name: "Cancelar" })
    ).toBeInTheDocument();
  });

  test("muestra el calendario con el mes de la primera visita", () => {
    renderComponent();

    expect(screen.getByText("Junio 2026")).toBeInTheDocument();

    expect(screen.getByText("Lu")).toBeInTheDocument();
    expect(screen.getByText("Ma")).toBeInTheDocument();
    expect(screen.getByText("Mi")).toBeInTheDocument();
    expect(screen.getByText("Ju")).toBeInTheDocument();
    expect(screen.getByText("Vi")).toBeInTheDocument();
    expect(screen.getByText("Sá")).toBeInTheDocument();
    expect(screen.getByText("Do")).toBeInTheDocument();
  });

  test("llama onClose al presionar cancelar", () => {
    const onClose = jest.fn();

    renderComponent({ onClose });

    fireEvent.click(
      screen.getByRole("button", { name: "Cancelar" })
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("llama onClose al presionar el botón de cerrar", () => {
    const onClose = jest.fn();

    renderComponent({ onClose });

    fireEvent.click(
      screen.getByRole("button", { name: "✕" })
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("llama onClose al hacer click en el backdrop", () => {
    const onClose = jest.fn();

    const { container } = renderComponent({ onClose });

    fireEvent.click(container.querySelector(".modal-backdrop"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("permite navegar al mes anterior y siguiente", () => {
    renderComponent();

    expect(screen.getByText("Junio 2026")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "‹" })
    );

    expect(screen.getByText("Mayo 2026")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "›" })
    );

    expect(screen.getByText("Junio 2026")).toBeInTheDocument();
  });

  test("permite seleccionar una fecha con visita y muestra resumen", () => {
    renderComponent();

    const diaCinco = getDayButton(5);

    expect(diaCinco).toBeInTheDocument();
    expect(diaCinco).not.toBeDisabled();

    fireEvent.click(diaCinco);

    expect(
      screen.getByText("Visita seleccionada: 5/6/2026")
    ).toBeInTheDocument();

    expect(screen.getByText("Resumen de la visita")).toBeInTheDocument();

    expect(screen.getByText("Consulta médica")).toBeInTheDocument();
    expect(screen.getByText("Medicamento A")).toBeInTheDocument();
    expect(screen.getByText("Equipo médico")).toBeInTheDocument();

    expect(screen.getByText("$500")).toBeInTheDocument();
    expect(screen.getByText("$200")).toBeInTheDocument();
    expect(screen.getByText("$300")).toBeInTheDocument();
    expect(screen.getByText("$1,000")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "📄 Generar PDF" })
    ).not.toBeDisabled();
  });

  test("no permite seleccionar días sin visita", () => {
    renderComponent();

    const diaUno = getDayButton(1);

    expect(diaUno).toBeInTheDocument();
    expect(diaUno).toBeDisabled();
  });

test("genera el PDF correctamente al seleccionar una visita", async () => {
  const onClose = jest.fn();

  renderComponent({ onClose });

  const diaCinco = getDayButton(5);

  expect(diaCinco).toBeInTheDocument();
  expect(diaCinco).not.toBeDisabled();

  fireEvent.click(diaCinco);

  fireEvent.click(
    screen.getByRole("button", { name: "📄 Generar PDF" })
  );

  expect(
    screen.getByRole("button", { name: "Generando…" })
  ).toBeDisabled();

  await waitFor(() => {
    expect(html2pdf).toHaveBeenCalledTimes(1);
  });

  expect(mockSet).toHaveBeenCalledWith(
    expect.objectContaining({
      margin: 10,
      filename: "recibo_7_5-6-2026.pdf",
      image: {
        type: "jpeg",
        quality: 0.98,
      },
      html2canvas: {
        scale: 2,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
    })
  );

  expect(mockFrom).toHaveBeenCalledTimes(1);
  expect(mockSave).toHaveBeenCalledTimes(1);

  await waitFor(() => {
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

  test("no genera PDF si no hay fecha seleccionada", () => {
    renderComponent();

    const botonGenerar = screen.getByRole("button", {
      name: "📄 Generar PDF",
    });

    expect(botonGenerar).toBeDisabled();

    fireEvent.click(botonGenerar);

    expect(mockSet).not.toHaveBeenCalled();
    expect(mockFrom).not.toHaveBeenCalled();
    expect(mockSave).not.toHaveBeenCalled();
  });
});