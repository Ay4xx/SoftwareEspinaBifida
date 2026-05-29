import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import StatCard from "../../componentes/statCard/statCard";
import StatCardSkeleton from "../../componentes/statCard/statCardSkeleton";
import StatsSection from "../../componentes/statCard/statSection";
import StatsSectionSkeleton from "../../componentes/statCard/statSectionSkeleton";

describe("Componentes de estadísticas", () => {
  describe("StatCard", () => {
    test("debe renderizar título, valor, porcentaje e ícono", () => {
      render(
        <StatCard
          title="TOTAL PACIENTES"
          value="50"
          percentage="70.0%"
          icon={<span data-testid="mock-icon">Icono</span>}
          color="green"
        />
      );

      expect(screen.getByText("TOTAL PACIENTES")).toBeInTheDocument();
      expect(screen.getByText("50")).toBeInTheDocument();
      expect(screen.getByText("70.0%")).toBeInTheDocument();
      expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
    });

    test("debe aplicar la clase de color recibida", () => {
      const { container } = render(
        <StatCard
          title="ACTIVOS"
          value="10"
          icon={<span>Icono</span>}
          color="green"
        />
      );

      const card = container.querySelector(".stat-card");

      expect(card).toBeInTheDocument();
      expect(card).toHaveClass("green");
    });

    test("debe usar color blue por defecto", () => {
      const { container } = render(
        <StatCard
          title="TOTAL"
          value="100"
          icon={<span>Icono</span>}
        />
      );

      const card = container.querySelector(".stat-card");

      expect(card).toBeInTheDocument();
      expect(card).toHaveClass("blue");
    });

    test("no debe mostrar porcentaje si no se manda percentage", () => {
      const { container } = render(
        <StatCard
          title="TOTAL"
          value="100"
          icon={<span>Icono</span>}
        />
      );

      expect(screen.getByText("TOTAL")).toBeInTheDocument();
      expect(screen.getByText("100")).toBeInTheDocument();
      expect(container.querySelector(".stat-percentage")).not.toBeInTheDocument();
    });
  });

  describe("StatCardSkeleton", () => {
    test("debe renderizar el skeleton de stat card", () => {
      const { container } = render(<StatCardSkeleton />);

      expect(container.querySelector(".stat-card-skeleton")).toBeInTheDocument();
      expect(container.querySelector(".skeleton-icon")).toBeInTheDocument();
      expect(container.querySelector(".skeleton-title")).toBeInTheDocument();
      expect(container.querySelector(".skeleton-value")).toBeInTheDocument();
      expect(container.querySelector(".skeleton-percentage")).toBeInTheDocument();
    });
  });

  describe("StatsSection", () => {
    const cards = [
      {
        title: "TOTAL ARTÍCULOS",
        value: "100",
        percentage: "100%",
        color: "blue",
        icon: <span data-testid="icon-total">Icono total</span>,
      },
      {
        title: "EXISTENCIAS NORMAL",
        value: "70",
        percentage: "70.0%",
        color: "green",
        icon: <span data-testid="icon-normal">Icono normal</span>,
      },
      {
        title: "EXISTENCIAS BAJAS",
        value: "20",
        percentage: "20.0%",
        color: "yellow",
        icon: <span data-testid="icon-bajas">Icono bajas</span>,
      },
      {
        title: "EXISTENCIAS AGOTADAS",
        value: "10",
        percentage: "10.0%",
        color: "red",
        icon: <span data-testid="icon-agotadas">Icono agotadas</span>,
      },
    ];

    test("debe renderizar título y descripción de la sección", () => {
      render(
        <StatsSection
          title="Inventario"
          description="Resumen de existencias."
          cards={cards}
        />
      );

      expect(screen.getByText("Inventario")).toBeInTheDocument();
      expect(screen.getByText("Resumen de existencias.")).toBeInTheDocument();
    });

    test("debe renderizar todas las tarjetas recibidas", () => {
      render(
        <StatsSection
          title="Inventario"
          description="Resumen de existencias."
          cards={cards}
        />
      );

      expect(screen.getByText("TOTAL ARTÍCULOS")).toBeInTheDocument();
      expect(screen.getByText("EXISTENCIAS NORMAL")).toBeInTheDocument();
      expect(screen.getByText("EXISTENCIAS BAJAS")).toBeInTheDocument();
      expect(screen.getByText("EXISTENCIAS AGOTADAS")).toBeInTheDocument();

      expect(screen.getByText("100")).toBeInTheDocument();
      expect(screen.getByText("70")).toBeInTheDocument();
      expect(screen.getByText("20")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
    });

    test("debe renderizar los íconos de las tarjetas", () => {
      render(
        <StatsSection
          title="Inventario"
          description="Resumen de existencias."
          cards={cards}
        />
      );

      expect(screen.getByTestId("icon-total")).toBeInTheDocument();
      expect(screen.getByTestId("icon-normal")).toBeInTheDocument();
      expect(screen.getByTestId("icon-bajas")).toBeInTheDocument();
      expect(screen.getByTestId("icon-agotadas")).toBeInTheDocument();
    });

    test("debe mantener la estructura de sección y grid", () => {
      const { container } = render(
        <StatsSection
          title="Inventario"
          description="Resumen de existencias."
          cards={cards}
        />
      );

      expect(container.querySelector(".stats-section-container")).toBeInTheDocument();
      expect(container.querySelector(".stats-section-header")).toBeInTheDocument();
      expect(container.querySelector(".stats-section-grid")).toBeInTheDocument();

      const statCards = container.querySelectorAll(".stat-card");
      expect(statCards).toHaveLength(4);
    });
  });

  describe("StatsSectionSkeleton", () => {
    test("debe renderizar título y descripción del skeleton", () => {
      render(
        <StatsSectionSkeleton
          title="Inventario"
          description="Cargando estadísticas de inventario."
        />
      );

      expect(screen.getByText("Inventario")).toBeInTheDocument();
      expect(screen.getByText("Cargando estadísticas de inventario.")).toBeInTheDocument();
    });

    test("debe renderizar 4 skeleton cards", () => {
      const { container } = render(
        <StatsSectionSkeleton
          title="Inventario"
          description="Cargando estadísticas de inventario."
        />
      );

      const skeletonCards = container.querySelectorAll(".stat-card-skeleton");

      expect(skeletonCards).toHaveLength(4);
      expect(container.querySelector(".stats-section-grid")).toBeInTheDocument();
    });
  });
});