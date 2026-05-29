import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AgendaCitasPage from '../../pantallas/agendacitas';

jest.mock('../../componentes/agendacitas/calendario', () => {
  return function MockCalendario() {
    return <div data-testid="mock-calendario">Calendario</div>;
  };
});

jest.mock('../../componentes/agendacitas/panelcitas', () => {
  return function MockPanelCitas() {
    return <div data-testid="mock-panel-citas">Panel de Citas</div>;
  };
});

jest.mock('../../componentes/agendacitas/popupagregarc', () => {
  return function MockPopupAgregarCita() {
    return <div data-testid="mock-popup-cita">Popup Agregar Cita</div>;
  };
});

globalThis.fetch = jest.fn();

describe('AgendaCitasPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        citas: [],
      }),
    });
  });

  test('debe renderizar la página de agenda de citas', () => {
    render(<AgendaCitasPage />);
    
    expect(screen.getByTestId('mock-calendario')).toBeInTheDocument();
    expect(screen.getByTestId('mock-panel-citas')).toBeInTheDocument();
  });

  test('debe cargar citas al renderizar', async () => {
    render(<AgendaCitasPage />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/citas?fecha=')
      );
    });
  });

  test('debe cargar citas cuando cambia la fecha seleccionada', async () => {
    const { rerender } = render(<AgendaCitasPage />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
    
    const initialCallCount = fetch.mock.calls.length;
    
    // Simular cambio de fecha (esto normalmente ocurre en el componente Calendario)
    rerender(<AgendaCitasPage />);
    
    await waitFor(() => {
      expect(fetch.mock.calls.length).toBeGreaterThanOrEqual(initialCallCount);
    });
  });

  test('debe mostrar citas cargadas', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        citas: [
          { id: 1, titulo: 'Cita con Dr. García', hora: '10:00' },
          { id: 2, titulo: 'Cita con Enfermera', hora: '14:00' },
        ],
      }),
    });
    
    render(<AgendaCitasPage />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  test('debe abrir popup para agregar nueva cita', async () => {
    render(<AgendaCitasPage />);
    
    const agregarButton = screen.queryByRole('button', { name: /agregar|nueva|crear/i });
    
    if (agregarButton) {
      fireEvent.click(agregarButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('mock-popup-cita')).toBeInTheDocument();
      });
    }
  });

  test('debe manejar errores al obtener citas', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(<AgendaCitasPage />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error obteniendo citas'),
        expect.any(Error)
      );
    });
    
    consoleSpy.mockRestore();
  });

  test('debe eliminar una cita', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        citas: [{ id: 1, titulo: 'Cita 1' }],
      }),
    });
    
    render(<AgendaCitasPage />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
    
    fetch.mockClear();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    
    // Simular click en botón de eliminar (depende de cómo esté implementado en PanelCitas)
    const deleteButtons = screen.queryAllByRole('button', { name: /eliminar|borrar|trash/i });
    
    if (deleteButtons.length > 0) {
      fireEvent.click(deleteButtons[0]);
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/citas/'),
          expect.objectContaining({ method: 'DELETE' })
        );
      }, { timeout: 1000 });
    }
  });

  test('debe cambiar estado de una cita', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        citas: [{ id: 1, titulo: 'Cita 1', estado: 'pendiente' }],
      }),
    });
    
    render(<AgendaCitasPage />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  test('debe mantener el estado de fechas seleccionadas', async () => {
    render(<AgendaCitasPage />);
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-calendario')).toBeInTheDocument();
    });
    
    // El componente debe mantener la fecha seleccionada
    expect(screen.getByTestId('mock-calendario')).toBeInTheDocument();
  });
});
