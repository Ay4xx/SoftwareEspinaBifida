import { render, screen } from "@testing-library/react";
import PatientCard from "./patientCard";

describe("PatientCard", () => {

  test("renderiza nombre y ubicación", () => {
    render(
      <PatientCard
        name="María García López"
        location="CDMX, CDMX"
        status="Activo"
      />
    );

    expect(screen.getByText("María García López")).toBeInTheDocument();
    expect(screen.getByText("CDMX, CDMX")).toBeInTheDocument();
    expect(screen.getByText("Activo")).toBeInTheDocument();
  });

});