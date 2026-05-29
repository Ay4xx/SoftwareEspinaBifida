import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pantallas/login';

// Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock de fetch
globalThis.fetch = jest.fn();

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    fetch.mockClear();
  });

  test('debe renderizar el formulario de login', () => {
    renderWithRouter(<Login />);
    
    expect(screen.getByText(/Espina Bífida/i)).toBeInTheDocument();
    expect(screen.getByText(/Sistema de gestión/i)).toBeInTheDocument();
    expect(screen.getByText(/Correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByText(/Contraseña/i)).toBeInTheDocument();
  });

  test('debe mostrar error si los campos están vacíos', async () => {
    renderWithRouter(<Login />);
    
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Completa todos los campos/i)).toBeInTheDocument();
    });
  });

  test('debe permitir escribir en los campos de email y contraseña', async () => {
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/maria.garcia@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    
    userEvent.type(emailInput, 'test@example.com');
    userEvent.type(passwordInput, 'password123');
    
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('debe hacer login exitoso con credenciales válidas', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        token: 'token123',
        data: {
          tipoUsuario: 'ADMINISTRADOR',
          id: 1,
        },
      }),
    });
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/maria.garcia@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    
    userEvent.type(emailInput, 'admin@example.com');
    userEvent.type(passwordInput, 'Password123');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('token123');
      expect(localStorage.getItem('usuario')).toBe(JSON.stringify({ tipoUsuario: 'ADMINISTRADOR', id: 1 }));
    });
  });

  test('debe mostrar error si las credenciales son incorrectas', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        ok: false,
        message: 'Credenciales incorrectas',
      }),
    });
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/maria.garcia@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    
    userEvent.type(emailInput, 'test@example.com');
    userEvent.type(passwordInput, 'wrongpassword');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Credenciales incorrectas/i)).toBeInTheDocument();
    });
  });

  test('debe mostrar error de conexión', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/maria.garcia@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    
    userEvent.type(emailInput, 'test@example.com');
    userEvent.type(passwordInput, 'password123');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/No se pudo conectar con el servidor/i)).toBeInTheDocument();
    });
  });

  test('debe permitir login como invitado', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    
    renderWithRouter(<Login />);
    
    const guestButton = screen.getByRole('button', { name: /ingresar como invitado/i });
    fireEvent.click(guestButton);
    
    await waitFor(() => {
      expect(localStorage.getItem('guest')).toBe('true');
    });
  });

  
  test('debe navegar a /usuarios para ADMINISTRADOR', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        token: 'token123',
        data: { tipoUsuario: 'ADMINISTRADOR' },
      }),
    });
    
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByPlaceholderText(/maria.garcia@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    
    userEvent.type(emailInput, 'admin@example.com');
    userEvent.type(passwordInput, 'Password123');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/usuarios');
    });
  });
});
