import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ForgotPassword from "../../pantallas/forgotPassword";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("ForgotPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  test("muestra error si se intenta enviar sin correo", async () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /enviar enlace/i }));

    expect(
      await screen.findByText("Ingresa tu correo electrónico")
    ).toBeInTheDocument();

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("envía solicitud de recuperación correctamente", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ ok: true }),
    });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "usuario@test.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /enviar enlace/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/forgot-password/request",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "usuario@test.com" }),
        })
      );
    });

    expect(await screen.findByText(/revisa tu correo/i)).toBeInTheDocument();
    expect(screen.getByText(/usuario@test.com/i)).toBeInTheDocument();
  });

  test("muestra mensaje de error si el servidor responde con ok false", async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        ok: false,
        message: "Correo no encontrado",
      }),
    });

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "noexiste@test.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /enviar enlace/i }));

    expect(await screen.findByText("Correo no encontrado")).toBeInTheDocument();
  });

  test("muestra error si falla la conexión con el servidor", async () => {
    global.fetch.mockRejectedValueOnce(new Error("Network error"));

    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), {
      target: { value: "usuario@test.com" },
    });

    fireEvent.click(screen.getByRole("button", { name: /enviar enlace/i }));

    expect(
      await screen.findByText("No se pudo conectar con el servidor")
    ).toBeInTheDocument();
  });

  test("navega al login al dar clic en volver", () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /volver al inicio/i }));

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });
});