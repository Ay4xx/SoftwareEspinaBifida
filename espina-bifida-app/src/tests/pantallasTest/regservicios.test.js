import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ServiciosPanel from '../../pantallas/regservicios';

jest.mock('../../componentes/tabnav/tabnav', () => {
  return function MockTabNav({ tabs, activeTab, onTabChange }) {
    return (
      <div data-testid="mock-tabnav">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => onTabChange(tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>
    );
  };
});

jest.mock('../../componentes/registrocitas/registrocitas', () => {
  return function MockRegistrarConsulta() {
    return <div data-testid="mock-registrar-consulta">Registrar Consulta</div>;
  };
});

jest.mock('../../componentes/medicamentos/medicamentos', () => {
  return function MockMedicamentos() {
    return <div data-testid="mock-medicamentos">Medicamentos</div>;
  };
});

jest.mock('../../componentes/equipomedico/equipomedico', () => {
  return function MockEquipoMedico() {
    return <div data-testid="mock-equipo-medico">Equipo Médico</div>;
  };
});

jest.mock('../../componentes/detallepaciente/detallepaciente', () => {
  return function MockVisualizarInfo() {
    return <div data-testid="mock-visualizar-info">Visualizar Información</div>;
  };
});

global.fetch = jest.fn();

describe('ServiciosPanel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  test('debe renderizar el panel de servicios', () => {
    render(<ServiciosPanel />);
    
    expect(screen.getByText(/Citas/i)).toBeInTheDocument();
    expect(screen.getByText(/Medicamentos/i)).toBeInTheDocument();
    expect(screen.getByText(/Equipo médico/i)).toBeInTheDocument();
  });

  test('debe mostrar la tab de citas por defecto', () => {
    render(<ServiciosPanel />);
    
    expect(screen.getByTestId('mock-registrar-consulta')).toBeInTheDocument();
  });

  test('debe cambiar a tab de medicamentos', async () => {
    render(<ServiciosPanel />);
    
    const medicamentosButton = screen.getByRole('button', { name: /Medicamentos/i });
    fireEvent.click(medicamentosButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-medicamentos')).toBeInTheDocument();
    });
  });

  test('debe cambiar a tab de equipo médico', async () => {
    render(<ServiciosPanel />);
    
    const equipoButton = screen.getByRole('button', { name: /Equipo médico/i });
    fireEvent.click(equipoButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-equipo-medico')).toBeInTheDocument();
    });
  });

  test('debe navegar entre tabs correctamente', async () => {
    render(<ServiciosPanel />);
    
    // Empezar en Citas
    expect(screen.getByTestId('mock-registrar-consulta')).toBeInTheDocument();
    
    // Ir a Medicamentos
    fireEvent.click(screen.getByRole('button', { name: /Medicamentos/i }));
    await waitFor(() => {
      expect(screen.getByTestId('mock-medicamentos')).toBeInTheDocument();
    });
    
    // Volver a Citas
    fireEvent.click(screen.getByRole('button', { name: /Citas/i }));
    await waitFor(() => {
      expect(screen.getByTestId('mock-registrar-consulta')).toBeInTheDocument();
    });
  });

  test('debe mostrar información del paciente en la sección izquierda', () => {
    render(<ServiciosPanel />);
    
    expect(screen.getByTestId('mock-visualizar-info')).toBeInTheDocument();
  });

  test('debe mantener la estructura de dos columnas', () => {
    const { container } = render(<ServiciosPanel />);
    
    const leftColumn = container.querySelector('.inventario-izq');
    const rightColumn = container.querySelector('.inventario-derecho');
    
    expect(leftColumn).toBeInTheDocument();
    expect(rightColumn).toBeInTheDocument();
  });

  test('debe renderizar todos los tabs', () => {
    render(<ServiciosPanel />);
    
    const tabs = ['Citas', 'Medicamentos', 'Equipo médico'];
    
    tabs.forEach((tab) => {
      expect(screen.getByRole('button', { name: new RegExp(tab, 'i') })).toBeInTheDocument();
    });
  });

  test('debe manejar cambios de tab sin errores', async () => {
    render(<ServiciosPanel />);
    
    const citasButton = screen.getByRole('button', { name: /Citas/i });
    const medicamentosButton = screen.getByRole('button', { name: /Medicamentos/i });
    const equipoButton = screen.getByRole('button', { name: /Equipo médico/i });
    
    fireEvent.click(medicamentosButton);
    fireEvent.click(equipoButton);
    fireEvent.click(citasButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-registrar-consulta')).toBeInTheDocument();
    });
  });
});
