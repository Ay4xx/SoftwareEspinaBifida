import { describe, test, expect } from "@jest/globals";
import { mapPacienteLogin } from "../../modulos/login/login.mapper.js";

describe("login.mapper.js", () => {
  test("debe mapear correctamente un usuario con foto", () => {
    const row = {
      USUARIO_ID: 1,
      USERNAME: "paciente1",
      TIPO_USUARIO: "paciente",
      NOMBRE: "Juan Pérez",
      FOTO: "data:image/jpeg;base64,abc123",
    };

    const result = mapPacienteLogin(row);

    expect(result).toEqual({
      id: 1,
      username: "paciente1",
      tipoUsuario: "paciente",
      nombre: "Juan Pérez",
      foto: "data:image/jpeg;base64,abc123",
    });
  });

  test("debe regresar nombre y foto como null si no existen", () => {
    const row = {
      USUARIO_ID: 2,
      USERNAME: "admin",
      TIPO_USUARIO: "admin",
      NOMBRE: null,
      FOTO: null,
    };

    const result = mapPacienteLogin(row);

    expect(result).toEqual({
      id: 2,
      username: "admin",
      tipoUsuario: "admin",
      nombre: null,
      foto: null,
    });
  });

  test("debe convertir nombre y foto falsy a null", () => {
    const row = {
      USUARIO_ID: 3,
      USERNAME: "usuario",
      TIPO_USUARIO: "paciente",
      NOMBRE: "",
      FOTO: "",
    };

    const result = mapPacienteLogin(row);

    expect(result.nombre).toBeNull();
    expect(result.foto).toBeNull();
  });
});