import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import NotificacionesPage from "../../pantallas/notificaciones";

const mockSetPendientesCount = jest.fn();
const mockRefrescarBadge = jest.fn();
const mockNavigate = jest.fn();

jest.mock("../../pantallas/notificacionesContext", () => ({
  useNotificaciones: () => ({
    setPendientesCount: mockSetPendientesCount,
    refrescarBadge: mockRefrescarBadge,
  }),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const mockNotificaciones = [
  {
    id: 1,
    estado: "pendiente",
    fechaCreacion: "01/06/2026 10:00",
    paciente: {
      nombre: "Ana",
      apellido: "López",
      curp: "AALO010101MNLXXX01",
      ubicacion: "Monterrey",
      telefono: "8111111111",
      foto: null,
    },
  },
  {
    id: 2,
    estado: "aprobado",
    fechaCreacion: "31/05/2026 09:00",
    paciente: {
      nombre: "Juan",
      apellido: "Pérez",
      curp: "JUPE010101HNLXXX01",
      ubicacion: "Guadalupe",
      telefono: "8222222222",
      foto: null,
    },
  },
  {
    id: 3,
    estado: "rechazado",
    fechaCreacion: "30/05/2026 08:00",
    paciente: {
      nombre: "María",
      apellido: "García",
      curp: "MAGA010101MNLXXX01",
      ubicacion: "San Nicolás",
      telefono: "8333333333",
      foto: "data:image/jpeg;base64,foto",
    },
  },
];

function mockFetchOk(data = mockNotificaciones) {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({
      ok: true,
      data,
    }),
  });
}

function mockFetchError(message = "No se pudieron cargar las notificaciones") {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: false,
    json: jest.fn().mockResolvedValue({
      ok: false,
      message,
    }),
  });
}

describe("NotificacionesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchOk();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("muestra mensaje de carga al iniciar", () => {
    globalThis.fetch = jest.fn(
      () =>
        new Promise(() => {})
    );

    render(<NotificacionesPage />);

    expect(screen.getByText("Cargando notificaciones...")).toBeInTheDocument();
  });

  test("carga y muestra las notificaciones pendientes por defecto", async () => {
    render(<NotificacionesPage />);

    expect(await screen.findByText("Registro pendiente — Ana López")).toBeInTheDocument();

    expect(screen.getAllByText("Pendientes").length).toBeGreaterThan(0);
    expect(screen.getByText("CURP: AALO010101MNLXXX01")).toBeInTheDocument();
    expect(screen.getByText("Monterrey")).toBeInTheDocument();
    expect(screen.getByText("8111111111")).toBeInTheDocument();

    expect(screen.queryByText("Registro aprobado — Juan Pérez")).not.toBeInTheDocument();
    expect(screen.queryByText("Registro rechazado — María García")).not.toBeInTheDocument();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/notificaciones"
    );

    expect(mockRefrescarBadge).toHaveBeenCalledTimes(1);
    expect(mockSetPendientesCount).toHaveBeenCalledWith(1);
  });

  test("muestra contador de pendientes y resueltas", async () => {
    render(<NotificacionesPage />);

    await screen.findByText("Registro pendiente — Ana López");

    expect(screen.getByRole("button", { name: /Pendientes 1/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Rechazadas 2/i })).toBeInTheDocument();
  });

  test("cambia al filtro de resueltas", async () => {
    render(<NotificacionesPage />);

    await screen.findByText("Registro pendiente — Ana López");

    fireEvent.click(screen.getByRole("button", { name: /Rechazadas 2/i }));

    expect(screen.getByText("Registro aprobado — Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Registro rechazado — María García")).toBeInTheDocument();
    expect(screen.queryByText("Registro pendiente — Ana López")).not.toBeInTheDocument();
  });

  test("filtra notificaciones por nombre", async () => {
    render(<NotificacionesPage />);

    await screen.findByText("Registro pendiente — Ana López");

    const input = screen.getByPlaceholderText("Buscar notificación");

    fireEvent.change(input, {
      target: { value: "Ana" },
    });

    expect(screen.getByText("Registro pendiente — Ana López")).toBeInTheDocument();

    fireEvent.change(input, {
      target: { value: "Juan" },
    });

    expect(screen.queryByText("Registro pendiente — Ana López")).not.toBeInTheDocument();
    expect(screen.getByText("No hay notificaciones pendientes")).toBeInTheDocument();
  });

  test("filtra notificaciones por CURP", async () => {
    render(<NotificacionesPage />);

    await screen.findByText("Registro pendiente — Ana López");

    const input = screen.getByPlaceholderText("Buscar notificación");

    fireEvent.change(input, {
      target: { value: "AALO010101" },
    });

    expect(screen.getByText("Registro pendiente — Ana López")).toBeInTheDocument();
  });

  test("muestra mensaje cuando no hay notificaciones pendientes", async () => {
    mockFetchOk([
      {
        id: 2,
        estado: "aprobado",
        fechaCreacion: "31/05/2026 09:00",
        paciente: {
          nombre: "Juan",
          apellido: "Pérez",
          curp: "JUPE010101HNLXXX01",
          ubicacion: "Guadalupe",
          telefono: "8222222222",
          foto: null,
        },
      },
    ]);

    render(<NotificacionesPage />);

    expect(await screen.findByText("No hay notificaciones pendientes")).toBeInTheDocument();
    expect(mockSetPendientesCount).toHaveBeenCalledWith(0);
  });

  test("muestra mensaje cuando no hay notificaciones resueltas", async () => {
    mockFetchOk([
      {
        id: 1,
        estado: "pendiente",
        fechaCreacion: "01/06/2026 10:00",
        paciente: {
          nombre: "Ana",
          apellido: "López",
          curp: "AALO010101MNLXXX01",
          ubicacion: "Monterrey",
          telefono: "8111111111",
          foto: null,
        },
      },
    ]);

    render(<NotificacionesPage />);

    await screen.findByText("Registro pendiente — Ana López");

    fireEvent.click(screen.getByRole("button", { name: /Rechazadas 0/i }));

    expect(screen.getByText("No hay notificaciones resueltas")).toBeInTheDocument();
  });

  test("navega a registro en modo revisión al hacer click en notificación pendiente", async () => {
    render(<NotificacionesPage />);

    const tarjeta = await screen.findByText("Registro pendiente — Ana López");

    fireEvent.click(tarjeta);

    expect(mockNavigate).toHaveBeenCalledWith("/registro", {
      state: {
        notificacionId: 1,
        modoRevision: true,
      },
    });
  });

  test("no navega si la notificación está aprobada", async () => {
    render(<NotificacionesPage />);

    await screen.findByText("Registro pendiente — Ana López");

    fireEvent.click(screen.getByRole("button", { name: /Rechazadas 2/i }));

    const aprobada = screen.getByText("Registro aprobado — Juan Pérez");

    fireEvent.click(aprobada);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("sí navega si la notificación está rechazada", async () => {
    render(<NotificacionesPage />);

    await screen.findByText("Registro pendiente — Ana López");

    fireEvent.click(screen.getByRole("button", { name: /Rechazadas 2/i }));

    const rechazada = screen.getByText("Registro rechazado — María García");

    fireEvent.click(rechazada);

    expect(mockNavigate).toHaveBeenCalledWith("/registro", {
      state: {
        notificacionId: 3,
        modoRevision: true,
      },
    });
  });

  test("muestra error si falla la carga de notificaciones", async () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    mockFetchError("Error al cargar notificaciones");

    render(<NotificacionesPage />);

    expect(await screen.findByText("Error al cargar notificaciones")).toBeInTheDocument();

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  test("usa valores por defecto si faltan datos del paciente", async () => {
    mockFetchOk([
      {
        id: 99,
        estado: "pendiente",
        fechaCreacion: null,
        paciente: null,
      },
    ]);

    render(<NotificacionesPage />);

    expect(await screen.findByText("Registro pendiente — Sin nombre")).toBeInTheDocument();
    expect(screen.getByText("Sin fecha")).toBeInTheDocument();
    expect(screen.getByText("CURP:")).toBeInTheDocument();

    expect(mockSetPendientesCount).toHaveBeenCalledWith(1);
  });
});