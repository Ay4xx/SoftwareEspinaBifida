import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import HistorialMedico from "../../componentes/registro/HistorialMedico/HistorialMedico";

jest.mock("../../componentes/registro/HistorialMedico/HistorialMedico.css", () => ({}));

jest.mock("lucide-react", () => ({
  ClipboardList: () => <span data-testid="icon-clipboard">ClipboardList</span>,
}));

describe("HistorialMedico", () => {
  const datosMock = {
    lugarNacimiento: "",
    hospitalNacimiento: "",
    tipoSangre: "",
    usaValvula: "",
    tipoEspinaBifida: "",
    otrosPadecimiento: "",
    notas: "",
  };

  const renderComponent = (props = {}) => {
    const defaultProps = {
      datos: datosMock,
      onChange: jest.fn(),
    };

    return render(
      <HistorialMedico
        {...defaultProps}
        {...props}
      />
    );
  };

  const getInput = (container, name) => {
    return container.querySelector(`[name="${name}"]`);
  };

  test("renderiza correctamente la sección historial médico", () => {
    const { container } = renderComponent();

    expect(screen.getByText("Historial Médico")).toBeInTheDocument();
    expect(screen.getByTestId("icon-clipboard")).toBeInTheDocument();

    expect(screen.getByText("Lugar de Nacimiento")).toBeInTheDocument();
    expect(screen.getByText("Hospital de Nacimiento")).toBeInTheDocument();
    expect(screen.getByText("Tipo de Sangre")).toBeInTheDocument();
    expect(screen.getByText("¿Usa Válvula?")).toBeInTheDocument();
    expect(screen.getByText("Padecimiento (Tipo de Espina Bífida)")).toBeInTheDocument();
    expect(screen.getByText("Notas o Comentarios")).toBeInTheDocument();

    expect(getInput(container, "lugarNacimiento")).toBeInTheDocument();
    expect(getInput(container, "hospitalNacimiento")).toBeInTheDocument();
    expect(getInput(container, "notas")).toBeInTheDocument();
  });

  test("llama onChange al escribir lugar de nacimiento", () => {
    const onChange = jest.fn();

    const { container } = renderComponent({ onChange });

    fireEvent.change(getInput(container, "lugarNacimiento"), {
      target: {
        name: "lugarNacimiento",
        value: "Monterrey",
      },
    });

    expect(onChange).toHaveBeenCalledWith({
      lugarNacimiento: "Monterrey",
    });
  });

  test("llama onChange al escribir hospital de nacimiento", () => {
    const onChange = jest.fn();

    const { container } = renderComponent({ onChange });

    fireEvent.change(getInput(container, "hospitalNacimiento"), {
      target: {
        name: "hospitalNacimiento",
        value: "Hospital Universitario",
      },
    });

    expect(onChange).toHaveBeenCalledWith({
      hospitalNacimiento: "Hospital Universitario",
    });
  });

  test("selecciona tipo de sangre", () => {
    const onChange = jest.fn();

    renderComponent({ onChange });

    fireEvent.click(screen.getByRole("button", { name: "A+" }));

    expect(onChange).toHaveBeenCalledWith({
      tipoSangre: "A+",
    });
  });

  test("deselecciona tipo de sangre si ya estaba seleccionado", () => {
    const onChange = jest.fn();

    renderComponent({
      onChange,
      datos: {
        ...datosMock,
        tipoSangre: "A+",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "A+" }));

    expect(onChange).toHaveBeenCalledWith({
      tipoSangre: "",
    });
  });

  test("selecciona uso de válvula", () => {
    const onChange = jest.fn();

    renderComponent({ onChange });

    fireEvent.click(screen.getByRole("button", { name: "Sí" }));

    expect(onChange).toHaveBeenCalledWith({
      usaValvula: "Sí",
    });
  });

  test("deselecciona uso de válvula si ya estaba seleccionado", () => {
    const onChange = jest.fn();

    renderComponent({
      onChange,
      datos: {
        ...datosMock,
        usaValvula: "Sí",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "Sí" }));

    expect(onChange).toHaveBeenCalledWith({
      usaValvula: "",
    });
  });

  test("selecciona padecimiento", () => {
  const onChange = jest.fn();

  renderComponent({ onChange });

  const botonMielomeningocele = screen
    .getAllByRole("button")
    .find(
      (button) =>
        button.textContent.trim() === "MIELOMENINGOCELE"
    );

  fireEvent.click(botonMielomeningocele);

  expect(onChange).toHaveBeenCalledWith({
    tipoEspinaBifida: "MIELOMENINGOCELE",
  });
});

  test("muestra campo otros padecimientos cuando tipoEspinaBifida es OTROS", () => {
    const { container } = renderComponent({
      datos: {
        ...datosMock,
        tipoEspinaBifida: "OTROS",
      },
    });

    expect(getInput(container, "otrosPadecimiento")).toBeInTheDocument();
  });

  test("llama onChange al escribir otros padecimientos", () => {
    const onChange = jest.fn();

    const { container } = renderComponent({
      onChange,
      datos: {
        ...datosMock,
        tipoEspinaBifida: "OTROS",
      },
    });

    fireEvent.change(getInput(container, "otrosPadecimiento"), {
      target: {
        name: "otrosPadecimiento",
        value: "Otro padecimiento",
      },
    });

    expect(onChange).toHaveBeenCalledWith({
      otrosPadecimiento: "Otro padecimiento",
    });
  });

  test("llama onChange al escribir notas", () => {
    const onChange = jest.fn();

    const { container } = renderComponent({ onChange });

    fireEvent.change(getInput(container, "notas"), {
      target: {
        name: "notas",
        value: "Notas importantes",
      },
    });

    expect(onChange).toHaveBeenCalledWith({
      notas: "Notas importantes",
    });
  });
});