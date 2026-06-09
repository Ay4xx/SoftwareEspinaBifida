import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import PopupAgregarCita from "../../componentes/agendacitas/popupagregarc";

jest.mock("../../componentes/agendacitas/popupagregarc.css", () => ({}));

jest.mock("lucide-react", () => ({
  X: () => <span data-testid="icon-x">X</span>,
}));

describe("PopupAgregarCita", () => {
  const selectedDate = new Date(2026, 5, 5);

  const renderComponent = (props = {}) => {
    const defaultProps = {
      isOpen: true,
      onClose: jest.fn(),
      selectedDate,
      onSuccess: jest.fn(),
    };

    const utils = render(
      <PopupAgregarCita
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

  test("no renderiza nada cuando isOpen es false", () => {
    render(
      <PopupAgregarCita
        isOpen={false}
        onClose={jest.fn()}
        selectedDate={selectedDate}
        onSuccess={jest.fn()}
      />
    );

    expect(screen.queryByText("Nueva cita")).not.toBeInTheDocument();
  });

  test("renderiza el formulario cuando isOpen es true", () => {
    const { container } = renderComponent();

    expect(screen.getByText("Nueva cita")).toBeInTheDocument();

    expect(getInput(container, "id_paciente")).toBeInTheDocument();
    expect(getInput(container, "hora_cita")).toBeInTheDocument();
    expect(getInput(container, "motivo")).toBeInTheDocument();
    expect(getInput(container, "notas")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Guardar cita" })
    ).toBeInTheDocument();
  });

  test("llama onClose al presionar el botón de cerrar", () => {
    const onClose = jest.fn();

    renderComponent({ onClose });

    fireEvent.click(screen.getByTestId("icon-x").closest("button"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("llama onClose al presionar cancelar", () => {
    const onClose = jest.fn();

    renderComponent({ onClose });

    fireEvent.click(
      screen.getByRole("button", { name: "Cancelar" })
    );

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("muestra error si falta el ID del paciente", async () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar cita" })
    );

    expect(
      await screen.findByText("Campos incompletos")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Debes ingresar el ID del paciente.")
    ).toBeInTheDocument();

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test("muestra error si falta la hora", async () => {
    const { container } = renderComponent();

    fireEvent.change(getInput(container, "id_paciente"), {
      target: { value: "1" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar cita" })
    );

    expect(
      await screen.findByText("Campos incompletos")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Debes seleccionar una hora para la cita.")
    ).toBeInTheDocument();

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test("muestra error si falta el motivo", async () => {
    const { container } = renderComponent();

    fireEvent.change(getInput(container, "id_paciente"), {
      target: { value: "1" },
    });

    fireEvent.change(getInput(container, "hora_cita"), {
      target: { value: "10:30" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar cita" })
    );

    expect(
      await screen.findByText("Campos incompletos")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Debes escribir el motivo de la cita.")
    ).toBeInTheDocument();

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test("envía la cita correctamente al backend", async () => {
    globalThis.fetch.mockResolvedValueOnce({
      json: async () => ({
        ok: true,
      }),
    });

    const { container } = renderComponent();

    fireEvent.change(getInput(container, "id_paciente"), {
      target: { value: "7" },
    });

    fireEvent.change(getInput(container, "hora_cita"), {
      target: { value: "09:45" },
    });

    fireEvent.change(getInput(container, "motivo"), {
      target: { value: "Consulta general" },
    });

    fireEvent.change(getInput(container, "notas"), {
      target: { value: "Paciente con seguimiento" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar cita" })
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/citas",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_paciente: "7",
          hora_cita: "09:45",
          estatus_cita: "PENDIENTE",
          motivo: "Consulta general",
          notas: "Paciente con seguimiento",
          fecha_cita: "2026-06-05",
        }),
      }
    );

    expect(
      await screen.findByText("¡Cita registrada!")
    ).toBeInTheDocument();

    expect(
      screen.getByText("La cita fue registrada exitosamente.")
    ).toBeInTheDocument();
  });

  test("deshabilita el botón mientras guarda", async () => {
    let resolveFetch;

    globalThis.fetch.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    const { container } = renderComponent();

    fireEvent.change(getInput(container, "id_paciente"), {
      target: { value: "7" },
    });

    fireEvent.change(getInput(container, "hora_cita"), {
      target: { value: "09:45" },
    });

    fireEvent.change(getInput(container, "motivo"), {
      target: { value: "Consulta general" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar cita" })
    );

    expect(
      screen.getByRole("button", { name: "Guardando..." })
    ).toBeDisabled();

    resolveFetch({
      json: async () => ({
        ok: true,
      }),
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Guardar cita" })
      ).toBeInTheDocument();
    });
  });

  test("al aceptar el popup de éxito llama onSuccess y onClose", async () => {
    const onSuccess = jest.fn();
    const onClose = jest.fn();

    globalThis.fetch.mockResolvedValueOnce({
      json: async () => ({
        ok: true,
      }),
    });

    const { container } = renderComponent({
      onSuccess,
      onClose,
    });

    fireEvent.change(getInput(container, "id_paciente"), {
      target: { value: "7" },
    });

    fireEvent.change(getInput(container, "hora_cita"), {
      target: { value: "09:45" },
    });

    fireEvent.change(getInput(container, "motivo"), {
      target: { value: "Consulta general" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar cita" })
    );

    expect(
      await screen.findByText("¡Cita registrada!")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Aceptar" })
    );

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("muestra error cuando falla el fetch", async () => {
    globalThis.fetch.mockRejectedValueOnce(new Error("Error de red"));

    const { container } = renderComponent();

    fireEvent.change(getInput(container, "id_paciente"), {
      target: { value: "7" },
    });

    fireEvent.change(getInput(container, "hora_cita"), {
      target: { value: "09:45" },
    });

    fireEvent.change(getInput(container, "motivo"), {
      target: { value: "Consulta general" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar cita" })
    );

    expect(
      await screen.findByText("Campos incompletos")
    ).toBeInTheDocument();

    expect(
      screen.getByText("No se pudo registrar la cita.")
    ).toBeInTheDocument();
  });

  test("permite cerrar el popup de error con aceptar sin llamar onSuccess", async () => {
    const onSuccess = jest.fn();
    const onClose = jest.fn();

    renderComponent({
      onSuccess,
      onClose,
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar cita" })
    );

    expect(
      await screen.findByText("Campos incompletos")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Aceptar" })
    );

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.queryByText("Campos incompletos")).not.toBeInTheDocument();
  });
});