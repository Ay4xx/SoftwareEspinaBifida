import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import ServiciosPanel from "../../pantallas/regservicios";

jest.mock("../../componentes/detallepaciente/detallepaciente", () => {
  return function MockVisualizarInfo() {
    return <div data-testid="visualizar-info">Visualizar Info</div>;
  };
});

jest.mock("../../componentes/detallefamiliar/detallefamiliar", () => {
  return function MockVisualizarFamiliar() {
    return <div data-testid="visualizar-familiar">Información Familiar</div>;
  };
});

jest.mock("../../componentes/registrocitas/registrocitas", () => {
  return function MockRegistrarConsulta() {
    return <div data-testid="registrar-consulta">Citas</div>;
  };
});

jest.mock("../../componentes/medicamentos/medicamentos", () => {
  return function MockMedicamentos() {
    return <div data-testid="medicamentos">Medicamentos</div>;
  };
});

jest.mock("../../componentes/equipomedico/equipomedico", () => {
  return function MockEquipoMedico() {
    return <div data-testid="equipo-medico">Equipo médico</div>;
  };
});

jest.mock("../../componentes/historial/Historial", () => {
  return function MockVisualizarHistorial() {
    return <div data-testid="visualizar-historial">Recibos</div>;
  };
});

jest.mock("../../componentes/tabnav/tabnav", () => {
  return function MockTabNav({ tabs, activeTab, onTabChange }) {
    return (
      <nav data-testid="tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            data-testid={`tab-${tab.id}`}
            data-active={activeTab === tab.id ? "true" : "false"}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    );
  };
});

describe("ServiciosPanel", () => {
  test("debe renderizar la información del paciente del lado izquierdo", () => {
    render(<ServiciosPanel />);

    expect(screen.getByTestId("visualizar-info")).toBeInTheDocument();
    expect(screen.getByText("Visualizar Info")).toBeInTheDocument();
  });

  test("debe mostrar Información Familiar por defecto", () => {
    render(<ServiciosPanel />);

    expect(screen.getByTestId("visualizar-familiar")).toBeInTheDocument();

    expect(screen.queryByTestId("registrar-consulta")).not.toBeInTheDocument();
    expect(screen.queryByTestId("medicamentos")).not.toBeInTheDocument();
    expect(screen.queryByTestId("equipo-medico")).not.toBeInTheDocument();
    expect(screen.queryByTestId("visualizar-historial")).not.toBeInTheDocument();
  });

  test("debe mostrar la navegación de tabs", () => {
    render(<ServiciosPanel />);

    expect(screen.getByTestId("tab-nav")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "Información Familiar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Citas" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Medicamentos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Equipo médico" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Recibos" })).toBeInTheDocument();
  });

  test("debe marcar como activo el tab de Información Familiar al inicio", () => {
    render(<ServiciosPanel />);

    expect(screen.getByTestId("tab-infopaciente")).toHaveAttribute("data-active", "true");
    expect(screen.getByTestId("tab-citas")).toHaveAttribute("data-active", "false");
  });

  test("debe cambiar al tab Citas", () => {
    render(<ServiciosPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Citas" }));

    expect(screen.getByTestId("registrar-consulta")).toBeInTheDocument();
    expect(screen.queryByTestId("visualizar-familiar")).not.toBeInTheDocument();

    expect(screen.getByTestId("tab-citas")).toHaveAttribute("data-active", "true");
  });

  test("debe cambiar al tab Medicamentos", () => {
    render(<ServiciosPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Medicamentos" }));

    expect(screen.getByTestId("medicamentos")).toBeInTheDocument();
    expect(screen.queryByTestId("visualizar-familiar")).not.toBeInTheDocument();

    expect(screen.getByTestId("tab-medicamentos")).toHaveAttribute("data-active", "true");
  });

  test("debe cambiar al tab Equipo médico", () => {
    render(<ServiciosPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Equipo médico" }));

    expect(screen.getByTestId("equipo-medico")).toBeInTheDocument();
    expect(screen.queryByTestId("visualizar-familiar")).not.toBeInTheDocument();

    expect(screen.getByTestId("tab-equipo")).toHaveAttribute("data-active", "true");
  });

  test("debe cambiar al tab Recibos", () => {
    render(<ServiciosPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Recibos" }));

    expect(screen.getByTestId("visualizar-historial")).toBeInTheDocument();
    expect(screen.queryByTestId("visualizar-familiar")).not.toBeInTheDocument();

    expect(screen.getByTestId("tab-historial")).toHaveAttribute("data-active", "true");
  });

  test("debe regresar al tab Información Familiar después de cambiar de tab", () => {
    render(<ServiciosPanel />);

    fireEvent.click(screen.getByRole("button", { name: "Medicamentos" }));

    expect(screen.getByTestId("medicamentos")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Información Familiar" }));

    expect(screen.getByTestId("visualizar-familiar")).toBeInTheDocument();
    expect(screen.queryByTestId("medicamentos")).not.toBeInTheDocument();

    expect(screen.getByTestId("tab-infopaciente")).toHaveAttribute("data-active", "true");
  });
});