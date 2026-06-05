import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import RegistrarEntrada from "../../componentes/nuevoarticulo/registrararticulo";

jest.mock("../../componentes/nuevoarticulo/registrararticulo.css", () => ({}));

jest.mock("lucide-react", () => ({
  X: () => <span data-testid="icon-x">X</span>,
}));

describe("RegistrarEntrada", () => {
  const inventarioMock = [
    {
      ID: 1,
      TIPO: "medicina",
      DESCRIPCION: "Paracetamol",
      CANTIDAD_TOTAL: 30,
    },
    {
      ID: 2,
      TIPO: "equipo",
      DESCRIPCION: "Muletas",
      CANTIDAD_TOTAL: 4,
    },
  ];

  const renderComponent = (props = {}) => {
    const defaultProps = {
      onCerrar: jest.fn(),
      onGuardado: jest.fn(),
    };

    return render(
      <RegistrarEntrada
        {...defaultProps}
        {...props}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = jest.fn();
  });

  test("renderiza correctamente el modal", () => {
    renderComponent();

    expect(screen.getByText("Registrar Entrada")).toBeInTheDocument();
    expect(screen.getByText("Categoría")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Cancelar" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Guardar" })
    ).toBeInTheDocument();
  });

  test("llama onCerrar al presionar cancelar", () => {
    const onCerrar = jest.fn();

    renderComponent({ onCerrar });

    fireEvent.click(
      screen.getByRole("button", { name: "Cancelar" })
    );

    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  test("llama onCerrar al presionar el botón de cerrar", () => {
    const onCerrar = jest.fn();

    renderComponent({ onCerrar });

    fireEvent.click(screen.getByTestId("icon-x").closest("button"));

    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  test("muestra error si no selecciona categoría", () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar" })
    );

    expect(
      screen.getByText("Selecciona una categoría.")
    ).toBeInTheDocument();

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  test("carga artículos al seleccionar categoría", async () => {
    globalThis.fetch.mockResolvedValueOnce({
      json: async () => ({
        data: inventarioMock,
      }),
    });

    const { container } = renderComponent();

    const categoriaSelect = container.querySelectorAll("select")[0];

    fireEvent.change(categoriaSelect, {
      target: { value: "medicina" },
    });

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/inventario/"
      );
    });

    expect(await screen.findByText(/Paracetamol/i)).toBeInTheDocument();
    expect(screen.queryByText(/Muletas/i)).not.toBeInTheDocument();
  });

  test("muestra error si no selecciona artículo", async () => {
    globalThis.fetch.mockResolvedValueOnce({
      json: async () => ({
        data: inventarioMock,
      }),
    });

    const { container } = renderComponent();

    fireEvent.change(container.querySelectorAll("select")[0], {
      target: { value: "medicina" },
    });

    await screen.findByText(/Paracetamol/i);

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar" })
    );

    expect(
      screen.getByText("Selecciona un artículo.")
    ).toBeInTheDocument();
  });

  test("muestra campo cantidad al seleccionar artículo", async () => {
    globalThis.fetch.mockResolvedValueOnce({
      json: async () => ({
        data: inventarioMock,
      }),
    });

    const { container } = renderComponent();

    fireEvent.change(container.querySelectorAll("select")[0], {
      target: { value: "medicina" },
    });

    await screen.findByText(/Paracetamol/i);

    fireEvent.change(container.querySelectorAll("select")[1], {
      target: { value: "1" },
    });

    expect(screen.getByText("Cantidad a agregar")).toBeInTheDocument();
    expect(container.querySelector('input[type="number"]')).toBeInTheDocument();
  });

  test("muestra error si la cantidad es inválida", async () => {
    globalThis.fetch.mockResolvedValueOnce({
      json: async () => ({
        data: inventarioMock,
      }),
    });

    const { container } = renderComponent();

    fireEvent.change(container.querySelectorAll("select")[0], {
      target: { value: "medicina" },
    });

    await screen.findByText(/Paracetamol/i);

    fireEvent.change(container.querySelectorAll("select")[1], {
      target: { value: "1" },
    });

    fireEvent.change(container.querySelector('input[type="number"]'), {
      target: { value: "0" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar" })
    );

    expect(
      screen.getByText("La cantidad debe ser mayor a 0.")
    ).toBeInTheDocument();
  });

  test("registra correctamente entrada de medicina", async () => {
    globalThis.fetch
      .mockResolvedValueOnce({
        json: async () => ({
          data: inventarioMock,
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          ok: true,
        }),
      });

    const onGuardado = jest.fn();

    const { container } = renderComponent({ onGuardado });

    fireEvent.change(container.querySelectorAll("select")[0], {
      target: { value: "medicina" },
    });

    await screen.findByText(/Paracetamol/i);

    fireEvent.change(container.querySelectorAll("select")[1], {
      target: { value: "1" },
    });

    fireEvent.change(container.querySelector('input[type="number"]'), {
      target: { value: "5" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar" })
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/inventario/medicina/cantidad",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            medicinaId: "1",
            cantidad: 5,
          }),
        }
      );
    });

    expect(
      await screen.findByText("Entrada registrada")
    ).toBeInTheDocument();

    expect(
      screen.getByText("La cantidad fue actualizada correctamente.")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Aceptar" })
    );

    expect(onGuardado).toHaveBeenCalledTimes(1);
  });

  test("registra correctamente entrada de equipo", async () => {
    globalThis.fetch
      .mockResolvedValueOnce({
        json: async () => ({
          data: inventarioMock,
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          ok: true,
        }),
      });

    const { container } = renderComponent();

    fireEvent.change(container.querySelectorAll("select")[0], {
      target: { value: "equipo" },
    });

    await screen.findByText(/Muletas/i);

    fireEvent.change(container.querySelectorAll("select")[1], {
      target: { value: "2" },
    });

    fireEvent.change(container.querySelector('input[type="number"]'), {
      target: { value: "3" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar" })
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/inventario/equipo/cantidad",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            equipoId: "2",
            cantidad: 3,
          }),
        }
      );
    });

    expect(
      await screen.findByText("Entrada registrada")
    ).toBeInTheDocument();
  });

  test("muestra error si backend responde con error", async () => {
    globalThis.fetch
      .mockResolvedValueOnce({
        json: async () => ({
          data: inventarioMock,
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          ok: false,
          message: "No se pudo actualizar.",
        }),
      });

    const { container } = renderComponent();

    fireEvent.change(container.querySelectorAll("select")[0], {
      target: { value: "medicina" },
    });

    await screen.findByText(/Paracetamol/i);

    fireEvent.change(container.querySelectorAll("select")[1], {
      target: { value: "1" },
    });

    fireEvent.change(container.querySelector('input[type="number"]'), {
      target: { value: "5" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar" })
    );

    expect(
      await screen.findByText("No se pudo actualizar.")
    ).toBeInTheDocument();
  });

  test("muestra error si falla la conexión", async () => {
    globalThis.fetch
      .mockResolvedValueOnce({
        json: async () => ({
          data: inventarioMock,
        }),
      })
      .mockRejectedValueOnce(new Error("Error de red"));

    const { container } = renderComponent();

    fireEvent.change(container.querySelectorAll("select")[0], {
      target: { value: "medicina" },
    });

    await screen.findByText(/Paracetamol/i);

    fireEvent.change(container.querySelectorAll("select")[1], {
      target: { value: "1" },
    });

    fireEvent.change(container.querySelector('input[type="number"]'), {
      target: { value: "5" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar" })
    );

    expect(
      await screen.findByText("Error de conexión con el servidor.")
    ).toBeInTheDocument();
  });
});