import {
  crearPacientePaso1,
  actualizarPaso2,
  actualizarPaso3,
  actualizarPaso4,
  actualizarPaso5,
} from "../../services/registroService";

globalThis.fetch = jest.fn();

describe("registroService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test("crearPacientePaso1 debe crear paciente correctamente con usuario normal", async () => {
    localStorage.setItem(
      "usuario",
      JSON.stringify({
        id: 10,
      })
    );

    localStorage.setItem("guest", "false");

    const formData = {
      nombres: "Juan",
      apellidoPaterno: "Pérez",
      genero: "Masculino",
      fechaNacimiento: "2000-01-01",
      curp: "PEPJ000101HNLXXX01",
    };

    const mockResponse = {
      ok: true,
      data: {
        pacienteId: 1,
      },
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const result = await crearPacientePaso1(formData);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/registro",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: "Juan",
          apellido: "Pérez",
          genero: "Masculino",
          fechaNacimiento: "2000-01-01",
          curp: "PEPJ000101HNLXXX01",
          usuarioId: 10,
        }),
      }
    );

    expect(result).toEqual(mockResponse);
  });

  test("crearPacientePaso1 debe mandar usuarioId null si es invitado", async () => {
    localStorage.setItem("guest", "true");
    localStorage.setItem(
      "usuario",
      JSON.stringify({
        id: 10,
      })
    );

    const formData = {
      nombres: "Ana",
      apellidoPaterno: "López",
      genero: "Femenino",
      fechaNacimiento: "2001-02-02",
      curp: "LOAA010202MNLXXX01",
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        ok: true,
      }),
    });

    await crearPacientePaso1(formData);

    const body = JSON.parse(fetch.mock.calls[0][1].body);

    expect(body.usuarioId).toBeNull();
  });

  test("crearPacientePaso1 debe lanzar error CURP_DUPLICADO si status es 409", async () => {
    const formData = {
      nombres: "Juan",
      apellidoPaterno: "Pérez",
      genero: "Masculino",
      fechaNacimiento: "2000-01-01",
      curp: "PEPJ000101HNLXXX01",
    };

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({
        message: "Ya existe un paciente registrado con ese CURP.",
      }),
    });

    try {
      await crearPacientePaso1(formData);
    } catch (error) {
      expect(error.message).toBe(
        "Ya existe un paciente registrado con ese CURP."
      );
      expect(error.code).toBe("CURP_DUPLICADO");
    }
  });

  test("crearPacientePaso1 debe lanzar error si response.ok es false", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        message: "Error al registrar",
      }),
    });

    await expect(
      crearPacientePaso1({
        nombres: "Juan",
        apellidoPaterno: "Pérez",
        genero: "Masculino",
        fechaNacimiento: "2000-01-01",
        curp: "CURP123",
      })
    ).rejects.toThrow("Error al registrar");
  });

  test("actualizarPaso2 debe guardar contacto correctamente", async () => {
    localStorage.setItem(
      "usuario",
      JSON.stringify({
        id: 20,
      })
    );

    localStorage.setItem("guest", "false");

    const formData = {
      direccion: "Calle 123",
      ciudad: "Monterrey",
      estado: "Nuevo León",
      codigoPostal: "64000",
      emergenciaContacto: "Mamá",
      emergenciaTelefono: "8111111111",
      telefonoCasa: "8122222222",
      telefonoCelular: "8133333333",
      correo: "juan@test.com",
      nombres: "Juan",
      apellidoPaterno: "Pérez",
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
        data: {
          pacienteId: 1,
        },
      }),
    });

    const result = await actualizarPaso2(1, formData);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/registro/1/paso2",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          direccion: "Calle 123",
          ciudad: "Monterrey",
          estado: "Nuevo León",
          codigoPostal: "64000",
          emergenciaContacto: "Mamá",
          emergenciaTelefono: "8111111111",
          telefonoCasa: "8122222222",
          telefonoCelular: "8133333333",
          correo: "juan@test.com",
          usuarioId: 20,
          nombre: "Juan",
          apellido: "Pérez",
        }),
      }
    );

    expect(result.ok).toBe(true);
  });

  test("actualizarPaso2 debe lanzar error si falla", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: "Error contacto",
      }),
    });

    await expect(actualizarPaso2(1, {})).rejects.toThrow("Error contacto");
  });

  test("actualizarPaso3 debe guardar historial médico correctamente", async () => {
    const formData = {
      lugarNacimiento: "Monterrey",
      hospitalNacimiento: "Hospital A",
      tipoSangre: "O+",
      usaValvula: "SI",
      notas: "Sin notas",
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
      }),
    });

    const result = await actualizarPaso3(1, formData);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/registro/1/paso3",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lugarNacimiento: "Monterrey",
          hospitalNacimiento: "Hospital A",
          tipoSangre: "O+",
          usaValvula: "SI",
          notas: "Sin notas",
        }),
      }
    );

    expect(result.ok).toBe(true);
  });

  test("actualizarPaso3 debe lanzar error si falla", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: "Error historial médico",
      }),
    });

    await expect(actualizarPaso3(1, {})).rejects.toThrow(
      "Error historial médico"
    );
  });

  test("actualizarPaso4 debe guardar historial del tutor correctamente", async () => {
    const formData = {
      tutorLugarNacimiento: "Monterrey",
      tutorEdad: 40,
      tutorOcupacion: "Maestro",
      tutorEscolaridad: "Universidad",
      tutorParentesco: "Padre",
      madreSeguroMedico: "Sí",
      cdEmbarazo: "No",
      acidoFolico: "Sí",
      citasControl: "Sí",
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
      }),
    });

    const result = await actualizarPaso4(1, formData);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/registro/1/paso4",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tutorLugarNacimiento: "Monterrey",
          tutorEdad: 40,
          tutorOcupacion: "Maestro",
          tutorEscolaridad: "Universidad",
          tutorParentesco: "Padre",
          madreSeguroMedico: "Sí",
          cdEmbarazo: "No",
          acidoFolico: "Sí",
          citasControl: "Sí",
        }),
      }
    );

    expect(result.ok).toBe(true);
  });

  test("actualizarPaso4 debe lanzar error si falla", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: "Error historial tutor",
      }),
    });

    await expect(actualizarPaso4(1, {})).rejects.toThrow(
      "Error historial tutor"
    );
  });

  test("actualizarPaso5 debe guardar fotografía correctamente", async () => {
    localStorage.setItem(
      "usuario",
      JSON.stringify({
        id: 30,
      })
    );

    localStorage.setItem("guest", "false");

    const foto = new File(["foto"], "foto.png", {
      type: "image/png",
    });

    const formData = {
      nombres: "Juan",
      apellidoPaterno: "Pérez",
      correo: "juan@test.com",
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
      }),
    });

    const result = await actualizarPaso5(1, foto, formData);

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:3001/api/registro/1/paso5",
      expect.objectContaining({
        method: "PUT",
        body: expect.any(FormData),
      })
    );

    const body = fetch.mock.calls[0][1].body;

    expect(body.get("foto")).toBe(foto);
    expect(body.get("usuarioId")).toBe("30");
    expect(body.get("nombre")).toBe("Juan");
    expect(body.get("apellido")).toBe("Pérez");
    expect(body.get("correo")).toBe("juan@test.com");

    expect(result.ok).toBe(true);
  });

  test("actualizarPaso5 debe mandar usuarioId vacío si es invitado", async () => {
    localStorage.setItem("guest", "true");

    const foto = new File(["foto"], "foto.png", {
      type: "image/png",
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ok: true,
      }),
    });

    await actualizarPaso5(1, foto, {});

    const body = fetch.mock.calls[0][1].body;

    expect(body.get("usuarioId")).toBe("");
  });

  test("actualizarPaso5 debe lanzar error si falla", async () => {
    const foto = new File(["foto"], "foto.png", {
      type: "image/png",
    });

    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        message: "Error fotografía",
      }),
    });

    await expect(actualizarPaso5(1, foto, {})).rejects.toThrow(
      "Error fotografía"
    );
  });
});