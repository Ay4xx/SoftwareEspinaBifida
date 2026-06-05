import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import RegistroPage from "../../pantallas/registro";
import {
  crearPacientePaso1,
  actualizarPaso2,
  actualizarPaso3,
  actualizarPaso4,
  actualizarPaso5,
  actualizarPaciente,
} from "../../services/registroService";

jest.mock("../../pantallas/registro.css", () => ({}));

const mockNavigate = jest.fn();
let mockLocationState = {};

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: mockLocationState,
  }),
}));

jest.mock("lucide-react", () => ({
  ArrowLeft: () => <span data-testid="icon-left">ArrowLeft</span>,
  ArrowRight: () => <span data-testid="icon-right">ArrowRight</span>,
  Check: () => <span data-testid="icon-check">Check</span>,
  X: () => <span data-testid="icon-x">X</span>,
}));

jest.mock("../../services/registroService", () => ({
  crearPacientePaso1: jest.fn(),
  actualizarPaso2: jest.fn(),
  actualizarPaso3: jest.fn(),
  actualizarPaso4: jest.fn(),
  actualizarPaso5: jest.fn(),
  actualizarPaciente: jest.fn(),
}));

jest.mock("../../utils/validaciones", () => ({
  validarCURP: jest.fn(() => null),
}));

jest.mock("../../componentes/registro/DatosPersonales/DatosPersonales", () => {
  return function MockDatosPersonales({ datos, onChange }) {
    return (
      <div data-testid="datos-personales">
        <h2>Mock Datos Personales</h2>
        <input
          data-testid="input-curp"
          value={datos.curp || ""}
          onChange={(e) => onChange({ curp: e.target.value })}
        />
        <button onClick={() => onChange({ nombres: "Juan" })}>
          Cambiar nombre
        </button>
      </div>
    );
  };
});

jest.mock("../../componentes/registro/Contacto/Contacto", () => {
  return function MockContacto({ datos, onChange }) {
    return (
      <div data-testid="contacto">
        <h2>Mock Contacto</h2>
        <button onClick={() => onChange({ ciudad: "Monterrey" })}>
          Cambiar ciudad
        </button>
        <span>{datos.ciudad}</span>
      </div>
    );
  };
});

jest.mock("../../componentes/registro/HistorialMedico/HistorialMedico", () => {
  return function MockHistorialMedico({ datos, onChange }) {
    return (
      <div data-testid="historial-medico">
        <h2>Mock Historial Médico</h2>
        <button onClick={() => onChange({ tipoSangre: "O+" })}>
          Cambiar sangre
        </button>
        <span>{datos.tipoSangre}</span>
      </div>
    );
  };
});

jest.mock("../../componentes/registro/HistorialTutor/HistorialTutor", () => {
  return function MockHistorialTutor({ datos, onChange }) {
    return (
      <div data-testid="historial-tutor">
        <h2>Mock Historial Tutor</h2>
        <p>Parentesco: {datos.tutorParentesco}</p>
        <button onClick={() => onChange({ tutorNombre: "María" })}>
          Cambiar tutor
        </button>
        <button onClick={() => onChange({ adicciones: "Ninguna" })}>
          Cambiar historial familiar
        </button>
      </div>
    );
  };
});

jest.mock("../../componentes/registro/Fotografia/Fotografia", () => {
  return function MockFotografia({ datos, onChange, onGuardar, cambiosGuardados }) {
    return (
      <div data-testid="fotografia">
        <h2>Mock Fotografía</h2>
        <button onClick={() => onChange({ foto: "foto.png" })}>
          Cambiar foto
        </button>
        {onGuardar && (
          <button onClick={onGuardar}>
            Guardar cambios foto
          </button>
        )}
        {cambiosGuardados && <p>Cambios guardados</p>}
        <span>{datos.foto || "sin-foto"}</span>
      </div>
    );
  };
});

describe("RegistroPage", () => {
  const curpValida = "PEPJ100510HNLRRN09";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockLocationState = {};

    global.fetch = jest.fn();
    global.alert = jest.fn();

    Storage.prototype.getItem = jest.fn((key) => {
      if (key === "guest") return "false";
      return null;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renderiza el primer paso del registro", () => {
    render(<RegistroPage />);

    expect(screen.getByText("Datos del Paciente")).toBeInTheDocument();
    expect(screen.getByText("Paso 1 de 5")).toBeInTheDocument();
    expect(screen.getByText("20 % completado")).toBeInTheDocument();
    expect(screen.getByTestId("datos-personales")).toBeInTheDocument();
  });

  test("muestra error si intenta avanzar sin CURP", () => {
    render(<RegistroPage />);

    fireEvent.click(screen.getByTestId("icon-check").closest("button"));

    expect(
      screen.getByText("La CURP es obligatoria para continuar.")
    ).toBeInTheDocument();
  });

  test("muestra error si CURP tiene formato inválido", () => {
    render(<RegistroPage />);

    fireEvent.change(screen.getByTestId("input-curp"), {
      target: {
        value: "ABC",
      },
    });

    fireEvent.click(screen.getByTestId("icon-check").closest("button"));

    expect(
      screen.getByText(
        "La CURP ingresada no tiene un formato válido. Verifica e intenta de nuevo."
      )
    ).toBeInTheDocument();
  });

  test("avanza al paso 2 si CURP es válida", () => {
    render(<RegistroPage />);

    fireEvent.change(screen.getByTestId("input-curp"), {
      target: {
        value: curpValida,
      },
    });

    fireEvent.click(screen.getByTestId("icon-check").closest("button"));

    expect(screen.getByText("Paso 2 de 5")).toBeInTheDocument();
    expect(screen.getByTestId("contacto")).toBeInTheDocument();
  });

  test("permite regresar al paso anterior", () => {
    render(<RegistroPage />);

    fireEvent.change(screen.getByTestId("input-curp"), {
      target: {
        value: curpValida,
      },
    });

    fireEvent.click(screen.getByTestId("icon-check").closest("button"));

    expect(screen.getByText("Paso 2 de 5")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("icon-left").closest("button"));

    expect(screen.getByText("Paso 1 de 5")).toBeInTheDocument();
    expect(screen.getByTestId("datos-personales")).toBeInTheDocument();
  });

  test("navega por todos los pasos", () => {
    render(<RegistroPage />);

    fireEvent.change(screen.getByTestId("input-curp"), {
      target: {
        value: curpValida,
      },
    });

    fireEvent.click(screen.getByTestId("icon-check").closest("button"));
    expect(screen.getByTestId("contacto")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("icon-check").closest("button"));
    expect(screen.getByTestId("historial-medico")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("icon-check").closest("button"));
    expect(screen.getByTestId("historial-tutor")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Padre"));
    expect(screen.getByText("Parentesco: Padre")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("icon-check").closest("button"));
    expect(screen.getByTestId("fotografia")).toBeInTheDocument();
  });

test("guarda registro correctamente al finalizar", async () => {
  crearPacientePaso1.mockResolvedValueOnce({
    data: {
      pacienteId: 99,
    },
  });

  actualizarPaso2.mockResolvedValueOnce({});
  actualizarPaso3.mockResolvedValueOnce({});
  actualizarPaso4.mockResolvedValue({});
  actualizarPaso5.mockResolvedValueOnce({});

  render(<RegistroPage />);

  fireEvent.change(screen.getByTestId("input-curp"), {
    target: {
      value: curpValida,
    },
  });

  // Paso 1 -> Paso 2
  fireEvent.click(screen.getByTestId("icon-check").closest("button"));

  expect(screen.getByTestId("contacto")).toBeInTheDocument();

  fireEvent.click(screen.getByText("Cambiar ciudad"));

  // Paso 2 -> Paso 3
  fireEvent.click(screen.getByTestId("icon-check").closest("button"));

  expect(screen.getByTestId("historial-medico")).toBeInTheDocument();

  fireEvent.click(screen.getByText("Cambiar sangre"));

  // Paso 3 -> Paso 4
  fireEvent.click(screen.getByTestId("icon-check").closest("button"));

  expect(screen.getByTestId("historial-tutor")).toBeInTheDocument();

  fireEvent.click(screen.getByText("Cambiar tutor"));
  fireEvent.click(screen.getByText("Cambiar historial familiar"));

  // Paso 4 -> Paso 5
  fireEvent.click(screen.getByTestId("icon-check").closest("button"));

  expect(screen.getByTestId("fotografia")).toBeInTheDocument();

  fireEvent.click(screen.getByText("Cambiar foto"));

  // Guardar final
  fireEvent.click(screen.getByTestId("icon-check").closest("button"));

  await waitFor(() => {
    expect(crearPacientePaso1).toHaveBeenCalledTimes(1);
  });

  expect(crearPacientePaso1).toHaveBeenCalledWith(
    expect.objectContaining({
      curp: curpValida,
    })
  );

  await waitFor(() => {
    expect(
      screen.getByText("¡Registro guardado exitosamente!")
    ).toBeInTheDocument();
  });

  act(() => {
    jest.runOnlyPendingTimers();
  });

  expect(mockNavigate).toHaveBeenCalledWith("/usuarios");
});

  test("si es invitado redirige a registro después de guardar", async () => {
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === "guest") return "true";
      return null;
    });

    crearPacientePaso1.mockResolvedValueOnce({
      data: {
        pacienteId: 99,
      },
    });

    actualizarPaso2.mockResolvedValueOnce({});
    actualizarPaso3.mockResolvedValueOnce({});
    actualizarPaso4.mockResolvedValue({});

    render(<RegistroPage />);

    fireEvent.change(screen.getByTestId("input-curp"), {
      target: {
        value: curpValida,
      },
    });

    fireEvent.click(screen.getByTestId("icon-check").closest("button"));
    fireEvent.click(screen.getByTestId("icon-check").closest("button"));
    fireEvent.click(screen.getByTestId("icon-check").closest("button"));
    fireEvent.click(screen.getByTestId("icon-check").closest("button"));

    fireEvent.click(screen.getByTestId("icon-check").closest("button"));

    await screen.findByText("¡Registro guardado exitosamente!");

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(mockNavigate).toHaveBeenCalledWith("/registro");
  });

  test("muestra advertencias si falla un paso opcional", async () => {
    crearPacientePaso1.mockResolvedValueOnce({
      data: {
        pacienteId: 99,
      },
    });

    actualizarPaso2.mockRejectedValueOnce(new Error("Error contacto"));
    actualizarPaso3.mockResolvedValueOnce({});
    actualizarPaso4.mockResolvedValue({});

    render(<RegistroPage />);

    fireEvent.change(screen.getByTestId("input-curp"), {
      target: {
        value: curpValida,
      },
    });

    fireEvent.click(screen.getByTestId("icon-check").closest("button"));
    fireEvent.click(screen.getByTestId("icon-check").closest("button"));
    fireEvent.click(screen.getByTestId("icon-check").closest("button"));
    fireEvent.click(screen.getByTestId("icon-check").closest("button"));
    fireEvent.click(screen.getByTestId("icon-check").closest("button"));

    expect(
      await screen.findByText("¡Registro guardado exitosamente!")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Algunos datos opcionales no se guardaron:")
    ).toBeInTheDocument();

    expect(screen.getByText(/Contacto: Error contacto/i)).toBeInTheDocument();
  });

  test("muestra error si crear paciente falla por CURP duplicado", async () => {
    crearPacientePaso1.mockRejectedValueOnce({
      code: "CURP_DUPLICADO",
    });

    render(<RegistroPage />);

    fireEvent.change(screen.getByTestId("input-curp"), {
      target: {
        value: curpValida,
      },
    });

    fireEvent.click(screen.getByTestId("icon-check").closest("button"));
    fireEvent.click(screen.getByTestId("icon-check").closest("button"));
    fireEvent.click(screen.getByTestId("icon-check").closest("button"));
    fireEvent.click(screen.getByTestId("icon-check").closest("button"));
    fireEvent.click(screen.getByTestId("icon-check").closest("button"));

    expect(
      await screen.findByText("Ya existe un paciente registrado con esa CURP...")
    ).toBeInTheDocument();

    expect(screen.getByText("Paso 1 de 5")).toBeInTheDocument();
  });

  test("muestra error genérico si falla el guardado principal", async () => {
    crearPacientePaso1.mockRejectedValueOnce(new Error("Error"));

    render(<RegistroPage />);

    fireEvent.change(screen.getByTestId("input-curp"), {
      target: {
        value: curpValida,
      },
    });

    fireEvent.click(screen.getByTestId("icon-check").closest("button"));
    fireEvent.click(screen.getByTestId("icon-check").closest("button"));
    fireEvent.click(screen.getByTestId("icon-check").closest("button"));
    fireEvent.click(screen.getByTestId("icon-check").closest("button"));
    fireEvent.click(screen.getByTestId("icon-check").closest("button"));

    expect(
      await screen.findByText("Error al guardar el registro. Intenta de nuevo.")
    ).toBeInTheDocument();
  });

  test("modo revisión carga datos desde pacienteId y permite guardar cambios", async () => {
    mockLocationState = {
      modoRevision: true,
      pacienteId: 55,
    };

    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        ok: true,
        data: {
          PACIENTE_ID: 55,
          NOMBRE: "Paciente",
          APELLIDO: "Prueba",
          CURP: curpValida,
          GENERO: "masculino",
          FECHA_NACIMIENTO: "2010-05-10",
          CIUDAD_RESIDENCIA: "Monterrey",
          ESTADO_RESIDENCIA: "Nuevo León",
          FOTO: "/foto.png",
          TUTORES: [],
        },
      }),
    });

    actualizarPaciente.mockResolvedValueOnce({
      data: {
        fotoUrl: "/nueva-foto.png",
      },
    });

    render(<RegistroPage />);

    expect(await screen.findByDisplayValue(curpValida)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("icon-right").closest("button"));
    fireEvent.click(screen.getByTestId("icon-right").closest("button"));
    fireEvent.click(screen.getByTestId("icon-right").closest("button"));
    fireEvent.click(screen.getByTestId("icon-right").closest("button"));

    expect(screen.getByTestId("fotografia")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Guardar cambios foto"));

    await waitFor(() => {
      expect(actualizarPaciente).toHaveBeenCalledWith(
        55,
        expect.any(Object),
        expect.any(Array)
      );
    });

    expect(await screen.findByText("Cambios guardados")).toBeInTheDocument();
  });

  test("modo revisión carga notificación y permite aprobar", async () => {
    mockLocationState = {
      modoRevision: true,
      notificacionId: 77,
    };

    global.fetch
      .mockResolvedValueOnce({
        json: async () => ({
          ok: true,
          data: {
            ESTADO_PROCESO: "pendiente",
            PACIENTE_ID: 10,
            NOMBRE: "Paciente",
            APELLIDO: "Pendiente",
            CURP: curpValida,
            TUTORES: [],
          },
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          ok: true,
        }),
      });

    render(<RegistroPage />);

    expect(await screen.findByDisplayValue(curpValida)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("icon-right").closest("button"));
    fireEvent.click(screen.getByTestId("icon-right").closest("button"));
    fireEvent.click(screen.getByTestId("icon-right").closest("button"));
    fireEvent.click(screen.getByTestId("icon-right").closest("button"));

    fireEvent.click(
      screen.getByRole("button", { name: /Aprobar/i })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/notificaciones/77/aprobar",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
    });

    expect(
      await screen.findByText("¡Paciente aprobado exitosamente!")
    ).toBeInTheDocument();

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(mockNavigate).toHaveBeenCalledWith("/notificaciones");
  });

  test("modo revisión permite rechazar notificación pendiente", async () => {
    mockLocationState = {
      modoRevision: true,
      notificacionId: 77,
    };

    global.fetch
      .mockResolvedValueOnce({
        json: async () => ({
          ok: true,
          data: {
            ESTADO_PROCESO: "pendiente",
            PACIENTE_ID: 10,
            NOMBRE: "Paciente",
            APELLIDO: "Pendiente",
            CURP: curpValida,
            TUTORES: [],
          },
        }),
      })
      .mockResolvedValueOnce({
        json: async () => ({
          ok: true,
        }),
      });

    render(<RegistroPage />);

    expect(await screen.findByDisplayValue(curpValida)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("icon-right").closest("button"));
    fireEvent.click(screen.getByTestId("icon-right").closest("button"));
    fireEvent.click(screen.getByTestId("icon-right").closest("button"));
    fireEvent.click(screen.getByTestId("icon-right").closest("button"));

    fireEvent.click(
      screen.getByRole("button", { name: /Rechazar/i })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/notificaciones/77/rechazar",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
    });

    expect(
      await screen.findByText("Registro rechazado correctamente")
    ).toBeInTheDocument();

    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(mockNavigate).toHaveBeenCalledWith("/notificaciones");
  });
});