import { describe, test, expect } from "@jest/globals";
import { mapUsuario } from "../../modulos/gestionUsuarios/gestionUsuarios.mapper.js";

describe("gestionUsuarios.mapper.js", () => {
  test("debe mapear usuario correctamente con foto", () => {
    const row = {
      USUARIO_ID: 1,
      NOMBRE: "Juan Pérez",
      USERNAME: "juan@test.com",
      TIPO_USUARIO: "ADMINISTRADOR",
      FECHA_REGISTRO: "2026-05-29",
      FOTO: "data:image/jpeg;base64,abc123",
    };

    const result = mapUsuario(row);

    expect(result).toEqual({
      id: 1,
      nombre: "Juan Pérez",
      username: "juan@test.com",
      tipoUsuario: "ADMINISTRADOR",
      fechaRegistro: "2026-05-29",
      foto: "data:image/jpeg;base64,abc123",
    });
  });

  test("debe regresar foto null si no existe", () => {
    const row = {
      USUARIO_ID: 2,
      NOMBRE: "Ana López",
      USERNAME: "ana@test.com",
      TIPO_USUARIO: "COORDINADOR",
      FECHA_REGISTRO: "2026-05-29",
      FOTO: null,
    };

    const result = mapUsuario(row);

    expect(result).toEqual({
      id: 2,
      nombre: "Ana López",
      username: "ana@test.com",
      tipoUsuario: "COORDINADOR",
      fechaRegistro: "2026-05-29",
      foto: null,
    });
  });

  test("debe convertir foto falsy a null", () => {
    const row = {
      USUARIO_ID: 3,
      NOMBRE: "Usuario Test",
      USERNAME: "test@test.com",
      TIPO_USUARIO: "ADMINISTRADOR",
      FECHA_REGISTRO: "2026-05-29",
      FOTO: "",
    };

    const result = mapUsuario(row);

    expect(result.foto).toBeNull();
  });
});