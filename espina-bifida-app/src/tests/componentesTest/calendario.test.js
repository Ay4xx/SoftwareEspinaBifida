import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Calendar from "../../componentes/agendacitas/calendario";

jest.mock("../../componentes/agendacitas/calendario.css", () => ({}));

describe("Calendar", () => {
  test("renderiza el mes y año seleccionados", () => {
    const selectedDate = new Date(2026, 5, 10);
    const setSelectedDate = jest.fn();

    render(
      <Calendar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    );

    expect(screen.getByDisplayValue("Junio")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2026")).toBeInTheDocument();
  });

  test("renderiza los días de la semana", () => {
    const selectedDate = new Date(2026, 5, 10);
    const setSelectedDate = jest.fn();

    render(
      <Calendar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    );

    expect(screen.getByText("D")).toBeInTheDocument();
    expect(screen.getByText("L")).toBeInTheDocument();
    expect(screen.getAllByText("M").length).toBeGreaterThan(0);
    expect(screen.getByText("X")).toBeInTheDocument();
    expect(screen.getByText("J")).toBeInTheDocument();
    expect(screen.getByText("V")).toBeInTheDocument();
    expect(screen.getByText("S")).toBeInTheDocument();
  });

  test("permite cambiar el mes", () => {
    const selectedDate = new Date(2026, 5, 10);
    const setSelectedDate = jest.fn();

    render(
      <Calendar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    );

    const monthSelect = screen.getByDisplayValue("Junio");

    fireEvent.change(monthSelect, {
      target: { value: "0" },
    });

    expect(screen.getByDisplayValue("Enero")).toBeInTheDocument();
  });

  test("permite cambiar el año", () => {
    const selectedDate = new Date(2026, 5, 10);
    const setSelectedDate = jest.fn();

    render(
      <Calendar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    );

    const yearSelect = screen.getByDisplayValue("2026");

    fireEvent.change(yearSelect, {
      target: { value: "2027" },
    });

    expect(screen.getByDisplayValue("2027")).toBeInTheDocument();
  });

  test("llama setSelectedDate al seleccionar un día", () => {
    const selectedDate = new Date(2026, 5, 10);
    const setSelectedDate = jest.fn();

    render(
      <Calendar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    );

    const dayButton = screen.getByRole("button", {
      name: "15",
    });

    fireEvent.click(dayButton);

    expect(setSelectedDate).toHaveBeenCalledTimes(1);

    const fechaSeleccionada = setSelectedDate.mock.calls[0][0];

    expect(fechaSeleccionada).toBeInstanceOf(Date);
    expect(fechaSeleccionada.getFullYear()).toBe(2026);
    expect(fechaSeleccionada.getMonth()).toBe(5);
    expect(fechaSeleccionada.getDate()).toBe(15);
  });

  test("marca como activo el día seleccionado", () => {
    const selectedDate = new Date(2026, 5, 10);
    const setSelectedDate = jest.fn();

    render(
      <Calendar
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
    );

    const selectedDay = screen.getByRole("button", {
      name: "10",
    });

    expect(selectedDay).toHaveClass("active-day");
  });

  test("actualiza mes y año cuando cambia selectedDate", () => {
    const setSelectedDate = jest.fn();

    const { rerender } = render(
      <Calendar
        selectedDate={new Date(2026, 5, 10)}
        setSelectedDate={setSelectedDate}
      />
    );

    expect(screen.getByDisplayValue("Junio")).toBeInTheDocument();

    rerender(
      <Calendar
        selectedDate={new Date(2027, 0, 5)}
        setSelectedDate={setSelectedDate}
      />
    );

    expect(screen.getByDisplayValue("Enero")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2027")).toBeInTheDocument();
  });
});