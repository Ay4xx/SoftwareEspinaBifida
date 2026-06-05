import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import EliminarArticulo from "../../componentes/nuevoarticulo/eliminararticulo";

jest.mock("../../componentes/nuevoarticulo/eliminararticulo.css", () => ({}));

jest.mock("lucide-react", () => ({
  X: () => <span data-testid="icon-x">X</span>,
}));

describe("EliminarArticulo", () => {
  const inventarioMock = [
    {
      ID: 1,
      TIPO: "medicina",
      DESCRIPCION: "Ibuprofeno",
      CANTIDAD_TOTAL: 20,
    },
    {
      ID: 2,
      TIPO: "equipo",
      DESCRIPCION: "Silla de ruedas",
      CANTIDAD_TOTAL: 5,
    },
  ];

  const renderComponent = (props = {}) => {
    const defaultProps = {
      onCerrar: jest.fn(),
      onGuardado: jest.fn(),
    };

    return render(
      <EliminarArticulo
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

    expect(screen.getByText("Eliminar Artículo")).toBeInTheDocument();
    expect(screen.getByText("Categoría")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Cancelar" })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Eliminar" })
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
      screen.getByRole("button", { name: "Eliminar" })
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

    const selects = container.querySelectorAll("select");
    const categoriaSelect = selects[0];

    fireEvent.change(categoriaSelect, {
      target: { value: "medicina" },
    });

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/inventario/"
      );
    });

    expect(await screen.findByText(/Ibuprofeno/i)).toBeInTheDocument();
    expect(screen.queryByText(/Silla de ruedas/i)).not.toBeInTheDocument();
  });

  test("muestra error si no selecciona artículo", async () => {
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

    await screen.findByText(/Ibuprofeno/i);

    fireEvent.click(
      screen.getByRole("button", { name: "Eliminar" })
    );

    expect(
      screen.getByText("Selecciona un artículo.")
    ).toBeInTheDocument();
  });

  test("elimina correctamente un artículo", async () => {
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

    const categoriaSelect = container.querySelectorAll("select")[0];

    fireEvent.change(categoriaSelect, {
      target: { value: "medicina" },
    });

    await screen.findByText(/Ibuprofeno/i);

    const articuloSelect = container.querySelectorAll("select")[1];

    fireEvent.change(articuloSelect, {
      target: { value: "1" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Eliminar" })
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/inventario/medicina/1",
        {
          method: "DELETE",
        }
      );
    });

    expect(
      await screen.findByText("Artículo eliminado")
    ).toBeInTheDocument();

    expect(
      screen.getByText("El artículo fue eliminado correctamente.")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Aceptar" })
    );

    expect(onGuardado).toHaveBeenCalledTimes(1);
  });

  test("muestra error si el backend responde con error", async () => {
    globalThis.fetch
      .mockResolvedValueOnce({
        json: async () => ({
          data: inventarioMock,
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          ok: false,
          message: "No se pudo eliminar.",
        }),
      });

    const { container } = renderComponent();

    fireEvent.change(container.querySelectorAll("select")[0], {
      target: { value: "medicina" },
    });

    await screen.findByText(/Ibuprofeno/i);

    fireEvent.change(container.querySelectorAll("select")[1], {
      target: { value: "1" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Eliminar" })
    );

    expect(
      await screen.findByText("No se pudo eliminar.")
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

    await screen.findByText(/Ibuprofeno/i);

    fireEvent.change(container.querySelectorAll("select")[1], {
      target: { value: "1" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Eliminar" })
    );

    expect(
      await screen.findByText("Error de conexión con el servidor.")
    ).toBeInTheDocument();
  });
});