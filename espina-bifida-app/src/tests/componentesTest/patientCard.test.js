import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import PatientCard from "../../componentes/patientCard/patientCard";

jest.mock("../../componentes/patientCard/patientCard.css", () => ({}));

jest.mock("../../assets/placeholder.png", () => "placeholder.png");

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("lucide-react", () => ({
  MapPin: () => <span data-testid="icon-map">MapPin</span>,
  Calendar: () => <span data-testid="icon-calendar">Calendar</span>,
  Plus: () => <span data-testid="icon-plus">Plus</span>,
  Pencil: () => <span data-testid="icon-pencil">Pencil</span>,
}));

describe("PatientCard", () => {
  const pacienteMock = {
    id: 10,
    name: "Juan Pérez",
    subtitle: "Paciente infantil",
    status: "Inactivo",
    foto: "/uploads/juan.png",
    location: "Monterrey, Nuevo León",
    ultimaVisita: "2026-06-05",
    etapaVida: "Infancia",
  };

  const renderComponent = (props = {}) => {
    const defaultProps = {
      patient: pacienteMock,
    };

    return render(
      <PatientCard
        {...defaultProps}
        {...props}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();

    globalThis.fetch = jest.fn();

    Storage.prototype.getItem = jest.fn(() =>
      JSON.stringify({
        tipoUsuario: "USUARIO",
      })
    );
  });

  test("renderiza correctamente la información del paciente", () => {
    renderComponent();

    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Paciente infantil")).toBeInTheDocument();
    expect(screen.getByText("Monterrey, Nuevo León")).toBeInTheDocument();
    expect(screen.getByText("Infancia")).toBeInTheDocument();
    expect(screen.getByText("Inactivo")).toBeInTheDocument();

    expect(screen.getByTestId("icon-map")).toBeInTheDocument();
    expect(screen.getByTestId("icon-calendar")).toBeInTheDocument();
    expect(screen.getByTestId("icon-plus")).toBeInTheDocument();
  });

  test("muestra la foto del paciente cuando existe", () => {
    renderComponent();

    const img = screen.getByAltText("Juan Pérez");

    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute(
      "src",
      "http://localhost:3001/uploads/juan.png"
    );
  });

  test("usa placeholder cuando el paciente no tiene foto", () => {
    renderComponent({
      patient: {
        ...pacienteMock,
        foto: "",
      },
    });

    const img = screen.getByAltText("Juan Pérez");

    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "placeholder.png");
  });

  test("muestra Sin registro cuando no hay última visita", () => {
    renderComponent({
      patient: {
        ...pacienteMock,
        ultimaVisita: null,
      },
    });

    expect(screen.getByText("Sin registro")).toBeInTheDocument();
  });

  test("navega a inventario al presionar Agregar", () => {
    renderComponent();

    fireEvent.click(
      screen.getByRole("button", { name: /Agregar/i })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/inventario/10");
  });

  test("muestra botón editar cuando el usuario no es administrador", () => {
    renderComponent();

    expect(screen.getByTestId("icon-pencil")).toBeInTheDocument();
  });

  test("navega a registro al presionar editar", () => {
    renderComponent();

    fireEvent.click(screen.getByTestId("icon-pencil").closest("button"));

    expect(mockNavigate).toHaveBeenCalledWith("/registro", {
      state: {
        pacienteId: 10,
        modoRevision: true,
      },
    });
  });

  test("no muestra botón editar cuando el usuario es administrador", () => {
    Storage.prototype.getItem = jest.fn(() =>
      JSON.stringify({
        tipoUsuario: "ADMINISTRADOR",
      })
    );

    renderComponent();

    expect(screen.queryByTestId("icon-pencil")).not.toBeInTheDocument();
  });

  test("abre editor de membresía al hacer click en el estatus inactivo", () => {
    renderComponent();

    fireEvent.click(screen.getByText("Inactivo"));

    expect(screen.getByText("Fecha de inicio")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Activar membresía" })
    ).toBeInTheDocument();
  });

  test("activa membresía correctamente", async () => {
    globalThis.fetch.mockResolvedValueOnce({
      json: async () => ({
        ok: true,
      }),
    });

    renderComponent();

    fireEvent.click(screen.getByText("Inactivo"));

    const inputFecha = screen.getByLabelText("Fecha de inicio");

    fireEvent.change(inputFecha, {
      target: {
        value: "2026-06-05",
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Activar membresía" })
    );

    expect(
      screen.getByRole("button", { name: "Procesando..." })
    ).toBeDisabled();

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/membresia/activar/10",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fechaInicio: "2026-06-05",
          }),
        }
      );
    });

    expect(
      await screen.findByText("Membresía activada correctamente.")
    ).toBeInTheDocument();

    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  test("muestra error si falla la activación de membresía", async () => {
    globalThis.fetch.mockResolvedValueOnce({
      json: async () => ({
        ok: false,
        message: "No se pudo activar.",
      }),
    });

    renderComponent();

    fireEvent.click(screen.getByText("Inactivo"));

    fireEvent.click(
      screen.getByRole("button", { name: "Activar membresía" })
    );

    expect(
      await screen.findByText("No se pudo activar.")
    ).toBeInTheDocument();
  });

  test("muestra mensaje genérico si hay error de conexión al activar", async () => {
    globalThis.fetch.mockRejectedValueOnce(new Error());

    renderComponent();

    fireEvent.click(screen.getByText("Inactivo"));

    fireEvent.click(
      screen.getByRole("button", { name: "Activar membresía" })
    );

    expect(
      await screen.findByText("No se pudo activar la membresía.")
    ).toBeInTheDocument();
  });

  test("abre editor para desactivar membresía cuando está activa", () => {
    renderComponent({
      patient: {
        ...pacienteMock,
        status: "Activo",
      },
    });

    fireEvent.click(screen.getByText("Activo"));

    expect(screen.getByText("Membresía activa")).toBeInTheDocument();

    expect(
      screen.getByText("Puedes desactivar esta membresía desde aquí.")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Desactivar membresía" })
    ).toBeInTheDocument();
  });

  test("desactiva membresía correctamente", async () => {
    globalThis.fetch.mockResolvedValueOnce({
      json: async () => ({
        ok: true,
      }),
    });

    renderComponent({
      patient: {
        ...pacienteMock,
        status: "Activo",
      },
    });

    fireEvent.click(screen.getByText("Activo"));

    fireEvent.click(
      screen.getByRole("button", { name: "Desactivar membresía" })
    );

    expect(
      screen.getByRole("button", { name: "Procesando..." })
    ).toBeDisabled();

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/membresia/desactivar/10",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    });

    expect(
      await screen.findByText("Membresía desactivada correctamente.")
    ).toBeInTheDocument();

    expect(screen.getByText("Inactivo")).toBeInTheDocument();
  });

  test("muestra error si falla la desactivación de membresía", async () => {
    globalThis.fetch.mockResolvedValueOnce({
      json: async () => ({
        ok: false,
        message: "No se pudo desactivar.",
      }),
    });

    renderComponent({
      patient: {
        ...pacienteMock,
        status: "Activo",
      },
    });

    fireEvent.click(screen.getByText("Activo"));

    fireEvent.click(
      screen.getByRole("button", { name: "Desactivar membresía" })
    );

    expect(
      await screen.findByText("No se pudo desactivar.")
    ).toBeInTheDocument();
  });

  test("muestra mensaje genérico si hay error de conexión al desactivar", async () => {
    globalThis.fetch.mockRejectedValueOnce(new Error());

    renderComponent({
      patient: {
        ...pacienteMock,
        status: "Activo",
      },
    });

    fireEvent.click(screen.getByText("Activo"));

    fireEvent.click(
      screen.getByRole("button", { name: "Desactivar membresía" })
    );

    expect(
      await screen.findByText("No se pudo desactivar la membresía.")
    ).toBeInTheDocument();
  });

  test("actualiza el estado de membresía cuando cambia el prop patient.status", () => {
    const { rerender } = render(
      <PatientCard patient={pacienteMock} />
    );

    expect(screen.getByText("Inactivo")).toBeInTheDocument();

    rerender(
      <PatientCard
        patient={{
          ...pacienteMock,
          status: "Activo",
        }}
      />
    );

    expect(screen.getByText("Activo")).toBeInTheDocument();
  });
});