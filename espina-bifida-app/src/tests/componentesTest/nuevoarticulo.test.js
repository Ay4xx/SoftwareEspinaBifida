import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import NuevoArticulo from "../../componentes/nuevoarticulo/nuevoarticulo";

jest.mock("../../componentes/nuevoarticulo/nuevoarticulo.css", () => ({}));

jest.mock("lucide-react", () => ({
  X: () => <span data-testid="icon-x">X</span>,
}));

describe("NuevoArticulo", () => {
  const renderComponent = (props = {}) => {
    const defaultProps = {
      onCerrar: jest.fn(),
      onGuardado: jest.fn(),
    };

    return render(
      <NuevoArticulo
        {...defaultProps}
        {...props}
      />
    );
  };

  const getInput = (container, name) => {
    return container.querySelector(`[name="${name}"]`);
  };

  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = jest.fn();
  });

  test("renderiza correctamente el modal", () => {
    const { container } = renderComponent();

    expect(screen.getByText("Nuevo Artículo")).toBeInTheDocument();
    expect(screen.getByText("Categoría")).toBeInTheDocument();
    expect(screen.getByText("Nombre / Descripción")).toBeInTheDocument();
    expect(screen.getByText("Precio")).toBeInTheDocument();
    expect(screen.getByText("Cantidad Total")).toBeInTheDocument();

    expect(getInput(container, "categoria")).toBeInTheDocument();
    expect(getInput(container, "descripcion")).toBeInTheDocument();
    expect(getInput(container, "precio")).toBeInTheDocument();
    expect(getInput(container, "cantidad_total")).toBeInTheDocument();

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

  test("muestra error si falta descripción", () => {
    const { container } = renderComponent();

    fireEvent.change(getInput(container, "categoria"), {
      target: { value: "equipo" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar" })
    );

    expect(
      screen.getByText("El nombre es obligatorio.")
    ).toBeInTheDocument();
  });

  test("muestra error si falta precio", () => {
    const { container } = renderComponent();

    fireEvent.change(getInput(container, "categoria"), {
      target: { value: "equipo" },
    });

    fireEvent.change(getInput(container, "descripcion"), {
      target: { value: "Silla de ruedas" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar" })
    );

    expect(
      screen.getByText("El precio es obligatorio.")
    ).toBeInTheDocument();
  });

  test("muestra error si falta cantidad", () => {
    const { container } = renderComponent();

    fireEvent.change(getInput(container, "categoria"), {
      target: { value: "equipo" },
    });

    fireEvent.change(getInput(container, "descripcion"), {
      target: { value: "Silla de ruedas" },
    });

    fireEvent.change(getInput(container, "precio"), {
      target: { value: "1000" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar" })
    );

    expect(
      screen.getByText("La cantidad es obligatoria.")
    ).toBeInTheDocument();
  });

  test("muestra campos unidad y medición cuando la categoría es medicina", () => {
    const { container } = renderComponent();

    fireEvent.change(getInput(container, "categoria"), {
      target: { value: "medicina" },
    });

    expect(screen.getByText("Unidad")).toBeInTheDocument();
    expect(screen.getByText("Medición")).toBeInTheDocument();

    expect(getInput(container, "unidad")).toBeInTheDocument();
    expect(getInput(container, "medicion")).toBeInTheDocument();
  });

  test("muestra error si medicina no tiene unidad", () => {
    const { container } = renderComponent();

    fireEvent.change(getInput(container, "categoria"), {
      target: { value: "medicina" },
    });

    fireEvent.change(getInput(container, "descripcion"), {
      target: { value: "Ibuprofeno" },
    });

    fireEvent.change(getInput(container, "precio"), {
      target: { value: "50" },
    });

    fireEvent.change(getInput(container, "cantidad_total"), {
      target: { value: "10" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar" })
    );

    expect(
      screen.getByText("La unidad es obligatoria.")
    ).toBeInTheDocument();
  });

  test("muestra error si medicina no tiene medición", () => {
    const { container } = renderComponent();

    fireEvent.change(getInput(container, "categoria"), {
      target: { value: "medicina" },
    });

    fireEvent.change(getInput(container, "descripcion"), {
      target: { value: "Ibuprofeno" },
    });

    fireEvent.change(getInput(container, "precio"), {
      target: { value: "50" },
    });

    fireEvent.change(getInput(container, "cantidad_total"), {
      target: { value: "10" },
    });

    fireEvent.change(getInput(container, "unidad"), {
      target: { value: "Tableta" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar" })
    );

    expect(
      screen.getByText("La medición es obligatoria.")
    ).toBeInTheDocument();
  });

  test("guarda correctamente un equipo médico", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        ok: true,
      }),
    });

    const { container } = renderComponent();

    fireEvent.change(getInput(container, "categoria"), {
      target: { value: "equipo" },
    });

    fireEvent.change(getInput(container, "descripcion"), {
      target: { value: "Silla de ruedas" },
    });

    fireEvent.change(getInput(container, "precio"), {
      target: { value: "1500" },
    });

    fireEvent.change(getInput(container, "cantidad_total"), {
      target: { value: "3" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar" })
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/inventario/equipo",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          descripcion: "Silla de ruedas",
          precio: "1500",
          cantidad_total: "3",
        }),
      }
    );

    expect(
      await screen.findByText("Artículo guardado")
    ).toBeInTheDocument();

    expect(
      screen.getByText("El artículo fue registrado correctamente.")
    ).toBeInTheDocument();
  });

  test("guarda correctamente una medicina", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        ok: true,
      }),
    });

    const { container } = renderComponent();

    fireEvent.change(getInput(container, "categoria"), {
      target: { value: "medicina" },
    });

    fireEvent.change(getInput(container, "descripcion"), {
      target: { value: "Ibuprofeno" },
    });

    fireEvent.change(getInput(container, "precio"), {
      target: { value: "50" },
    });

    fireEvent.change(getInput(container, "cantidad_total"), {
      target: { value: "10" },
    });

    fireEvent.change(getInput(container, "unidad"), {
      target: { value: "Tableta" },
    });

    fireEvent.change(getInput(container, "medicion"), {
      target: { value: "400" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar" })
    );

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/inventario/medicina",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          descripcion: "Ibuprofeno",
          unidad: "Tableta",
          precio: "50",
          medicion: "400",
          cantidad_total: "10",
        }),
      }
    );

    expect(
      await screen.findByText("Artículo guardado")
    ).toBeInTheDocument();
  });

  test("llama onGuardado al aceptar mensaje de éxito", async () => {
    const onGuardado = jest.fn();

    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        ok: true,
      }),
    });

    const { container } = renderComponent({ onGuardado });

    fireEvent.change(getInput(container, "categoria"), {
      target: { value: "equipo" },
    });

    fireEvent.change(getInput(container, "descripcion"), {
      target: { value: "Andadera" },
    });

    fireEvent.change(getInput(container, "precio"), {
      target: { value: "800" },
    });

    fireEvent.change(getInput(container, "cantidad_total"), {
      target: { value: "2" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar" })
    );

    expect(
      await screen.findByText("Artículo guardado")
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Aceptar" })
    );

    expect(onGuardado).toHaveBeenCalledTimes(1);
  });

  test("muestra error si backend responde con error", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        ok: false,
        message: "No se pudo guardar.",
      }),
    });

    const { container } = renderComponent();

    fireEvent.change(getInput(container, "categoria"), {
      target: { value: "equipo" },
    });

    fireEvent.change(getInput(container, "descripcion"), {
      target: { value: "Andadera" },
    });

    fireEvent.change(getInput(container, "precio"), {
      target: { value: "800" },
    });

    fireEvent.change(getInput(container, "cantidad_total"), {
      target: { value: "2" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar" })
    );

    expect(
      await screen.findByText("No se pudo guardar.")
    ).toBeInTheDocument();
  });

  test("muestra error si falla la conexión", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Error de red"));

    const { container } = renderComponent();

    fireEvent.change(getInput(container, "categoria"), {
      target: { value: "equipo" },
    });

    fireEvent.change(getInput(container, "descripcion"), {
      target: { value: "Andadera" },
    });

    fireEvent.change(getInput(container, "precio"), {
      target: { value: "800" },
    });

    fireEvent.change(getInput(container, "cantidad_total"), {
      target: { value: "2" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Guardar" })
    );

    expect(
      await screen.findByText("Error de conexión con el servidor.")
    ).toBeInTheDocument();
  });
});