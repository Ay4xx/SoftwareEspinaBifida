import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

import UsuariosPage from "../../pantallas/usuario/usuario";

jest.mock("lucide-react", () => ({
  Search: () => <span data-testid="search-icon">SearchIcon</span>,
}));

jest.mock("../../componentes/patientCard/patientCard", () => {
  return function MockPatientCard({ patient }) {
    return (
      <div data-testid="patient-card">
        <h3>{patient.name}</h3>
        <p>{patient.status}</p>
      </div>
    );
  };
});

jest.mock("../../componentes/patientCard/patientCardSkeleton", () => {
  return function MockPatientCardSkeleton() {
    return <div data-testid="patient-card-skeleton">Cargando...</div>;
  };
});

globalThis.fetch = jest.fn();

const mockPatients = [
  {
    id: 1,
    name: "Juan Pérez",
    status: "Activo",
  },
  {
    id: 2,
    name: "María García",
    status: "Inactivo",
  },
  {
    id: 3,
    name: "Carlos López",
    status: "Activo",
  },
];

const renderUsuariosPage = () => {
  return render(
    <MemoryRouter>
      <UsuariosPage />
    </MemoryRouter>
  );
};

describe("UsuariosPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: mockPatients,
      }),
    });
  });

  test("debe renderizar la página de usuarios", async () => {
    renderUsuariosPage();

    expect(screen.getByPlaceholderText(/buscar paciente/i)).toBeInTheDocument();
    expect(screen.getByText(/todos/i)).toBeInTheDocument();
    expect(screen.getByText(/^activos/i)).toBeInTheDocument();
    expect(screen.getByText(/inactivos/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    });
  });

  test("debe mostrar skeletons mientras carga", () => {
    fetch.mockImplementationOnce(
      () =>
        new Promise(() => {
          // Simula carga infinita
        })
    );

    renderUsuariosPage();

    const skeletons = screen.getAllByTestId("patient-card-skeleton");
    expect(skeletons).toHaveLength(6);
  });

  test("debe cargar pacientes desde la API", async () => {
    renderUsuariosPage();

    expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/pacientes/cards?search="
    );

    await waitFor(() => {
        expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
        expect(screen.getByText("María García")).toBeInTheDocument();
        expect(screen.getByText("Carlos López")).toBeInTheDocument();
    });
  });

  test("debe mostrar todos los pacientes por defecto", async () => {
    renderUsuariosPage();

    await waitFor(() => {
      expect(screen.getAllByTestId("patient-card")).toHaveLength(3);
    });

    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("María García")).toBeInTheDocument();
    expect(screen.getByText("Carlos López")).toBeInTheDocument();
  });

  test("debe filtrar pacientes activos", async () => {
    renderUsuariosPage();

    await waitFor(() => {
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    });

    const activosButton = screen.getByRole("button", { name: /^activos/i });
    fireEvent.click(activosButton);

    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Carlos López")).toBeInTheDocument();
    expect(screen.queryByText("María García")).not.toBeInTheDocument();
  });

  test("debe filtrar pacientes inactivos", async () => {
    renderUsuariosPage();

    await waitFor(() => {
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    });

    const inactivosButton = screen.getByRole("button", { name: /inactivos/i });
    fireEvent.click(inactivosButton);

    expect(screen.getByText("María García")).toBeInTheDocument();
    expect(screen.queryByText("Juan Pérez")).not.toBeInTheDocument();
    expect(screen.queryByText("Carlos López")).not.toBeInTheDocument();
  });

  test("debe regresar a mostrar todos los pacientes", async () => {
    renderUsuariosPage();

    await waitFor(() => {
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    });

    const activosButton = screen.getByRole("button", { name: /^activos/i });
    fireEvent.click(activosButton);

    expect(screen.queryByText("María García")).not.toBeInTheDocument();

    const todosButton = screen.getByRole("button", { name: /todos/i });
    fireEvent.click(todosButton);

    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("María García")).toBeInTheDocument();
    expect(screen.getByText("Carlos López")).toBeInTheDocument();
  });

  test("debe buscar pacientes al escribir en el input", async () => {
    renderUsuariosPage();

    await waitFor(() => {
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        data: [
          {
            id: 1,
            name: "Juan Pérez",
            status: "Activo",
          },
        ],
      }),
    });

    const searchInput = screen.getByPlaceholderText(/buscar paciente/i);
    fireEvent.change(searchInput, {
      target: { value: "Juan" },
    });

    expect(searchInput).toHaveValue("Juan");

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/pacientes/cards?search=Juan"
      );
    });
  });

  test("debe mostrar el número correcto de pacientes en las tabs", async () => {
    renderUsuariosPage();

    await waitFor(() => {
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    });

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  test("debe mostrar error si falla la API", async () => {
    fetch.mockRejectedValueOnce(new Error("Network error"));

    renderUsuariosPage();

    await waitFor(() => {
      expect(
        screen.getByText(/no se pudieron cargar los pacientes/i)
      ).toBeInTheDocument();
    });
  });

  test("debe mostrar error si la API responde ok false", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: false,
        message: "Error al cargar pacientes",
      }),
    });

    renderUsuariosPage();

    await waitFor(() => {
      expect(
        screen.getByText(/no se pudieron cargar los pacientes/i)
      ).toBeInTheDocument();
    });
  });

  test("debe aplicar clase active a la tab seleccionada", async () => {
    renderUsuariosPage();

    await waitFor(() => {
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    });

    const todosButton = screen.getByRole("button", { name: /todos/i });
    const activosButton = screen.getByRole("button", { name: /^activos/i });

    expect(todosButton).toHaveClass("active");

    fireEvent.click(activosButton);

    expect(activosButton).toHaveClass("active");
    expect(todosButton).not.toHaveClass("active");
  });
});