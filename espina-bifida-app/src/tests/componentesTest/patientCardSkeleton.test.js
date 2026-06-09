import React from "react";
import { render } from "@testing-library/react";
import PatientCardSkeleton from "../../componentes/patientCard/patientCardSkeleton";

jest.mock("../../componentes/patientCard/patientCardSkeleton.css", () => ({}));

describe("PatientCardSkeleton", () => {
  test("renderiza correctamente el skeleton", () => {
    const { container } = render(<PatientCardSkeleton />);

    expect(
      container.querySelector(".patient-card-skeleton")
    ).toBeInTheDocument();

    expect(container.querySelector(".skeleton-avatar")).toBeInTheDocument();
    expect(container.querySelector(".skeleton-name")).toBeInTheDocument();
    expect(container.querySelector(".skeleton-subtitle")).toBeInTheDocument();
    expect(container.querySelector(".skeleton-status")).toBeInTheDocument();

    expect(
      container.querySelectorAll(".skeleton-icon-small")
    ).toHaveLength(2);

    expect(
      container.querySelectorAll(".skeleton-info-text")
    ).toHaveLength(2);

    expect(container.querySelector(".skeleton-extra")).toBeInTheDocument();

    expect(
      container.querySelectorAll(".skeleton-button")
    ).toHaveLength(2);
  });

  test("contiene la estructura principal de una card", () => {
    const { container } = render(<PatientCardSkeleton />);

    expect(container.querySelector(".card")).toBeInTheDocument();
    expect(container.querySelector(".card-header")).toBeInTheDocument();
    expect(container.querySelector(".card-body")).toBeInTheDocument();
    expect(container.querySelector(".card-extra")).toBeInTheDocument();
    expect(container.querySelector(".card-footer")).toBeInTheDocument();
  });
});