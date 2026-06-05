import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Medicamentos from "../../componentes/medicamentos/medicamentos";

describe("Medicamentos", () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ data: [
          { MEDICINA_ID: 1, DESCRIPCION: "Amoxicilina", PRECIO: 35 },
        ] }),
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("muestra el estado inicial sin medicamentos agregados", () => {
    render(
      <MemoryRouter initialEntries={["/medicamentos/5"]}>
        <Routes>
          <Route path="/medicamentos/:pacienteId" element={<Medicamentos />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/No hay medicamentos agregados./i)).toBeInTheDocument();
  });

  test("abre el popup y agrega un medicamento seleccionado", async () => {
    render(
      <MemoryRouter initialEntries={["/medicamentos/5"]}>
        <Routes>
          <Route path="/medicamentos/:pacienteId" element={<Medicamentos />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/\+ Agregar/i));
    await waitFor(() => expect(screen.getByText(/Amoxicilina/i)).toBeInTheDocument());

    fireEvent.click(screen.getByText(/Amoxicilina/i));
    fireEvent.click(screen.getByRole("button", { name: /Agregar \(1\)/i }));

    await waitFor(() => expect(screen.getByText(/Amoxicilina/i)).toBeInTheDocument());
    expect(screen.getByText(/Total/i)).toBeInTheDocument();
  });
});