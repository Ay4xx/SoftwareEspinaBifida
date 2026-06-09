import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ResetPassword from "../../pantallas/resetPassword";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("lucide-react", () => ({
  Eye: () => <span data-testid="eye-icon">eye</span>,
  EyeOff: () => <span data-testid="eye-off-icon">eye-off</span>,
}));

describe("ResetPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("muestra enlace inválido si no hay token", async () => {
    render(
      <MemoryRouter initialEntries={["/reset-password"]}>
        <ResetPassword />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/enlace inválido o expirado/i)
    ).toBeInTheDocument();
  });

  test("muestra enlace inválido si el backend rechaza el token", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ ok: false }),
    });

    render(
      <MemoryRouter initialEntries={["/reset-password?token=abc123"]}>
        <ResetPassword />
      </MemoryRouter>
    );

    expect(
      await screen.findByText(/enlace inválido o expirado/i)
    ).toBeInTheDocument();
  });

  test("muestra formulario si el token es válido", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ ok: true }),
    });

    render(
      <MemoryRouter initialEntries={["/reset-password?token=abc123"]}>
        <ResetPassword />
      </MemoryRouter>
    );

    expect(await screen.findAllByText(/nueva contraseña/i)).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: /cambiar contraseña/i })
    ).toBeInTheDocument();
  });

  test("valida campos vacíos", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ ok: true }),
    });

    render(
      <MemoryRouter initialEntries={["/reset-password?token=abc123"]}>
        <ResetPassword />
      </MemoryRouter>
    );

    await screen.findByRole("button", { name: /cambiar contraseña/i });

    fireEvent.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

    expect(await screen.findByText("Completa todos los campos")).toBeInTheDocument();
  });

  test("valida contraseña menor a 8 caracteres", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ ok: true }),
    });

    render(
      <MemoryRouter initialEntries={["/reset-password?token=abc123"]}>
        <ResetPassword />
      </MemoryRouter>
    );

    const inputs = await screen.findAllByPlaceholderText(/contraseña/i);

    fireEvent.change(inputs[0], { target: { value: "123" } });
    fireEvent.change(inputs[1], { target: { value: "123" } });

    fireEvent.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

    expect(
      await screen.findByText("La contraseña debe tener al menos 8 caracteres")
    ).toBeInTheDocument();
  });

  test("valida que las contraseñas coincidan", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ ok: true }),
    });

    render(
      <MemoryRouter initialEntries={["/reset-password?token=abc123"]}>
        <ResetPassword />
      </MemoryRouter>
    );

    const inputs = await screen.findAllByPlaceholderText(/contraseña/i);

    fireEvent.change(inputs[0], { target: { value: "password123" } });
    fireEvent.change(inputs[1], { target: { value: "password456" } });

    fireEvent.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

    expect(
      await screen.findByText("Las contraseñas no coinciden")
    ).toBeInTheDocument();
  });

  test("cambia contraseña correctamente y redirige a login", async () => {
    global.fetch
      .mockResolvedValueOnce({
        json: async () => ({ ok: true }),
      })
      .mockResolvedValueOnce({
        json: async () => ({ ok: true }),
      });

    render(
      <MemoryRouter initialEntries={["/reset-password?token=abc123"]}>
        <ResetPassword />
      </MemoryRouter>
    );

    const inputs = await screen.findAllByPlaceholderText(/contraseña/i);

    fireEvent.change(inputs[0], { target: { value: "password123" } });
    fireEvent.change(inputs[1], { target: { value: "password123" } });

    fireEvent.click(screen.getByRole("button", { name: /cambiar contraseña/i }));

    expect(
      await screen.findByText(/contraseña actualizada/i)
    ).toBeInTheDocument();

    expect(global.fetch).toHaveBeenLastCalledWith(
      "http://localhost:3001/api/forgot-password/reset",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: "abc123",
          newPassword: "password123",
        }),
      })
    );

    jest.advanceTimersByTime(3000);

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});