import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import ModalPago from "../../componentes/historial/ModalPago";

describe("ModalPago", () => {
  const dataMock = {
    eventoId: 15,
    fecha: "05/06/2026",
    total: 1000,
  };

  const renderComponent = (props = {}) => {
    const defaultProps = {
      data: dataMock,
      pacienteId: 7,
      onClose: jest.fn(),
    };

    const utils = render(
      <ModalPago
        {...defaultProps}
        {...props}
      />
    );

    return {
      ...utils,
      props: {
        ...defaultProps,
        ...props,
      },
    };
  };

  const getInput = (container, name) => {
    return container.querySelector(`[name="${name}"]`);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = jest.fn();
  });

  test("renderiza correctamente el modal de pago", () => {
    const { container } = renderComponent();

    expect(screen.getByText("Realizar Pago")).toBeInTheDocument();
    expect(screen.getByText(/Visita del 05\/06\/2026/i)).toBeInTheDocument();
    expect(screen.getByText("$1,000")).toBeInTheDocument();

    expect(getInput(container, "metodoPago")).toBeInTheDocument();
    expect(getInput(container, "montoAbonado")).toBeInTheDocument();
    expect(getInput(container, "notas")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Guardar pago" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Cancelar" })
    ).toBeInTheDocument();
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

  test("muestra error si no se selecciona método de pago", async () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar pago" })
    );

    expect(
      await screen.findByText("Campos incompletos")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Debes seleccionar un método de pago.")
    ).toBeInTheDocument();

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test("muestra error si el monto está vacío", async () => {
    const { container } = renderComponent();

    fireEvent.change(getInput(container, "metodoPago"), {
      target: { value: "efectivo" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar pago" })
    );

    expect(
      await screen.findByText("Campos incompletos")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Debes ingresar un monto válido.")
    ).toBeInTheDocument();

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test("muestra error si el monto es menor o igual a cero", async () => {
    const { container } = renderComponent();

    fireEvent.change(getInput(container, "metodoPago"), {
      target: { value: "efectivo" },
    });

    fireEvent.change(getInput(container, "montoAbonado"), {
      target: { value: "0" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar pago" })
    );

    expect(
      await screen.findByText("Campos incompletos")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Debes ingresar un monto válido.")
    ).toBeInTheDocument();

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test("calcula y muestra el monto restante", () => {
    const { container } = renderComponent();

    const montoInput = getInput(container, "montoAbonado");

    fireEvent.change(montoInput, {
      target: { value: "300" },
    });

    expect(screen.getByDisplayValue("$700")).toBeInTheDocument();
  });

  test("envía el pago correctamente al backend", async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: true,
    });

    const { container } = renderComponent();

    fireEvent.change(getInput(container, "metodoPago"), {
      target: { value: "efectivo" },
    });

    fireEvent.change(getInput(container, "montoAbonado"), {
      target: { value: "600" },
    });

    fireEvent.change(getInput(container, "notas"), {
      target: { value: "Pago parcial" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar pago" })
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/pagos/guardar",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventoId: 15,
          pacienteId: 7,
          montoPagado: 600,
          metodoPago: "efectivo",
          notas: "Pago parcial",
          descuento: 400,
        }),
      }
    );

    expect(
      await screen.findByText("¡Pago registrado!")
    ).toBeInTheDocument();

    expect(
      screen.getByText("El pago fue registrado exitosamente.")
    ).toBeInTheDocument();
  });

  test("muestra error si el backend responde con error", async () => {
    globalThis.fetch.mockResolvedValueOnce({
      ok: false,
    });

    const { container } = renderComponent();

    fireEvent.change(getInput(container, "metodoPago"), {
      target: { value: "transferencia" },
    });

    fireEvent.change(getInput(container, "montoAbonado"), {
      target: { value: "500" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar pago" })
    );

    expect(
      await screen.findByText("Campos incompletos")
    ).toBeInTheDocument();

    expect(
      screen.getByText("No se pudo guardar el pago.")
    ).toBeInTheDocument();
  });

  test("muestra error si fetch falla", async () => {
    globalThis.fetch.mockRejectedValueOnce(new Error("Error de red"));

    const { container } = renderComponent();

    fireEvent.change(getInput(container, "metodoPago"), {
      target: { value: "tarjeta_debito" },
    });

    fireEvent.change(getInput(container, "montoAbonado"), {
      target: { value: "800" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar pago" })
    );

    expect(
      await screen.findByText("Campos incompletos")
    ).toBeInTheDocument();

    expect(
      screen.getByText("No se pudo guardar el pago.")
    ).toBeInTheDocument();
  });

  test("permite cerrar el popup de error con aceptar", async () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar pago" })
    );

    expect(
      await screen.findByText("Campos incompletos")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Aceptar" })
    );

    expect(screen.queryByText("Campos incompletos")).not.toBeInTheDocument();
  });
});