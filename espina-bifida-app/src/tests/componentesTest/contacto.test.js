import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Contacto from "../../componentes/registro/Contacto/Contacto";

jest.mock("../../componentes/registro/Contacto/Contacto.css", () => ({}));

jest.mock("lucide-react", () => ({
  Phone: () => <span data-testid="icon-phone">Phone</span>,
}));

jest.mock("../../constantes/mexico", () => ({
  ESTADOS_MEXICO: ["Nuevo León", "Jalisco", "CDMX"],
}));

describe("Contacto", () => {
  const datosMock = {
    direccion: "",
    codigoPostal: "",
    estado: "",
    ciudad: "",
    telefonoCasa: "",
    telefonoCelular: "",
    correo: "",
    emergenciaContacto: "",
    emergenciaTelefono: "",
  };

  const renderComponent = (props = {}) => {
    const defaultProps = {
      datos: datosMock,
      onChange: jest.fn(),
    };

    return render(
      <Contacto
        {...defaultProps}
        {...props}
      />
    );
  };

  const getInput = (container, name) => {
    return container.querySelector(`[name="${name}"]`);
  };

  test("renderiza correctamente la sección de contacto", () => {
    const { container } = renderComponent();

    expect(screen.getByText("Contacto")).toBeInTheDocument();
    expect(screen.getByTestId("icon-phone")).toBeInTheDocument();

    expect(screen.getByText("Dirección")).toBeInTheDocument();
    expect(screen.getByText("Código Postal")).toBeInTheDocument();
    expect(screen.getByText("Estado de Residencia")).toBeInTheDocument();
    expect(screen.getByText("Ciudad de Residencia")).toBeInTheDocument();
    expect(screen.getByText("Teléfono Casa")).toBeInTheDocument();
    expect(screen.getByText("Teléfono Celular")).toBeInTheDocument();
    expect(screen.getByText("Correo Electrónico")).toBeInTheDocument();
    expect(screen.getByText("En caso de emergencia")).toBeInTheDocument();

    expect(getInput(container, "direccion")).toBeInTheDocument();
    expect(getInput(container, "codigoPostal")).toBeInTheDocument();
    expect(getInput(container, "estado")).toBeInTheDocument();
    expect(getInput(container, "ciudad")).toBeInTheDocument();
    expect(getInput(container, "telefonoCasa")).toBeInTheDocument();
    expect(getInput(container, "telefonoCelular")).toBeInTheDocument();
    expect(getInput(container, "correo")).toBeInTheDocument();
    expect(getInput(container, "emergenciaContacto")).toBeInTheDocument();
    expect(getInput(container, "emergenciaTelefono")).toBeInTheDocument();
  });

  test("muestra los valores recibidos en props", () => {
    const { container } = renderComponent({
      datos: {
        direccion: "Av. Universidad 123",
        codigoPostal: "64000",
        estado: "Nuevo León",
        ciudad: "Monterrey",
        telefonoCasa: "8111111111",
        telefonoCelular: "8122222222",
        correo: "test@correo.com",
        emergenciaContacto: "María Pérez",
        emergenciaTelefono: "8133333333",
      },
    });

    expect(getInput(container, "direccion")).toHaveValue("Av. Universidad 123");
    expect(getInput(container, "codigoPostal")).toHaveValue("64000");
    expect(getInput(container, "estado")).toHaveValue("Nuevo León");
    expect(getInput(container, "ciudad")).toHaveValue("Monterrey");
    expect(getInput(container, "telefonoCasa")).toHaveValue("8111111111");
    expect(getInput(container, "telefonoCelular")).toHaveValue("8122222222");
    expect(getInput(container, "correo")).toHaveValue("test@correo.com");
    expect(getInput(container, "emergenciaContacto")).toHaveValue("María Pérez");
    expect(getInput(container, "emergenciaTelefono")).toHaveValue("8133333333");
  });

  test("llama onChange al modificar dirección", () => {
    const onChange = jest.fn();

    const { container } = renderComponent({ onChange });

    fireEvent.change(getInput(container, "direccion"), {
      target: {
        name: "direccion",
        value: "Calle 123",
      },
    });

    expect(onChange).toHaveBeenCalledWith({
      direccion: "Calle 123",
    });
  });

  test("llama onChange al seleccionar estado", () => {
    const onChange = jest.fn();

    const { container } = renderComponent({ onChange });

    fireEvent.change(getInput(container, "estado"), {
      target: {
        name: "estado",
        value: "Nuevo León",
      },
    });

    expect(onChange).toHaveBeenCalledWith({
      estado: "Nuevo León",
    });
  });

  test("respeta maxLength en código postal y teléfonos", () => {
    const { container } = renderComponent();

    expect(getInput(container, "codigoPostal")).toHaveAttribute("maxLength", "5");
    expect(getInput(container, "telefonoCasa")).toHaveAttribute("maxLength", "10");
    expect(getInput(container, "telefonoCelular")).toHaveAttribute("maxLength", "10");
    expect(getInput(container, "emergenciaTelefono")).toHaveAttribute("maxLength", "10");
  });
});