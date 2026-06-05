import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DatosPersonales from "../../componentes/registro/DatosPersonales/DatosPersonales";

jest.mock("../../componentes/registro/DatosPersonales/DatosPersonales.css", () => ({}));

jest.mock("lucide-react", () => ({
  UserRound: () => <span data-testid="icon-user">UserRound</span>,
}));

jest.mock("../../utils/validaciones", () => ({
  validarCURP: jest.fn((curp) => {
    if (curp.length !== 18) return "CURP inválida.";
    return null;
  }),
}));

describe("DatosPersonales", () => {
  const datosMock = {
    nombres: "",
    apellidoPaterno: "",
    genero: "",
    fechaNacimiento: "",
    curp: "",
  };

  const renderComponent = (props = {}) => {
    const defaultProps = {
      datos: datosMock,
      onChange: jest.fn(),
    };

    return render(
      <DatosPersonales
        {...defaultProps}
        {...props}
      />
    );
  };

  const getInput = (container, name) => {
    return container.querySelector(`[name="${name}"]`);
  };

  test("renderiza correctamente la sección de datos personales", () => {
    const { container } = renderComponent();

    expect(screen.getByText("Datos Personales")).toBeInTheDocument();
    expect(screen.getByTestId("icon-user")).toBeInTheDocument();

    expect(screen.getByText("Nombre(s)")).toBeInTheDocument();
    expect(screen.getByText("Apellido(s)")).toBeInTheDocument();
    expect(screen.getByText("Género")).toBeInTheDocument();
    expect(screen.getByText("Fecha de Nacimiento")).toBeInTheDocument();
    expect(screen.getByText(/CURP/i)).toBeInTheDocument();

    expect(getInput(container, "nombres")).toBeInTheDocument();
    expect(getInput(container, "apellidoPaterno")).toBeInTheDocument();
    expect(getInput(container, "fechaNacimiento")).toBeInTheDocument();
    expect(getInput(container, "curp")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /Masculino/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Femenino/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Otro/i })).toBeInTheDocument();
  });

  test("muestra los valores recibidos en props", () => {
    const { container } = renderComponent({
      datos: {
        nombres: "Juan",
        apellidoPaterno: "Pérez",
        genero: "masculino",
        fechaNacimiento: "2010-05-10",
        curp: "PEPJ100510HNLRRN09",
      },
    });

    expect(getInput(container, "nombres")).toHaveValue("Juan");
    expect(getInput(container, "apellidoPaterno")).toHaveValue("Pérez");
    expect(getInput(container, "fechaNacimiento")).toHaveValue("2010-05-10");
    expect(getInput(container, "curp")).toHaveValue("PEPJ100510HNLRRN09");

    expect(screen.getByRole("button", { name: /Masculino/i })).toHaveClass("activo");
  });

  test("llama onChange al cambiar nombre", () => {
    const onChange = jest.fn();

    const { container } = renderComponent({ onChange });

    fireEvent.change(getInput(container, "nombres"), {
      target: {
        name: "nombres",
        value: "María",
      },
    });

    expect(onChange).toHaveBeenCalledWith({
      nombres: "María",
    });
  });

  test("convierte CURP a mayúsculas y llama onChange", () => {
    const onChange = jest.fn();

    const { container } = renderComponent({ onChange });

    fireEvent.change(getInput(container, "curp"), {
      target: {
        name: "curp",
        value: "pepj100510hnlrrn09",
      },
    });

    expect(onChange).toHaveBeenCalledWith({
      curp: "PEPJ100510HNLRRN09",
    });
  });

  test("muestra mensaje válido cuando CURP tiene 18 caracteres", () => {
    renderComponent({
      datos: {
        ...datosMock,
        curp: "PEPJ100510HNLRRN09",
      },
    });

    expect(screen.getByText("CURP con formato válido.")).toBeInTheDocument();
  });

  test("selecciona género masculino", () => {
    const onChange = jest.fn();

    renderComponent({ onChange });

    fireEvent.click(screen.getByRole("button", { name: /Masculino/i }));

    expect(onChange).toHaveBeenCalledWith({
      genero: "masculino",
    });
  });

  test("selecciona género femenino", () => {
    const onChange = jest.fn();

    renderComponent({ onChange });

    fireEvent.click(screen.getByRole("button", { name: /Femenino/i }));

    expect(onChange).toHaveBeenCalledWith({
      genero: "femenino",
    });
  });

  test("selecciona género otro", () => {
    const onChange = jest.fn();

    renderComponent({ onChange });

    fireEvent.click(screen.getByRole("button", { name: /Otro/i }));

    expect(onChange).toHaveBeenCalledWith({
      genero: "otro",
    });
  });
});