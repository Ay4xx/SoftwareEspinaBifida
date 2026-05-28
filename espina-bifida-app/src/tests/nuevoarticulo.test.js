import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NuevoArticulo from "../componentes/nuevoarticulo/nuevoarticulo";

describe("NuevoArticulo", () => {
  const onCerrar = jest.fn();
  const onGuardado = jest.fn();

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ ok: true }),
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test("muestra mensaje de error cuando faltan campos obligatorios", async () => {
    render(<NuevoArticulo onCerrar={onCerrar} onGuardado={onGuardado} />);

    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));
    expect(screen.getByText(/Selecciona una categoría./i)).toBeInTheDocument();
  });

  test("permite guardar un artículo de medicina con todos los datos válidos", async () => {
    render(<NuevoArticulo onCerrar={onCerrar} onGuardado={onGuardado} />);

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], {
      target: { value: "medicina" },
    });

    fireEvent.change(screen.getByPlaceholderText(/Ej. Ibuprofeno 400mg/i), {
      target: { value: "Ibuprofeno" },
    });
    fireEvent.change(screen.getByPlaceholderText(/0\.00/i), {
      target: { value: "50" },
    });
    fireEvent.change(screen.getByPlaceholderText("0"), {
      target: { value: "20" },
    });

    fireEvent.change(screen.getByPlaceholderText(/Ej. Cápsula/i), {
      target: { value: "Cápsula" },
    });
    fireEvent.change(screen.getByPlaceholderText(/Ej. 400/i), {
      target: { value: "400" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));

    await waitFor(() => expect(screen.getByText(/Artículo guardado/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Aceptar/i }));
    expect(onGuardado).toHaveBeenCalled();
  });
});