import { render, screen, fireEvent } from "@testing-library/react";
import Fotografia from "../../componentes/registro/Fotografia/Fotografia";

// ── Helpers ──────────────────────────────────────────────────────────────────

const DOCS_VACIOS = { actaNacimiento: null, curp: null, comprobanteDomicilio: null, ineFamilia: null };
const DATOS_BASE   = { foto: null, documentos: DOCS_VACIOS };
const URL_FOTO     = "http://localhost:3001/uploads/foto.jpg";

const mockOnChange  = jest.fn();
const mockOnGuardar = jest.fn();

const crearArchivo = (nombre, tipo = "application/pdf") =>
  new File(["contenido"], nombre, { type: tipo });

const renderFotografia = (props = {}) =>
  render(<Fotografia datos={DATOS_BASE} onChange={mockOnChange} {...props} />);

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("Fotografia", () => {
  beforeEach(() => jest.clearAllMocks());

  // ── Renderizado general ──────────────────────────────────────────────────

  test("renderiza el título del componente", () => {
    renderFotografia();
    expect(screen.getByText("Fotografía y Documentos")).toBeInTheDocument();
  });

  test("renderiza la zona de carga de foto", () => {
    renderFotografia();
    expect(screen.getByText("Arrastra tu foto aquí")).toBeInTheDocument();
    expect(screen.getByText(/PNG, JPG hasta 5 MB/i)).toBeInTheDocument();
  });

  test("renderiza el título y los 4 documentos opcionales", () => {
    renderFotografia();
    expect(screen.getByText("Documentos")).toBeInTheDocument();
    expect(screen.getByText("Acta de nacimiento")).toBeInTheDocument();
    expect(screen.getByText("CURP")).toBeInTheDocument();
    expect(screen.getByText("Comprobante de domicilio")).toBeInTheDocument();
    expect(screen.getByText("INE de familia (menores)")).toBeInTheDocument();
  });

  test("renderiza 4 botones 'Seleccionar' (uno por documento)", () => {
    renderFotografia();
    expect(screen.getAllByText("Seleccionar")).toHaveLength(4);
  });

  // ── Botón Guardar cambios ────────────────────────────────────────────────

  test("muestra 'Guardar cambios' cuando se pasa onGuardar", () => {
    renderFotografia({ onGuardar: mockOnGuardar, cambiosGuardados: false });
    expect(screen.getByText("Guardar cambios")).toBeInTheDocument();
  });

  test("no muestra 'Guardar cambios' cuando onGuardar es null", () => {
    renderFotografia({ onGuardar: null });
    expect(screen.queryByText("Guardar cambios")).not.toBeInTheDocument();
  });

  test("muestra 'Guardado' cuando cambiosGuardados es true", () => {
    renderFotografia({ onGuardar: mockOnGuardar, cambiosGuardados: true });
    expect(screen.getByText("Guardado")).toBeInTheDocument();
  });

  test("llama a onGuardar al hacer clic en el botón", () => {
    renderFotografia({ onGuardar: mockOnGuardar, cambiosGuardados: false });
    fireEvent.click(screen.getByText("Guardar cambios"));
    expect(mockOnGuardar).toHaveBeenCalledTimes(1);
  });

  // ── Preview de foto ──────────────────────────────────────────────────────

  test("muestra la imagen cuando datos.foto es una URL", () => {
    renderFotografia({ datos: { ...DATOS_BASE, foto: URL_FOTO } });
    const img = screen.getByAltText("Foto actual del paciente");
    expect(img).toBeInTheDocument();
    expect(img.src).toBe(URL_FOTO);
  });

  test("muestra 'Foto actual' y 'Subir nueva foto' cuando ya hay foto", () => {
    renderFotografia({ datos: { ...DATOS_BASE, foto: URL_FOTO } });
    expect(screen.getByText("Foto actual")).toBeInTheDocument();
    expect(screen.getByText("Subir nueva foto")).toBeInTheDocument();
  });

  // ── Carga de foto ────────────────────────────────────────────────────────

  test("llama a onChange al seleccionar una imagen válida", () => {
    const { container } = renderFotografia();
    const archivo = crearArchivo("foto.jpg", "image/jpeg");
    const input = container.querySelector('input[accept="image/png,image/jpeg"]');

    fireEvent.change(input, { target: { files: [archivo] } });

    expect(mockOnChange).toHaveBeenCalledWith({ foto: archivo });
  });

  test("no llama a onChange si el archivo no es imagen válida", () => {
    const { container } = renderFotografia();
    const input = container.querySelector('input[accept="image/png,image/jpeg"]');

    fireEvent.change(input, { target: { files: [crearArchivo("doc.pdf")] } });

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  // ── Carga de documentos ──────────────────────────────────────────────────

  test("llama a onChange con el documento al seleccionarlo", () => {
    const { container } = renderFotografia();
    const archivo = crearArchivo("acta.pdf");
    const inputs = container.querySelectorAll('input[accept="image/png,image/jpeg,application/pdf"]');

    fireEvent.change(inputs[0], { target: { files: [archivo] } });

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        documentos: expect.objectContaining({ actaNacimiento: archivo }),
      })
    );
  });

  test("muestra el nombre del archivo cuando un documento está cargado", () => {
    const datosConDoc = {
      ...DATOS_BASE,
      documentos: { ...DOCS_VACIOS, actaNacimiento: crearArchivo("acta.pdf") },
    };
    renderFotografia({ datos: datosConDoc });
    expect(screen.getByText("acta.pdf")).toBeInTheDocument();
  });

  test("llama a onChange con null al quitar un documento", () => {
    const datosConDoc = {
      ...DATOS_BASE,
      documentos: { ...DOCS_VACIOS, actaNacimiento: crearArchivo("acta.pdf") },
    };
    const { container } = renderFotografia({ datos: datosConDoc });

    fireEvent.click(container.querySelector(".doc-item-quitar"));

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        documentos: expect.objectContaining({ actaNacimiento: null }),
      })
    );
  });
});
