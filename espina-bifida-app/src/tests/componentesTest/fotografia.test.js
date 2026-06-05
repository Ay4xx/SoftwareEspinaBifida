import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Fotografia from "../../componentes/registro/Fotografia/Fotografia";

jest.mock("../../componentes/registro/Fotografia/Fotografia.css", () => ({}));

jest.mock("lucide-react", () => ({
  Camera: () => <span data-testid="icon-camera">Camera</span>,
  Check: () => <span data-testid="icon-check">Check</span>,
  FileText: () => <span data-testid="icon-file">FileText</span>,
  Upload: () => <span data-testid="icon-upload">Upload</span>,
  X: () => <span data-testid="icon-x">X</span>,
}));

describe("Fotografia", () => {
  const datosMock = {
    foto: null,
    documentos: {},
  };

  const renderComponent = (props = {}) => {
    const defaultProps = {
      datos: datosMock,
      onChange: jest.fn(),
      onGuardar: jest.fn(),
      cambiosGuardados: false,
    };

    return render(
      <Fotografia
        {...defaultProps}
        {...props}
      />
    );
  };

  test("renderiza correctamente la sección de fotografía y documentos", () => {
    renderComponent();

    expect(screen.getByText("Fotografía y Documentos")).toBeInTheDocument();
    expect(screen.getByText("Fotografía del paciente")).toBeInTheDocument();
    expect(screen.getByText("Documentos")).toBeInTheDocument();

    expect(screen.getByText("Arrastra tu foto aquí")).toBeInTheDocument();
    expect(screen.getByText("o haz clic para seleccionar")).toBeInTheDocument();
    expect(screen.getByText("PNG, JPG hasta 5 MB")).toBeInTheDocument();

    expect(screen.getByText("Acta de nacimiento")).toBeInTheDocument();
    expect(screen.getByText("CURP")).toBeInTheDocument();
    expect(screen.getByText("Comprobante de domicilio")).toBeInTheDocument();
    expect(screen.getByText("INE de familia (menores)")).toBeInTheDocument();
  });

  test("muestra botón Guardar cambios si recibe onGuardar", () => {
    const onGuardar = jest.fn();

    renderComponent({ onGuardar });

    const boton = screen.getByRole("button", { name: "Guardar cambios" });

    expect(boton).toBeInTheDocument();

    fireEvent.click(boton);

    expect(onGuardar).toHaveBeenCalledTimes(1);
  });

  test("muestra Guardado cuando cambiosGuardados es true", () => {
    renderComponent({
      cambiosGuardados: true,
    });

    expect(screen.getByText("Guardado")).toBeInTheDocument();
    expect(screen.getByTestId("icon-check")).toBeInTheDocument();
  });

  test("muestra preview cuando foto es string", () => {
    renderComponent({
      datos: {
        foto: "http://localhost/foto.png",
        documentos: {},
      },
    });

    const img = screen.getByAltText("Foto actual del paciente");

    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "http://localhost/foto.png");
    expect(screen.getByText("Foto actual")).toBeInTheDocument();
    expect(screen.getByText("Subir nueva foto")).toBeInTheDocument();
  });

  test("llama onChange cuando se selecciona una foto válida", () => {
    const onChange = jest.fn();

    const { container } = renderComponent({ onChange });

    const file = new File(["foto"], "paciente.png", {
      type: "image/png",
    });

    Object.defineProperty(file, "size", {
      value: 1024,
    });

    const inputFoto = container.querySelector('input[accept="image/png,image/jpeg"]');

    fireEvent.change(inputFoto, {
      target: {
        files: [file],
      },
    });

    expect(onChange).toHaveBeenCalledWith({
      foto: file,
    });
  });

  test("no llama onChange si la foto tiene tipo inválido", () => {
    const onChange = jest.fn();

    const { container } = renderComponent({ onChange });

    const file = new File(["archivo"], "documento.pdf", {
      type: "application/pdf",
    });

    Object.defineProperty(file, "size", {
      value: 1024,
    });

    const inputFoto = container.querySelector('input[accept="image/png,image/jpeg"]');

    fireEvent.change(inputFoto, {
      target: {
        files: [file],
      },
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  test("no llama onChange si la foto pesa más de 5MB", () => {
    const onChange = jest.fn();

    const { container } = renderComponent({ onChange });

    const file = new File(["foto"], "grande.png", {
      type: "image/png",
    });

    Object.defineProperty(file, "size", {
      value: 6 * 1024 * 1024,
    });

    const inputFoto = container.querySelector('input[accept="image/png,image/jpeg"]');

    fireEvent.change(inputFoto, {
      target: {
        files: [file],
      },
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  test("llama onChange al seleccionar documento", () => {
    const onChange = jest.fn();

    const { container } = renderComponent({ onChange });

    const file = new File(["acta"], "acta.pdf", {
      type: "application/pdf",
    });

    const inputs = container.querySelectorAll('input[type="file"]');
    const inputActa = inputs[1];

    fireEvent.change(inputActa, {
      target: {
        files: [file],
      },
    });

    expect(onChange).toHaveBeenCalledWith({
      documentos: {
        actaNacimiento: file,
      },
    });
  });

  test("muestra nombre del documento cargado y permite quitarlo", () => {
    const onChange = jest.fn();

    renderComponent({
      onChange,
      datos: {
        foto: null,
        documentos: {
          curp: new File(["curp"], "curp.pdf", {
            type: "application/pdf",
          }),
        },
      },
    });

    expect(screen.getByText("curp.pdf")).toBeInTheDocument();

    fireEvent.click(screen.getByTitle("Quitar archivo"));

    expect(onChange).toHaveBeenCalledWith({
      documentos: {
        curp: null,
      },
    });
  });

  test("permite arrastrar una foto válida", () => {
    const onChange = jest.fn();

    renderComponent({ onChange });

    const file = new File(["foto"], "arrastrada.jpg", {
      type: "image/jpeg",
    });

    Object.defineProperty(file, "size", {
      value: 1024,
    });

    const zona = screen.getByText("Arrastra tu foto aquí").closest(".foto-zona");

    fireEvent.dragOver(zona);
    expect(zona).toHaveClass("encima");

    fireEvent.drop(zona, {
      dataTransfer: {
        files: [file],
      },
    });

    expect(onChange).toHaveBeenCalledWith({
      foto: file,
    });
  });
});