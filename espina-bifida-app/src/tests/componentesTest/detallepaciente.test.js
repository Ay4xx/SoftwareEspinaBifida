import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import VisualizarInfo from "../../componentes/detallepaciente/detallepaciente";

describe("VisualizarInfo", () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            data: {
              NOMBRE: "Ana",
              APELLIDO: "Martínez",
              EMAIL: "ana@mail.com",
              TELEFONO_CELULAR: "5511122233",
              ESTADO_RESIDENCIA: "NL",
              FECHA_ALTA: "2026-02-10T00:00:00.000Z",
              FECHA_FIN: "2026-06-30T00:00:00.000Z",
              VIVE: "SI",
              foto: null,
            },
          }),
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("muestra el detalle del paciente cuando la API responde", async () => {
    render(
      <MemoryRouter initialEntries={["/paciente/42"]}>
        <Routes>
          <Route path="/paciente/:pacienteId" element={<VisualizarInfo />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/Ana Martínez/i)).toBeInTheDocument());
    expect(screen.getByText(/ana@mail.com/i)).toBeInTheDocument();
    expect(screen.getByText(/5511122233/i)).toBeInTheDocument();
    expect(screen.getByText(/NL/i)).toBeInTheDocument();
    expect(screen.getByText(/Registro:/i)).toBeInTheDocument();
    expect(screen.getByText(/Activo/i)).toBeInTheDocument();
  });
});