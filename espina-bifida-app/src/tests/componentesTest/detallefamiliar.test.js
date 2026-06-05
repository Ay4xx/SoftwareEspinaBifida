import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import VisualizarFamiliar from "../../componentes/detallefamiliar/detallefamiliar";

describe("VisualizarFamiliar", () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve([
            {
              PADRE_EDAD: "45",
              PADRE_ESCOLARIDAD: "Licenciatura",
              PADRE_OCUPACION: "Ingeniero",
              PADRE_LUGAR_NACIMIENTO: "Monterrey",
              PADRE_SEGURO: "IMSS",
              MADRE_EDAD: "42",
              MADRE_ESCOLARIDAD: "Bachillerato",
              MADRE_OCUPACION: "Maestra",
              MADRE_LUGAR_NACIMIENTO: "Monterrey",
              MADRE_SEGURO: "ISSSTE",
              ACIDO_FOLICO: "Sí",
              CITAS_CONTROL: "3",
              ADICCIONES: "Ninguna",
              HIJO_DTN: "No",
              FAMILIAR_DTN: "No",
              EXPO_TOXICOS: "No",
              DESCRIPCION_EXPO_TOXICOS: "",
            },
          ]),
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("muestra la información familiar después de cargar los datos", async () => {
    render(
      <MemoryRouter initialEntries={["/familiar/123"]}>
        <Routes>
          <Route path="/familiar/:pacienteId" element={<VisualizarFamiliar />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/Información Familiar/i)).toBeInTheDocument());
    expect(screen.getByText(/Padre/i)).toBeInTheDocument();
    expect(screen.getByText(/45/i)).toBeInTheDocument();
    expect(screen.getByText(/Ingeniero/i)).toBeInTheDocument();
    expect(screen.getByText(/Madre/i)).toBeInTheDocument();
    expect(screen.getByText(/Maestra/i)).toBeInTheDocument();
    expect(screen.getByText(/Antecedentes/i)).toBeInTheDocument();
    expect(screen.getByText(/Ninguna/i)).toBeInTheDocument();
  });
});