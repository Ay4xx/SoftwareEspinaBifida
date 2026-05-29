import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import VisualizarHistorial from "../../componentes/historial/historial";

describe("VisualizarHistorial", () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve([
            {
              FECHA_EVENTO: "2026-05-20T00:00:00.000Z",
              TIPO: "servicio",
              NOMBRE: "Consulta general",
              PRECIO: 150,
            },
            {
              FECHA_EVENTO: "2026-05-20T00:00:00.000Z",
              TIPO: "medicamento",
              NOMBRE: "Paracetamol",
              PRECIO: 50,
            },
          ]),
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("muestra el historial y el total de la visita", async () => {
    render(
      <MemoryRouter initialEntries={["/historial/77"]}>
        <Routes>
          <Route path="/historial/:pacienteId" element={<VisualizarHistorial />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/Consulta general/i)).toBeInTheDocument());
    expect(screen.getByText(/Paracetamol/i)).toBeInTheDocument();
    expect(screen.getByText(/Total/i)).toBeInTheDocument();
    expect(screen.getByText(/\$\s*200/)).toBeInTheDocument();
  });
});