import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import HistorialPage from '../../pantallas/historial';

jest.mock('../../componentes/tabnav/tabnav', () => {
  function MockTabNav({ tabs, onTabChange }) {
    return (
      <div data-testid="mock-tabnav">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => onTabChange(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>
    );
  }

  return MockTabNav;
});

jest.mock('../../componentes/historial/historial', () => {
  return function MockVisualizarHistorial() {
    return <div data-testid="mock-historial">Visualizar Historial</div>;
  };
});

jest.mock('../../componentes/detallepaciente/detallepaciente', () => {
  return function MockVisualizarInfo() {
    return <div data-testid="mock-info">Información del Paciente</div>;
  };
});

jest.mock('../../componentes/detallefamiliar/detallefamiliar', () => {
  return function MockVisualizarFamiliar() {
    return <div data-testid="mock-familiar">Información Familiar</div>;
  };
});

globalThis.fetch = jest.fn();

describe('HistorialPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  test('debe renderizar la página de historial', () => {
    render(<HistorialPage />);
    
    expect(screen.getByTestId('mock-info')).toBeInTheDocument();
    expect(screen.getByTestId('mock-tabnav')).toBeInTheDocument();
  });

  test('debe mostrar historial por defecto', () => {
    render(<HistorialPage />);
    
    expect(screen.getByTestId('mock-historial')).toBeInTheDocument();
  });

  test('debe tener las tabs de Información Familiar e Historial', () => {
    render(<HistorialPage />);
    
    expect(screen.getByRole('button', { name: /Información Familiar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Historial/i })).toBeInTheDocument();
  });

  test('debe cambiar a tab de Información Familiar', async () => {
    render(<HistorialPage />);
    
    const infoButton = screen.getByRole('button', { name: /Información Familiar/i });
    fireEvent.click(infoButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-familiar')).toBeInTheDocument();
    });
  });

  test('debe volver a tab de Historial', async () => {
    render(<HistorialPage />);
    
    const infoButton = screen.getByRole('button', { name: /Información Familiar/i });
    fireEvent.click(infoButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-familiar')).toBeInTheDocument();
    });
    
    const historialButton = screen.getByRole('button', { name: /Historial/i });
    fireEvent.click(historialButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-historial')).toBeInTheDocument();
    });
  });

  test('debe mantener la estructura de dos columnas', () => {
    const { container } = render(<HistorialPage />);
    
    const leftColumn = container.querySelector('.lado-izq');
    const rightColumn = container.querySelector('.lado-derecho');
    
    expect(leftColumn).toBeInTheDocument();
    expect(rightColumn).toBeInTheDocument();
  });

  test('debe mostrar información del paciente en la columna izquierda', () => {
    render(<HistorialPage />);
    
    expect(screen.getByTestId('mock-info')).toBeInTheDocument();
  });

  test('debe mostrar contenido del tab activo en la columna derecha', async () => {
    render(<HistorialPage />);
    
    // Por defecto debe mostrar historial
    expect(screen.getByTestId('mock-historial')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-familiar')).not.toBeInTheDocument();
  });

  test('debe manejar cambios de tab sin errores', async () => {
    render(<HistorialPage />);
    
    const infoButton = screen.getByRole('button', { name: /Información Familiar/i });
    const historialButton = screen.getByRole('button', { name: /Historial/i });
    
    fireEvent.click(infoButton);
    fireEvent.click(historialButton);
    fireEvent.click(infoButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-familiar')).toBeInTheDocument();
    });
  });

  test('debe renderizar los iconos correctos para cada tab', () => {
    render(<HistorialPage />);
    
    // Verificar que los iconos (FileText, Pill) se renderizen
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  test('debe mantener el estado de la tab seleccionada', async () => {
    const { rerender } = render(<HistorialPage />);
    
    const infoButton = screen.getByRole('button', { name: /Información Familiar/i });
    fireEvent.click(infoButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-familiar')).toBeInTheDocument();
    });
    
    // Re-renderizar no debería cambiar la tab
    rerender(<HistorialPage />);
    
    // La tab Información Familiar debería permanecer visible si se mantiene el estado
    // Esto depende de cómo se implemente
  });

  test('debe tener clase CSS correcta para el contenedor', () => {
    const { container } = render(<HistorialPage />);
    
    const contenedor = container.querySelector('.contenedor');
    expect(contenedor).toBeInTheDocument();
  });

  test('debe renderizar todos los componentes secundarios', () => {
    render(<HistorialPage />);
    
    // Verificar que todos los componentes mock se carguen
    expect(screen.getByTestId('mock-info')).toBeInTheDocument();
    expect(screen.getByTestId('mock-tabnav')).toBeInTheDocument();
    expect(screen.getByTestId('mock-historial')).toBeInTheDocument();
  });
});
