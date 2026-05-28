import { render, screen } from "@testing-library/react";
import PatientCard from "../componentes/patientCard/patientCard";
import { BrowserRouter } from "react-router-dom";

const mockPatient = {
  id: 1,
  name: "María García López",
  subtitle: "Paciente registrado",
  status: "Activo",
  location: "CDMX, CDMX",
  ultimaVisita: "2026-04-10T00:00:00.000Z",
  etapaVida: "Infancia",
  foto: null,
};

describe("PatientCard", () => {
  test("renderiza información básica", () => {
    render(
      <BrowserRouter>
        <PatientCard patient={mockPatient} />
      </BrowserRouter>
    );

    expect(screen.getByText("María García López")).toBeInTheDocument();
    expect(screen.getByText("CDMX, CDMX")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

  test("muestra 'Sin registro' si no hay fecha", () => {
    const patientSinFecha = { ...mockPatient, ultimaVisita: null };

    render(
      <BrowserRouter>
        <PatientCard patient={patientSinFecha} />
      </BrowserRouter>
    );

    expect(screen.getByText("Sin registro")).toBeInTheDocument();
  });

  test("renderiza etapa de vida", () => {
    render(
      <BrowserRouter>
        <PatientCard patient={mockPatient} />
      </BrowserRouter>
    );

    expect(screen.getByText("Infancia")).toBeInTheDocument();
  });
});