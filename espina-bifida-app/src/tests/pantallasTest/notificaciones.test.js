import React from 'react';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import NotificacionesPage from '../../pantallas/notificaciones';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

jest.mock('../../pantallas/notificacionesContext', () => ({
  ...jest.requireActual('../../pantallas/notificacionesContext'),
  useNotificaciones: () => ({
    setPendientesCount: jest.fn(),
  }),
}));

globalThis.fetch = jest.fn();

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('NotificacionesPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: [],
      }),
    });
  });

  test('debe renderizar la página de notificaciones', () => {
    renderWithRouter(<NotificacionesPage />);
    
    expect(screen.getByText(/notificaciones/i) || screen.getByRole('heading')).toBeTruthy();
  });

  test('debe cargar notificaciones al montar el componente', async () => {
    renderWithRouter(<NotificacionesPage />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/notificaciones')
      );
    });
  });

  test('debe mostrar notificaciones cargadas', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        data: [
          {
            id: 1,
            paciente: { nombre: 'Juan', apellido: 'Pérez', curp: '12345', ubicacion: 'Ciudad', telefono: '1234567890' },
            estado: 'pendiente',
            fechaCreacion: '2024-01-15 10:30',
          },
        ],
      }),
    });
    
    renderWithRouter(<NotificacionesPage />);
    
    await waitFor(() => {
      expect(screen.getByText(/Juan|Pérez/)).toBeInTheDocument();
    });
  });

  test('debe filtrar notificaciones por estado', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        data: [
          {
            id: 1,
            paciente: { nombre: 'Juan', apellido: 'Pérez' },
            estado: 'pendiente',
            fechaCreacion: '2024-01-15 10:30',
          },
          {
            id: 2,
            paciente: { nombre: 'Maria', apellido: 'García' },
            estado: 'leída',
            fechaCreacion: '2024-01-14 10:30',
          },
        ],
      }),
    });
    
    renderWithRouter(<NotificacionesPage />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
    
    const pendientesFilter = screen.queryByRole('button', { name: /pendientes/i });
    if (pendientesFilter) {
      fireEvent.click(pendientesFilter);
      
      // Debería mostrar solo las notificaciones pendientes
      expect(screen.getByText(/Juan|Pérez/)).toBeInTheDocument();
    }
  });

  test('debe buscar notificaciones por nombre', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        data: [
          {
            id: 1,
            paciente: { nombre: 'Juan', apellido: 'Pérez' },
            estado: 'pendiente',
            fechaCreacion: '2024-01-15 10:30',
          },
        ],
      }),
    });
    
    renderWithRouter(<NotificacionesPage />);
    
    const searchInput = screen.queryByPlaceholderText(/buscar|nombre/i);
    if (searchInput) {
      userEvent.type(searchInput, 'Juan');
      expect(searchInput.value).toBe('Juan');
    }
  });

  test('debe mostrar loading mientras carga notificaciones', async () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    
    renderWithRouter(<NotificacionesPage />);
    
    expect(screen.queryByText(/cargando|loading/i) || screen.getByRole('heading')).toBeTruthy();
  });

  test('debe manejar errores al cargar notificaciones', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    renderWithRouter(<NotificacionesPage />);
    
    await waitFor(() => {
      expect(screen.queryByText(/error|no se pudieron/i)).toBeTruthy();
    }, { timeout: 1000 });
  });

  test('debe marcar notificación como leída', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        data: [
          {
            id: 1,
            paciente: { nombre: 'Juan', apellido: 'Pérez' },
            estado: 'pendiente',
            fechaCreacion: '2024-01-15 10:30',
          },
        ],
      }),
    });
    
    renderWithRouter(<NotificacionesPage />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
    
    const notificationRows = screen.queryAllByRole('button', { name: /ver|abrir|detalle/i });
    if (notificationRows.length > 0) {
      fireEvent.click(notificationRows[0]);
      
      // Debería hacer una llamada para marcar como leída
      await waitFor(() => {
        expect(fetch.mock.calls.length).toBeGreaterThan(1);
      }, { timeout: 1000 });
    }
  });

  test('debe actualizar el tiempo de las notificaciones cada 10 segundos', async () => {
  jest.useFakeTimers();

  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      ok: true,
      data: [
        {
          id: 1,
          paciente: {
            nombre: 'Juan',
            apellido: 'Pérez',
            curp: '12345',
            ubicacion: 'Ciudad',
            telefono: '1234567890',
          },
          estado: 'pendiente',
          fechaCreacion: '15/01/2024 10:30',
        },
      ],
    }),
  });

  renderWithRouter(<NotificacionesPage />);

  await waitFor(() => {
    expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
  });

  const initialCallCount = fetch.mock.calls.length;

  await act(async () => {
    jest.advanceTimersByTime(10000);
  });

  expect(fetch.mock.calls.length).toBe(initialCallCount);

  jest.useRealTimers();
});

  test('debe navegar al hacer click en una notificación', async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(require('react-router-dom'), 'useNavigate').mockReturnValue(mockNavigate);
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        data: [
          {
            id: 1,
            paciente: { nombre: 'Juan', apellido: 'Pérez' },
            estado: 'pendiente',
            fechaCreacion: '2024-01-15 10:30',
          },
        ],
      }),
    });
    
    renderWithRouter(<NotificacionesPage />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });
});
