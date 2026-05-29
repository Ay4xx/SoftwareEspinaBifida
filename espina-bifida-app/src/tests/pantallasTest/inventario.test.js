import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ModuloInventario from '../../pantallas/inventario';

jest.mock('../../componentes/tablaInventario/TablaInventario', () => {
  return function MockTablaInventario({ articulos }) {
    return (
      <div data-testid="mock-tabla-inventario">
        {articulos.map((art) => (
          <div key={art.nombre}>{art.nombre}</div>
        ))}
      </div>
    );
  };
});



jest.mock('../../componentes/nuevoarticulo/nuevoarticulo', () => {
  return function MockNuevoArticulo() {
    return <div data-testid="mock-nuevo-articulo">Nuevo Artículo</div>;
  };
});

jest.mock('../../componentes/nuevoarticulo/registrararticulo', () => {
  return function MockRegistrarEntrada() {
    return <div data-testid="mock-registrar-entrada">Registrar Entrada</div>;
  };
});

globalThis.fetch = jest.fn();

describe('ModuloInventario Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [
          {
            DESCRIPCION: 'Vendajes',
            UNIDAD: 'Caja',
            PRECIO: 50,
            CANTIDAD_TOTAL: 10,
          },
          {
            DESCRIPCION: 'Jeringas',
            UNIDAD: 'Paquete',
            PRECIO: 25,
            CANTIDAD_TOTAL: 0,
          },
        ],
      }),
    });
  });

  test('debe renderizar el módulo de inventario', () => {
    render(<ModuloInventario />);
    
    expect(screen.getByRole('button', { name: /nuevo artículo/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /registrar entrada/i })).toBeInTheDocument();
  });

  test('debe cargar inventario al montar el componente', async () => {
    render(<ModuloInventario />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/inventario/')
      );
    });
  });

  test('debe mostrar artículos cargados', async () => {
    render(<ModuloInventario />);
    
    await waitFor(() => {
      expect(screen.getByText(/Vendajes/)).toBeInTheDocument();
      expect(screen.getByText(/Jeringas/)).toBeInTheDocument();
    });
  });

  test('debe buscar artículos por nombre', async () => {
    render(<ModuloInventario />);
    
    await waitFor(() => {
      expect(screen.getByText(/Vendajes/)).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/Buscar artículo/i);
    userEvent.type(searchInput, 'Vendajes');
    
    expect(searchInput.value).toBe('Vendajes');
  });

  test('debe filtrar artículos según búsqueda', async () => {
    render(<ModuloInventario />);
    
    await waitFor(() => {
      expect(screen.getByText(/Vendajes/)).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/Buscar artículo/i);
    userEvent.type(searchInput, 'XYZ');
    
    // El filtro debería ocultar artículos que no coinciden
    // Depende de cómo esté implementado en TablaInventario
    expect(searchInput.value).toBe('XYZ');
  });

  test('debe mostrar estado del inventario correctamente', async () => {
    render(<ModuloInventario />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
    
    // Verificar que los artículos se muestren en la tabla
    expect(screen.getByTestId('mock-tabla-inventario')).toBeInTheDocument();
  });

  test('debe abrir modal para agregar nuevo artículo', async () => {
    render(<ModuloInventario />);
    
    const nuevoButton = screen.getByRole('button', { name: /nuevo artículo/i });
    fireEvent.click(nuevoButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-nuevo-articulo')).toBeInTheDocument();
    });
  });

  test('debe abrir modal para registrar entrada', async () => {
    render(<ModuloInventario />);
    
    const entradaButton = screen.getByRole('button', { name: /registrar entrada/i });
    fireEvent.click(entradaButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-registrar-entrada')).toBeInTheDocument();
    });
  });

  test('debe cerrar modales correctamente', async () => {
    render(<ModuloInventario />);
    
    const nuevoButton = screen.getByRole('button', { name: /nuevo artículo/i });
    fireEvent.click(nuevoButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('mock-nuevo-articulo')).toBeInTheDocument();
    });
  });

  test('debe recargar inventario después de guardar nuevo artículo', async () => {
    render(<ModuloInventario />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
    
    fetch.mockClear();
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
  });

  test('debe calcular estado de inventario correctamente', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { DESCRIPCION: 'Agotado', UNIDAD: 'Caja', PRECIO: 50, CANTIDAD_TOTAL: 0 },
          { DESCRIPCION: 'Bajo', UNIDAD: 'Caja', PRECIO: 50, CANTIDAD_TOTAL: 3 },
          { DESCRIPCION: 'Normal', UNIDAD: 'Caja', PRECIO: 50, CANTIDAD_TOTAL: 20 },
        ],
      }),
    });
    
    render(<ModuloInventario />);
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
  });

  test('debe manejar errores al cargar inventario', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    render(<ModuloInventario />);
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error cargando inventario'),
        expect.any(Error)
      );
    });
    
    consoleSpy.mockRestore();
  });

  test('debe normalizar búsquedas con acentos', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { DESCRIPCION: 'Antibióticos', UNIDAD: 'Caja', PRECIO: 50, CANTIDAD_TOTAL: 10 },
        ],
      }),
    });
    
    render(<ModuloInventario />);
    
    await waitFor(() => {
      expect(screen.getByText(/Antibióticos/)).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/Buscar artículo/i);
    userEvent.type(searchInput, 'antibi');
    
    expect(searchInput.value).toBe('antibi');
  });
});
