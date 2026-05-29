import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import RegistrarConsulta from "../componentes/registrocitas/registrocitas";

describe("RegistrarConsulta", () => {
  beforeEach(() => {
    global.fetch = jest.fn()
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ data: [
            {
              MEDICO_ID: 1,
              NOMBRE: "Laura",
              APELLIDO: "Gómez",
              ESPECIALIDAD: "Pediatría",
              SERVICIO_ID: 10,
              COSTO: 250,
            },
          ] }),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ ok: true }),
        })
      );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("muestra popup de datos incompletos cuando no hay selección", async () => {
    render(
      <MemoryRouter initialEntries={["/registrocitas/9"]}>
        <Routes>
          <Route path="/registrocitas/:pacienteId" element={<RegistrarConsulta />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByRole("button", { name: /Registrar Consulta/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /Registrar Consulta/i }));

    expect(await screen.findByText(/Datos incompletos/i)).toBeInTheDocument();
  });

  test("permite registrar consulta cuando se completan los datos", async () => {
    render(
      <MemoryRouter initialEntries={["/registrocitas/9"]}>
        <Routes>
          <Route path="/registrocitas/:pacienteId" element={<RegistrarConsulta />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getAllByRole("combobox").length).toBeGreaterThanOrEqual(2));

    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0], { target: { value: "09:30" } });
    fireEvent.change(selects[1], { target: { value: "1" } });

    fireEvent.click(screen.getByRole("button", { name: /Registrar Consulta/i }));

    expect(await screen.findByText(/Consulta registrada/i)).toBeInTheDocument();
  });
});