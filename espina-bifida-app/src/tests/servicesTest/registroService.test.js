import {
  crearPacientePaso1,
  actualizarPaso2,
  actualizarPaso3,
  actualizarPaso4,
  actualizarPaso5,
  actualizarPaciente,
} from "../../services/registroService";

describe("registroService.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
  });

  function mockJsonResponse({ ok = true, status = 200, data = { ok: true } } = {}) {
    global.fetch.mockResolvedValueOnce({
      ok,
      status,
      json: jest.fn().mockResolvedValueOnce(data),
    });
  }

  describe("crearPacientePaso1", () => {
    test("debe crear paciente paso 1 con usuario logueado", async () => {
      localStorage.setItem("usuario", JSON.stringify({ id: 7 }));
      localStorage.setItem("guest", "false");

      mockJsonResponse({
        data: {
          ok: true,
          data: { pacienteId: 10 },
        },
      });

      const result = await crearPacientePaso1({
        nombres: "Juan",
        apellidoPaterno: "Pérez",
        genero: "M",
        fechaNacimiento: "2010-01-01",
        curp: "CURP123",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/registro",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: "Juan",
            apellido: "Pérez",
            genero: "M",
            fechaNacimiento: "2010-01-01",
            curp: "CURP123",
            usuarioId: 7,
          }),
        }
      );

      expect(result).toEqual({
        ok: true,
        data: { pacienteId: 10 },
      });
    });

    test("debe crear paciente paso 1 como invitado con usuarioId null", async () => {
      localStorage.setItem("usuario", JSON.stringify({ id: 7 }));
      localStorage.setItem("guest", "true");

      mockJsonResponse({
        data: {
          ok: true,
          data: { pacienteId: 20 },
        },
      });

      await crearPacientePaso1({
        nombres: "Ana",
        apellidoPaterno: "López",
        genero: "F",
        fechaNacimiento: "2012-02-02",
        curp: "CURP456",
      });

      const body = JSON.parse(global.fetch.mock.calls[0][1].body);

      expect(body.usuarioId).toBeNull();
      expect(body.nombre).toBe("Ana");
      expect(body.apellido).toBe("López");
    });

    test("debe convertir campos vacíos a null en paso 1", async () => {
      mockJsonResponse();

      await crearPacientePaso1({
        nombres: "",
        apellidoPaterno: "",
        genero: "",
        fechaNacimiento: "",
        curp: "CURP123",
      });

      const body = JSON.parse(global.fetch.mock.calls[0][1].body);

      expect(body).toEqual({
        nombre: null,
        apellido: null,
        genero: null,
        fechaNacimiento: null,
        curp: "CURP123",
        usuarioId: undefined,
      });
    });

    test("debe lanzar error CURP_DUPLICADO si status es 409", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: jest.fn().mockResolvedValueOnce({
          message: "Ya existe un paciente registrado con ese CURP.",
        }),
      });

      await expect(
        crearPacientePaso1({
          nombres: "Juan",
          apellidoPaterno: "Pérez",
          genero: "M",
          fechaNacimiento: "2010-01-01",
          curp: "CURP123",
        })
      ).rejects.toMatchObject({
        code: "CURP_DUPLICADO",
        message: "Ya existe un paciente registrado con ese CURP.",
      });
    });

    test("debe lanzar error si falla crear paciente", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: jest.fn().mockResolvedValueOnce({
          message: "Error custom",
        }),
      });

      await expect(
        crearPacientePaso1({
          nombres: "Juan",
          apellidoPaterno: "Pérez",
          genero: "M",
          fechaNacimiento: "2010-01-01",
          curp: "CURP123",
        })
      ).rejects.toThrow("Error custom");
    });
  });

  describe("actualizarPaso2", () => {
    test("debe actualizar contacto correctamente", async () => {
      localStorage.setItem("usuario", JSON.stringify({ id: 7 }));
      localStorage.setItem("guest", "false");

      mockJsonResponse({
        data: { ok: true },
      });

      const result = await actualizarPaso2(10, {
        direccion: "Calle 1",
        ciudad: "Monterrey",
        estado: "Nuevo León",
        codigoPostal: "64000",
        emergenciaContacto: "Mamá",
        emergenciaTelefono: "8111111111",
        telefonoCasa: "",
        telefonoCelular: "8122222222",
        correo: "test@mail.com",
        nombres: "Juan",
        apellidoPaterno: "Pérez",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/registro/10/paso2",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            direccion: "Calle 1",
            ciudad: "Monterrey",
            estado: "Nuevo León",
            codigoPostal: "64000",
            emergenciaContacto: "Mamá",
            emergenciaTelefono: "8111111111",
            telefonoCasa: null,
            telefonoCelular: "8122222222",
            correo: "test@mail.com",
            usuarioId: 7,
            nombre: "Juan",
            apellido: "Pérez",
          }),
        }
      );

      expect(result).toEqual({ ok: true });
    });

    test("debe mandar usuarioId null si es invitado", async () => {
      localStorage.setItem("usuario", JSON.stringify({ id: 7 }));
      localStorage.setItem("guest", "true");

      mockJsonResponse();

      await actualizarPaso2(10, {
        direccion: "Calle 1",
        ciudad: "Monterrey",
        estado: "Nuevo León",
        codigoPostal: "64000",
        emergenciaContacto: "Mamá",
        emergenciaTelefono: "8111111111",
      });

      const body = JSON.parse(global.fetch.mock.calls[0][1].body);

      expect(body.usuarioId).toBeNull();
    });

    test("debe lanzar error si falla paso 2", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({
          message: "Error contacto",
        }),
      });

      await expect(actualizarPaso2(10, {})).rejects.toThrow("Error contacto");
    });
  });

  describe("actualizarPaso3", () => {
    test("debe actualizar historial médico correctamente", async () => {
      mockJsonResponse({
        data: { ok: true },
      });

      const result = await actualizarPaso3(10, {
        lugarNacimiento: "Monterrey",
        hospitalNacimiento: "Hospital A",
        tipoSangre: "O+",
        usaValvula: "Sí",
        notas: "",
        tipoEspinaBifida: "Mielomeningocele",
        otrosPadecimiento: "",
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/registro/10/paso3",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lugarNacimiento: "Monterrey",
            hospitalNacimiento: "Hospital A",
            tipoSangre: "O+",
            usaValvula: "Sí",
            notas: null,
            tipoEspinaBifida: "Mielomeningocele",
            otrosPadecimiento: null,
          }),
        }
      );

      expect(result).toEqual({ ok: true });
    });

    test("debe lanzar error si falla paso 3", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({
          message: "Error historial médico",
        }),
      });

      await expect(actualizarPaso3(10, {})).rejects.toThrow(
        "Error historial médico"
      );
    });
  });

  describe("actualizarPaso4", () => {
    test("debe actualizar historial tutor correctamente", async () => {
      mockJsonResponse({
        data: { ok: true },
      });

      const formData = {
        tutorParentesco: "Madre",
        tutorNombre: "María",
        tutorLugarNacimiento: "Monterrey",
        tutorEdad: "35",
        tutorOcupacion: "Maestra",
        tutorEscolaridad: "Licenciatura",
        tutorSeguroMedico: "",
        madreSeguroMedico: "IMSS",
        cdEmbarazo: "No",
        acidoFolico: "Sí",
        citasControl: "5",
        adicciones: "No",
        hijoDtn: "No",
        familiarDtn: "No",
        expoToxicos: "No",
        descripcionExpoToxicos: "",
      };

      const result = await actualizarPaso4(10, formData);

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/registro/10/paso4",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tutorParentesco: "Madre",
            tutorNombre: "María",
            tutorLugarNacimiento: "Monterrey",
            tutorEdad: "35",
            tutorOcupacion: "Maestra",
            tutorEscolaridad: "Licenciatura",
            tutorSeguroMedico: null,
            madreSeguroMedico: "IMSS",
            cdEmbarazo: "No",
            acidoFolico: "Sí",
            citasControl: "5",
            adicciones: "No",
            hijoDtn: "No",
            familiarDtn: "No",
            expoToxicos: "No",
            descripcionExpoToxicos: null,
          }),
        }
      );

      expect(result).toEqual({ ok: true });
    });

    test("debe lanzar error si falla paso 4", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({
          message: "Error tutor",
        }),
      });

      await expect(actualizarPaso4(10, {})).rejects.toThrow("Error tutor");
    });
  });

  describe("actualizarPaso5", () => {
    test("debe subir foto y documentos correctamente", async () => {
      localStorage.setItem("usuario", JSON.stringify({ id: 7 }));
      localStorage.setItem("guest", "false");

      mockJsonResponse({
        data: { ok: true },
      });

      const foto = new File(["foto"], "foto.jpg", { type: "image/jpeg" });
      const preregistro = new File(["pre"], "pre.pdf", { type: "application/pdf" });
      const actaNacimiento = new File(["acta"], "acta.pdf", { type: "application/pdf" });
      const curp = new File(["curp"], "curp.pdf", { type: "application/pdf" });
      const comprobanteDomicilio = new File(["comp"], "comp.pdf", {
        type: "application/pdf",
      });
      const ineFamilia = new File(["ine"], "ine.pdf", { type: "application/pdf" });

      const result = await actualizarPaso5(10, foto, {
        nombres: "Juan",
        apellidoPaterno: "Pérez",
        correo: "juan@test.com",
        documentos: {
          preregistro,
          actaNacimiento,
          curp,
          comprobanteDomicilio,
          ineFamilia,
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/registro/10/paso5",
        {
          method: "PUT",
          body: expect.any(FormData),
        }
      );

      const body = global.fetch.mock.calls[0][1].body;

      expect(body.get("foto")).toBe(foto);
      expect(body.get("usuarioId")).toBe("7");
      expect(body.get("nombre")).toBe("Juan");
      expect(body.get("apellido")).toBe("Pérez");
      expect(body.get("correo")).toBe("juan@test.com");

      expect(body.get("docPreregistro")).toBe(preregistro);
      expect(body.get("docActaNacimiento")).toBe(actaNacimiento);
      expect(body.get("docCurp")).toBe(curp);
      expect(body.get("docComprobanteDomicilio")).toBe(comprobanteDomicilio);
      expect(body.get("docIneFamilia")).toBe(ineFamilia);

      expect(result).toEqual({ ok: true });
    });

    test("debe mandar usuarioId vacío si es invitado", async () => {
      localStorage.setItem("usuario", JSON.stringify({ id: 7 }));
      localStorage.setItem("guest", "true");

      mockJsonResponse();

      await actualizarPaso5(10, null, {
        nombres: "Ana",
        apellidoPaterno: "López",
        correo: "ana@test.com",
      });

      const body = global.fetch.mock.calls[0][1].body;

      expect(body.get("usuarioId")).toBe("");
      expect(body.get("nombre")).toBe("Ana");
      expect(body.get("apellido")).toBe("López");
      expect(body.get("correo")).toBe("ana@test.com");
      expect(body.get("foto")).toBeNull();
    });

    test("debe lanzar error si falla paso 5", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({
          message: "Error foto",
        }),
      });

      await expect(actualizarPaso5(10, null, {})).rejects.toThrow("Error foto");
    });
  });

  describe("actualizarPaciente", () => {
    test("debe actualizar paciente completo correctamente", async () => {
      mockJsonResponse({
        data: { ok: true },
      });

      const foto = new File(["foto"], "foto.jpg", { type: "image/jpeg" });
      const tutores = [
        {
          tutorParentesco: "Madre",
          tutorNombre: "María",
        },
      ];

      const formData = {
        nombres: "Juan",
        apellidoPaterno: "Pérez",
        genero: "M",
        fechaNacimiento: "2010-01-01",
        curp: "CURP123",
        direccion: "Calle 1",
        ciudad: "Monterrey",
        estado: "Nuevo León",
        codigoPostal: "64000",
        telefonoCasa: "111",
        telefonoCelular: "222",
        correo: "juan@test.com",
        emergenciaContacto: "Mamá",
        emergenciaTelefono: "333",
        lugarNacimiento: "Monterrey",
        hospitalNacimiento: "Hospital A",
        tipoSangre: "O+",
        usaValvula: "Sí",
        notas: "Notas",
        tipoEspinaBifida: "Mielomeningocele",
        otrosPadecimiento: "",
        foto,
      };

      const result = await actualizarPaciente(10, formData, tutores);

      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:3001/api/pacientes/10",
        {
          method: "PUT",
          body: expect.any(FormData),
        }
      );

      const body = global.fetch.mock.calls[0][1].body;

      expect(body.get("nombre")).toBe("Juan");
      expect(body.get("apellido")).toBe("Pérez");
      expect(body.get("genero")).toBe("M");
      expect(body.get("fechaNacimiento")).toBe("2010-01-01");
      expect(body.get("curp")).toBe("CURP123");
      expect(body.get("direccion")).toBe("Calle 1");
      expect(body.get("ciudad")).toBe("Monterrey");
      expect(body.get("estado")).toBe("Nuevo León");
      expect(body.get("codigoPostal")).toBe("64000");
      expect(body.get("telefonoCasa")).toBe("111");
      expect(body.get("telefonoCelular")).toBe("222");
      expect(body.get("correo")).toBe("juan@test.com");
      expect(body.get("emergenciaContacto")).toBe("Mamá");
      expect(body.get("emergenciaTelefono")).toBe("333");
      expect(body.get("lugarNacimiento")).toBe("Monterrey");
      expect(body.get("hospitalNacimiento")).toBe("Hospital A");
      expect(body.get("tipoSangre")).toBe("O+");
      expect(body.get("usaValvula")).toBe("Sí");
      expect(body.get("notas")).toBe("Notas");
      expect(body.get("tipoEspinaBifida")).toBe("Mielomeningocele");
      expect(body.get("otrosPadecimiento")).toBe("");
      expect(body.get("tutores")).toBe(JSON.stringify(tutores));
      expect(body.get("foto")).toBe(foto);

      expect(result).toEqual({ ok: true });
    });

    test("debe mandar strings vacíos si faltan campos al actualizar paciente", async () => {
      mockJsonResponse();

      await actualizarPaciente(10, {}, []);

      const body = global.fetch.mock.calls[0][1].body;

      expect(body.get("nombre")).toBe("");
      expect(body.get("apellido")).toBe("");
      expect(body.get("genero")).toBe("");
      expect(body.get("fechaNacimiento")).toBe("");
      expect(body.get("curp")).toBe("");
      expect(body.get("tutores")).toBe("[]");
      expect(body.get("foto")).toBeNull();
    });

    test("debe lanzar error si falla actualizar paciente", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: jest.fn().mockResolvedValueOnce({
          message: "Error cambios",
        }),
      });

      await expect(actualizarPaciente(10, {}, [])).rejects.toThrow(
        "Error cambios"
      );
    });
  });
});