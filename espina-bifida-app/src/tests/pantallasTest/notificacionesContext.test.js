import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { NotificacionesProvider, useNotificaciones } from '../../pantallas/notificacionesContext';

globalThis.fetch = jest.fn();

// Componente de prueba que usa el contexto
const TestComponent = () => {
  const { pendientesCount, setPendientesCount } = useNotificaciones();
  
  return (
    <div>
      <div data-testid="pendientes-count">{pendientesCount}</div>
      <button onClick={() => setPendientesCount(5)}>Set Count to 5</button>
    </div>
  );
};

describe('NotificacionesContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('debe proporcionar el contexto de notificaciones', () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: [],
      }),
    });

    render(
      <NotificacionesProvider>
        <TestComponent />
      </NotificacionesProvider>
    );

    expect(screen.getByTestId('pendientes-count')).toBeInTheDocument();
  });

  test('debe inicializar pendientesCount en 0', () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: [],
      }),
    });

    render(
      <NotificacionesProvider>
        <TestComponent />
      </NotificacionesProvider>
    );

    expect(screen.getByTestId('pendientes-count')).toHaveTextContent('0');
  });

  test('debe actualizar pendientesCount cuando hay notificaciones pendientes', async () => {
    localStorage.setItem('token', 'test-token');

    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: [
          { id: 1, estado: 'pendiente' },
          { id: 2, estado: 'pendiente' },
          { id: 3, estado: 'leída' },
        ],
      }),
    });

    render(
      <NotificacionesProvider>
        <TestComponent />
      </NotificacionesProvider>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('pendientes-count')).toHaveTextContent('2');
    });
  });

  test('debe permitir actualizar pendientesCount', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: [],
      }),
    });

    render(
      <NotificacionesProvider>
        <TestComponent />
      </NotificacionesProvider>
    );

    const button = screen.getByRole('button', { name: /Set Count to 5/ });
    button.click();

    await waitFor(() => {
      expect(screen.getByTestId('pendientes-count')).toHaveTextContent('5');
    });
  });

  test('debe no hacer fetch si no hay token', async () => {
    render(
      <NotificacionesProvider>
        <TestComponent />
      </NotificacionesProvider>
    );

    await waitFor(() => {
      // No debería haber llamadas de fetch sin token
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test('debe no hacer fetch si el usuario es invitado', async () => {
    localStorage.setItem('guest', 'true');

    render(
      <NotificacionesProvider>
        <TestComponent />
      </NotificacionesProvider>
    );

    await waitFor(() => {
      // No debería haber llamadas de fetch si es invitado
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  test('debe hacer fetch cada 30 segundos', async () => {
    localStorage.setItem('token', 'test-token');

    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: [],
      }),
    });

    render(
      <NotificacionesProvider>
        <TestComponent />
      </NotificacionesProvider>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    jest.advanceTimersByTime(30000);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  test('debe limpiar el intervalo al desmontar', async () => {
    localStorage.setItem('token', 'test-token');

    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: [],
      }),
    });

    const { unmount } = render(
      <NotificacionesProvider>
        <TestComponent />
      </NotificacionesProvider>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });

    const initialCallCount = fetch.mock.calls.length;

    unmount();

    jest.advanceTimersByTime(30000);

    // No debería hacer más llamadas después de desmontar
    expect(fetch.mock.calls.length).toBe(initialCallCount);
  });

  test('debe manejar errores de fetch', async () => {
    localStorage.setItem('token', 'test-token');

    fetch.mockRejectedValue(new Error('Network error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    render(
      <NotificacionesProvider>
        <TestComponent />
      </NotificacionesProvider>
    );

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  test('debe contar solo notificaciones con estado pendiente', async () => {
    localStorage.setItem('token', 'test-token');

    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: [
          { id: 1, estado: 'pendiente' },
          { id: 2, estado: 'PENDIENTE' },
          { id: 3, estado: 'Pendiente' },
          { id: 4, estado: 'leída' },
          { id: 5, estado: 'archivada' },
        ],
      }),
    });

    render(
      <NotificacionesProvider>
        <TestComponent />
      </NotificacionesProvider>
    );

    await waitFor(() => {
      // Debería contar 3 notificaciones pendientes (case-insensitive)
      expect(screen.getByTestId('pendientes-count')).toHaveTextContent('3');
    });
  });

  test('debe manejar respuesta ok: false', async () => {
    localStorage.setItem('token', 'test-token');

    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: false,
        data: [],
      }),
    });

    render(
      <NotificacionesProvider>
        <TestComponent />
      </NotificacionesProvider>
    );

    await waitFor(() => {
      // Debería mantener el contador en 0
      expect(screen.getByTestId('pendientes-count')).toHaveTextContent('0');
    });
  });

  test('debe usar el token del localStorage en headers', async () => {
    localStorage.setItem('token', 'test-token-123');

    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        data: [],
      }),
    });

    render(
      <NotificacionesProvider>
        <TestComponent />
      </NotificacionesProvider>
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      );
    });
  });
});
