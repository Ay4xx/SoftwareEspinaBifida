import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import HistorialTutor from "../../componentes/registro/HistorialTutor/HistorialTutor";

jest.mock("../../componentes/registro/HistorialTutor/HistorialTutor.css", () => ({}));

jest.mock("lucide-react", () => ({
  Users: () => <span data-testid="icon-users">Users</span>,
  HeartPulse: () => <span data-testid="icon-heart">HeartPulse</span>,
  ClipboardList: () => <span data-testid="icon-clipboard">ClipboardList</span>,
}));

describe("HistorialTutor", () => {
  const datosMock = {
    tutorParentesco: "",
    tutorNombre: "",
    tutorEdad: "",
    tutorLugarNacimiento: "",
    tutorOcupacion: "",
    tutorEscolaridad: "",
    tutorSeguroMedico: "",
    cdEmbarazo: "",
    citasControl: "",
    madreSeguroMedico: "",
    acidoFolico: "",
    adicciones: "",
    hijoDtn: "",
    familiarDtn: "",
    expoToxicos: "",
    descripcionExpoToxicos: "",
  };

  const renderComponent = (props = {}) => {
    const defaultProps = {
      datos: datosMock,
      onChange: jest.fn(),
      onAgregarTutor: jest.fn(),
    };

    return render(
      <HistorialTutor
        {...defaultProps}
        {...props}
      />
    );
  };

  const getInput = (container, name) => {
    return container.querySelector(`[name="${name}"]`);
  };

  test("renderiza sección datos del tutor", () => {
    renderComponent();

    expect(screen.getByText("Datos del Tutor")).toBeInTheDocument();
    expect(screen.getByTestId("icon-users")).toBeInTheDocument();
  });

  test("no muestra campos del tutor si no hay parentesco Madre o Padre", () => {
    renderComponent();

    expect(screen.queryByText("Nombre completo")).not.toBeInTheDocument();
    expect(screen.queryByText("Edad")).not.toBeInTheDocument();
    expect(screen.queryByText("Historial Familiar")).not.toBeInTheDocument();
  });

  test("muestra campos de madre cuando tutorParentesco es Madre", () => {
    renderComponent({
      datos: {
        ...datosMock,
        tutorParentesco: "Madre",
      },
    });

    expect(screen.getByText("Nombre completo")).toBeInTheDocument();
    expect(screen.getByText("Edad")).toBeInTheDocument();
    expect(screen.getByText("Historial de la Madre")).toBeInTheDocument();
    expect(screen.getByText("Historial Familiar")).toBeInTheDocument();
    expect(screen.getByText("Condiciones del Embarazo")).toBeInTheDocument();
    expect(screen.getByText("¿Tomó Ácido Fólico durante el embarazo?")).toBeInTheDocument();
    expect(screen.getByText("+ Agregar Padre")).toBeInTheDocument();
  });

  test("muestra campos de padre cuando tutorParentesco es Padre", () => {
    renderComponent({
      datos: {
        ...datosMock,
        tutorParentesco: "Padre",
      },
    });

    expect(screen.getByText("Nombre completo")).toBeInTheDocument();
    expect(screen.getByText("Edad")).toBeInTheDocument();
    expect(screen.getByText("Seguro Médico")).toBeInTheDocument();
    expect(screen.getByText("Historial Familiar")).toBeInTheDocument();
    expect(screen.queryByText("Historial de la Madre")).not.toBeInTheDocument();
    expect(screen.getByText("+ Agregar Madre")).toBeInTheDocument();
  });

  test("llama onChange al escribir nombre del tutor", () => {
    const onChange = jest.fn();

    const { container } = renderComponent({
      onChange,
      datos: {
        ...datosMock,
        tutorParentesco: "Madre",
      },
    });

    fireEvent.change(getInput(container, "tutorNombre"), {
      target: {
        name: "tutorNombre",
        value: "María Pérez",
      },
    });

    expect(onChange).toHaveBeenCalledWith({
      tutorNombre: "María Pérez",
    });
  });

  test("llama onChange al escribir edad del tutor", () => {
    const onChange = jest.fn();

    const { container } = renderComponent({
      onChange,
      datos: {
        ...datosMock,
        tutorParentesco: "Madre",
      },
    });

    fireEvent.change(getInput(container, "tutorEdad"), {
      target: {
        name: "tutorEdad",
        value: "35",
      },
    });

    expect(onChange).toHaveBeenCalledWith({
      tutorEdad: "35",
    });
  });

  test("llama onChange al seleccionar escolaridad", () => {
    const onChange = jest.fn();

    const { container } = renderComponent({
      onChange,
      datos: {
        ...datosMock,
        tutorParentesco: "Padre",
      },
    });

    fireEvent.change(getInput(container, "tutorEscolaridad"), {
      target: {
        name: "tutorEscolaridad",
        value: "Licenciatura",
      },
    });

    expect(onChange).toHaveBeenCalledWith({
      tutorEscolaridad: "Licenciatura",
    });
  });

  test("llama onChange al escribir seguro médico del padre", () => {
    const onChange = jest.fn();

    const { container } = renderComponent({
      onChange,
      datos: {
        ...datosMock,
        tutorParentesco: "Padre",
      },
    });

    fireEvent.change(getInput(container, "tutorSeguroMedico"), {
      target: {
        name: "tutorSeguroMedico",
        value: "IMSS",
      },
    });

    expect(onChange).toHaveBeenCalledWith({
      tutorSeguroMedico: "IMSS",
    });
  });

  test("llama onChange al escribir condiciones del embarazo", () => {
    const onChange = jest.fn();

    const { container } = renderComponent({
      onChange,
      datos: {
        ...datosMock,
        tutorParentesco: "Madre",
      },
    });

    fireEvent.change(getInput(container, "cdEmbarazo"), {
      target: {
        name: "cdEmbarazo",
        value: "Embarazo controlado",
      },
    });

    expect(onChange).toHaveBeenCalledWith({
      cdEmbarazo: "Embarazo controlado",
    });
  });

  test("selecciona ácido fólico Sí", () => {
    const onChange = jest.fn();

    renderComponent({
      onChange,
      datos: {
        ...datosMock,
        tutorParentesco: "Madre",
      },
    });

    const botonesSi = screen.getAllByRole("button", { name: "Sí" });

    fireEvent.click(botonesSi[0]);

    expect(onChange).toHaveBeenCalledWith({
      acidoFolico: "Sí",
    });
  });

  test("selecciona hijoDtn Sí", () => {
    const onChange = jest.fn();

    renderComponent({
      onChange,
      datos: {
        ...datosMock,
        tutorParentesco: "Padre",
      },
    });

    const botonesSi = screen.getAllByRole("button", { name: "Sí" });

    fireEvent.click(botonesSi[0]);

    expect(onChange).toHaveBeenCalledWith({
      hijoDtn: "Sí",
    });
  });

  test("deselecciona hijoDtn si ya estaba seleccionado", () => {
    const onChange = jest.fn();

    renderComponent({
      onChange,
      datos: {
        ...datosMock,
        tutorParentesco: "Padre",
        hijoDtn: "Sí",
      },
    });

    const botonesSi = screen.getAllByRole("button", { name: "Sí" });

    fireEvent.click(botonesSi[0]);

    expect(onChange).toHaveBeenCalledWith({
      hijoDtn: "",
    });
  });

  test("muestra descripción de exposición cuando expoToxicos es Sí", () => {
    const { container } = renderComponent({
      datos: {
        ...datosMock,
        tutorParentesco: "Madre",
        expoToxicos: "Sí",
      },
    });

    expect(screen.getByText("Descripción de la exposición")).toBeInTheDocument();
    expect(getInput(container, "descripcionExpoToxicos")).toBeInTheDocument();
  });

  test("llama onChange al escribir descripción de exposición", () => {
    const onChange = jest.fn();

    const { container } = renderComponent({
      onChange,
      datos: {
        ...datosMock,
        tutorParentesco: "Madre",
        expoToxicos: "Sí",
      },
    });

    fireEvent.change(getInput(container, "descripcionExpoToxicos"), {
      target: {
        name: "descripcionExpoToxicos",
        value: "Exposición a químicos",
      },
    });

    expect(onChange).toHaveBeenCalledWith({
      descripcionExpoToxicos: "Exposición a químicos",
    });
  });

  test("llama onAgregarTutor al presionar agregar tutor", () => {
    const onAgregarTutor = jest.fn();

    renderComponent({
      onAgregarTutor,
      datos: {
        ...datosMock,
        tutorParentesco: "Madre",
      },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "+ Agregar Padre" })
    );

    expect(onAgregarTutor).toHaveBeenCalledTimes(1);
  });

  test("no muestra botón agregar tutor si no recibe onAgregarTutor", () => {
    render(
      <HistorialTutor
        datos={{
          ...datosMock,
          tutorParentesco: "Madre",
        }}
        onChange={jest.fn()}
      />
    );

    expect(screen.queryByText("+ Agregar Padre")).not.toBeInTheDocument();
  });
});