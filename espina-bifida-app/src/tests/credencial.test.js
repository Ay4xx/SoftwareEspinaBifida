import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Credencial from "../componentes/credencial/credencial";
import { MemoryRouter } from "react-router-dom";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ pacienteId: "1" }),
    useNavigate: () => mockNavigate,
  };
});

jest.mock("html-to-image", () => ({
  toPng: jest.fn(() => Promise.resolve("data:image/png;base64,fake")),
}));

const mockAddImage = jest.fn();
const mockSave = jest.fn();

jest.mock("jspdf", () => ({
  jsPDF: jest.fn().mockImplementation(() => ({
    addImage: mockAddImage,
    save: mockSave,
  })),
}));

describe("Credencial", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("muestra loading inicialmente", () => {
    global.fetch = jest.fn(() => new Promise(() => {}));

    render(
      <MemoryRouter>
        <Credencial />
      </MemoryRouter>
    );

    expect(screen.getByText("Cargando credencial...")).toBeInTheDocument();
  });

  test("renderiza datos correctamente cuando fetch es exitoso", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            ok: true,
            data: {
              nombre: "Juan Pérez",
              folio: "001",
              direccion: "Monterrey",
              telCasa: "123456",
              padres: "Padre Madre",
              fechaExpedicion: "01/01/2020",
              tipoSangre: "A+",
              valvula: "Sí",
              accidenteAvisar: "Madre",
              telefonoEmergencia: "999999",
              correo: "test@mail.com",
              fechaNacimiento: "01/01/2000",
              lugarNacimiento: "Monterrey",
              hospital: "IMSS",
              fotoPrincipal: null,
              fotoMini: null,
            },
          }),
      })
    );

    render(
      <MemoryRouter>
        <Credencial />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument();
    });

    expect(screen.getByText(/001/)).toBeInTheDocument();
    expect(screen.getByText(/Dirección:/)).toBeInTheDocument();
    expect(screen.getByText(/A\+/)).toBeInTheDocument();
    expect(screen.getByText(/Sí/)).toBeInTheDocument();
  });

  test("muestra error si falla el fetch", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            ok: false,
            message: "Error backend",
          }),
      })
    );

    render(
      <MemoryRouter>
        <Credencial />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Error: Error backend")).toBeInTheDocument();
    });
  });

  test("botón volver ejecuta navigate(-1)", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            ok: false,
            message: "Error backend",
          }),
      })
    );

    render(
      <MemoryRouter>
        <Credencial />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Volver")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Volver"));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test("renderiza botones de descarga", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            ok: true,
            data: {
              nombre: "Juan",
              folio: "001",
            },
          }),
      })
    );

    render(
      <MemoryRouter>
        <Credencial />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Descargar PNG")).toBeInTheDocument();
    });

    expect(screen.getByText("Descargar PDF")).toBeInTheDocument();
  });
});