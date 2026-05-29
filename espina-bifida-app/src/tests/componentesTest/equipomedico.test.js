import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import EquipoMedico from "../../componentes/equipomedico/equipomedico";

describe("EquipoMedico", () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve({ data: [
          { EQUIPO_M_ID: 1, DESCRIPCION: "Silla de ruedas", PRECIO: 120 },
        ] }),
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("muestra estado vacío antes de agregar equipo", () => {
    render(
      <MemoryRouter initialEntries={["/equipomedico/100"]}>
        <Routes>
          <Route path="/equipomedico/:pacienteId" element={<EquipoMedico />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/No hay equipo médico agregado./i)).toBeInTheDocument();
  });

  test("abre el popup y agrega un equipo médico seleccionado", async () => {
    render(
      <MemoryRouter initialEntries={["/equipomedico/100"]}>
        <Routes>
          <Route path="/equipomedico/:pacienteId" element={<EquipoMedico />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/\+ Agregar/i));

    await waitFor(() => expect(screen.getByText(/Silla de ruedas/i)).toBeInTheDocument());

    fireEvent.click(screen.getByText(/Silla de ruedas/i));
    fireEvent.click(screen.getByRole("button", { name: /Agregar \(1\)/i }));

    await waitFor(() => expect(screen.getByText(/Silla de ruedas/i)).toBeInTheDocument());
    expect(screen.getByText(/Total/i)).toBeInTheDocument();
  });
});