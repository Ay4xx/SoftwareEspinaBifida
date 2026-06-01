import { jest, describe, beforeEach, afterEach, test, expect } from "@jest/globals";

const mockExecute = jest.fn();
const mockClose = jest.fn();
const mockGetConnection = jest.fn();

const mockHash = jest.fn();
const mockMapUsuario = jest.fn();

jest.unstable_mockModule("../../config/db.js", () => ({
  getConnection: mockGetConnection,
}));

jest.unstable_mockModule("oracledb", () => ({
  default: {
    OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
    BUFFER: "BUFFER",
    BLOB: "BLOB",
    BIND_OUT: "BIND_OUT",
    NUMBER: "NUMBER",
  },
  OUT_FORMAT_OBJECT: "OUT_FORMAT_OBJECT",
  BUFFER: "BUFFER",
  BLOB: "BLOB",
  BIND_OUT: "BIND_OUT",
  NUMBER: "NUMBER",
}));

jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: mockHash,
  },
  hash: mockHash,
}));

jest.unstable_mockModule("../../modulos/gestionUsuarios/gestionUsuarios.mapper.js", () => ({
  mapUsuario: mockMapUsuario,
}));

const {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} = await import("../../modulos/gestionUsuarios/gestionUsuarios.service.js");

function crearMockConnection() {
  return {
    execute: mockExecute,
    close: mockClose,
  };
}

describe("gestionUsuarios.service.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConnection.mockResolvedValue(crearMockConnection());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("listarUsuarios", () => {
    test("debe listar usuarios y convertir foto a base64", async () => {
      const fotoBuffer = Buffer.from("foto-test");

      mockExecute
        .mockResolvedValueOnce({
          rows: [
            {
              USUARIO_ID: 1,
              NOMBRE: "Juan Pérez",
              USERNAME: "juan@test.com",
              TIPO_USUARIO: "ADMINISTRADOR",
              FECHA_REGISTRO: "2026-05-29",
              FOTO: fotoBuffer,
            },
          ],
        })
        .mockResolvedValueOnce({
          rows: [{ TOTAL: 1 }],
        });

      mockMapUsuario.mockImplementation((row) => ({
        id: row.USUARIO_ID,
        nombre: row.NOMBRE,
        username: row.USERNAME,
        tipoUsuario: row.TIPO_USUARIO,
        fechaRegistro: row.FECHA_REGISTRO,
        foto: row.FOTO || null,
      }));

      const result = await listarUsuarios({
        busqueda: "juan",
        pagina: 2,
        limite: 10,
      });

      expect(mockExecute).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("OFFSET :saltar ROWS FETCH NEXT :maxRows ROWS ONLY"),
        ["%JUAN%", "%JUAN%", 10, 10],
        {
          outFormat: "OUT_FORMAT_OBJECT",
          fetchInfo: {
            FOTO: {
              type: "BUFFER",
            },
          },
        }
      );

      expect(mockExecute).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("SELECT COUNT(*) AS TOTAL FROM USUARIO"),
        ["%JUAN%", "%JUAN%"],
        { outFormat: "OUT_FORMAT_OBJECT" }
      );

      expect(result).toEqual({
        usuarios: [
          {
            id: 1,
            nombre: "Juan Pérez",
            username: "juan@test.com",
            tipoUsuario: "ADMINISTRADOR",
            fechaRegistro: "2026-05-29",
            foto: `data:image/jpeg;base64,${fotoBuffer.toString("base64")}`,
          },
        ],
        total: 1,
        pagina: 2,
        limite: 10,
      });

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe listar usuarios sin búsqueda", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [],
        })
        .mockResolvedValueOnce({
          rows: [{ TOTAL: 0 }],
        });

      const result = await listarUsuarios({});

      expect(mockExecute).toHaveBeenNthCalledWith(
        1,
        expect.any(String),
        ["%%", "%%", 0, 20],
        expect.any(Object)
      );

      expect(result).toEqual({
        usuarios: [],
        total: 0,
        pagina: 1,
        limite: 20,
      });

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe cerrar conexión y lanzar error si falla", async () => {
      mockExecute.mockRejectedValue(new Error("Error Oracle"));

      await expect(
        listarUsuarios({ busqueda: "x", pagina: 1, limite: 20 })
      ).rejects.toThrow("Error Oracle");

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("obtenerUsuario", () => {
    test("debe obtener usuario por id con foto", async () => {
      const fotoBuffer = Buffer.from("foto-test");

      mockExecute.mockResolvedValue({
        rows: [
          {
            USUARIO_ID: 1,
            NOMBRE: "Juan Pérez",
            USERNAME: "juan@test.com",
            TIPO_USUARIO: "ADMINISTRADOR",
            FECHA_REGISTRO: "2026-05-29",
            FOTO: fotoBuffer,
          },
        ],
      });

      mockMapUsuario.mockImplementation((row) => ({
        id: row.USUARIO_ID,
        nombre: row.NOMBRE,
        username: row.USERNAME,
        tipoUsuario: row.TIPO_USUARIO,
        fechaRegistro: row.FECHA_REGISTRO,
        foto: row.FOTO,
      }));

      const result = await obtenerUsuario(1);

      expect(mockExecute).toHaveBeenCalledWith(
        expect.stringContaining("WHERE USUARIO_ID = :id"),
        [1],
        {
          outFormat: "OUT_FORMAT_OBJECT",
          fetchInfo: {
            FOTO: {
              type: "BUFFER",
            },
          },
        }
      );

      expect(result).toEqual({
        id: 1,
        nombre: "Juan Pérez",
        username: "juan@test.com",
        tipoUsuario: "ADMINISTRADOR",
        fechaRegistro: "2026-05-29",
        foto: `data:image/jpeg;base64,${fotoBuffer.toString("base64")}`,
      });

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe regresar null si usuario no existe", async () => {
      mockExecute.mockResolvedValue({
        rows: [],
      });

      const result = await obtenerUsuario(99);

      expect(result).toBeNull();
      expect(mockMapUsuario).not.toHaveBeenCalled();
      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("crearUsuario", () => {
    test("debe crear usuario correctamente con foto", async () => {
      const foto = Buffer.from("foto-test");

      mockExecute
        .mockResolvedValueOnce({
          rows: [],
        })
        .mockResolvedValueOnce({
          outBinds: {
            id: [10],
          },
        })
        .mockResolvedValueOnce({
          rows: [
            {
              USUARIO_ID: 10,
              NOMBRE: "Juan Pérez",
              USERNAME: "juan@test.com",
              TIPO_USUARIO: "ADMINISTRADOR",
              FECHA_REGISTRO: "2026-05-29",
              FOTO: null,
            },
          ],
        });

      mockHash.mockResolvedValue("hashed-password");

      mockMapUsuario.mockReturnValue({
        id: 10,
        nombre: "Juan Pérez",
        username: "juan@test.com",
        tipoUsuario: "ADMINISTRADOR",
        fechaRegistro: "2026-05-29",
        foto: null,
      });

      const result = await crearUsuario({
        nombre: " Juan Pérez ",
        username: " juan@test.com ",
        password: "12345678",
        confirmarPassword: "12345678",
        tipoUsuario: "administrador",
        foto,
      });

      expect(mockExecute).toHaveBeenNthCalledWith(
        1,
        "SELECT 1 FROM USUARIO WHERE LOWER(USERNAME) = LOWER(:username)",
        { username: "juan@test.com" },
        { outFormat: "OUT_FORMAT_OBJECT" }
      );

      expect(mockHash).toHaveBeenCalledWith("12345678", 10);

      expect(mockExecute).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("INSERT INTO USUARIO"),
        {
          nombre: "Juan Pérez",
          username: "juan@test.com",
          passwordHash: "hashed-password",
          tipoUsuario: "ADMINISTRADOR",
          foto: {
            val: foto,
            type: "BLOB",
          },
          id: {
            dir: "BIND_OUT",
            type: "NUMBER",
          },
        },
        { autoCommit: true }
      );

      expect(result).toEqual({
        id: 10,
        nombre: "Juan Pérez",
        username: "juan@test.com",
        tipoUsuario: "ADMINISTRADOR",
        fechaRegistro: "2026-05-29",
        foto: null,
      });

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe crear usuario sin foto", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [],
        })
        .mockResolvedValueOnce({
          outBinds: {
            id: [11],
          },
        })
        .mockResolvedValueOnce({
          rows: [
            {
              USUARIO_ID: 11,
              NOMBRE: "Ana López",
              USERNAME: "ana@test.com",
              TIPO_USUARIO: "COORDINADOR",
              FECHA_REGISTRO: "2026-05-29",
            },
          ],
        });

      mockHash.mockResolvedValue("hashed-password");

      mockMapUsuario.mockReturnValue({
        id: 11,
        nombre: "Ana López",
        username: "ana@test.com",
        tipoUsuario: "COORDINADOR",
        fechaRegistro: "2026-05-29",
        foto: null,
      });

      const result = await crearUsuario({
        nombre: "Ana López",
        username: "ana@test.com",
        password: "12345678",
        confirmarPassword: "12345678",
        tipoUsuario: "COORDINADOR",
      });

      expect(mockExecute).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("INSERT INTO USUARIO"),
        expect.objectContaining({
          foto: {
            val: null,
            type: "BLOB",
          },
        }),
        { autoCommit: true }
      );

      expect(result.id).toBe(11);
      expect(mockClose).toHaveBeenCalled();
    });

    test("debe fallar si nombre está vacío", async () => {
      await expect(
        crearUsuario({
          nombre: " ",
          username: "test@test.com",
          password: "12345678",
          confirmarPassword: "12345678",
          tipoUsuario: "ADMINISTRADOR",
        })
      ).rejects.toEqual({
        status: 400,
        message: "El nombre es requerido",
      });

      expect(mockGetConnection).not.toHaveBeenCalled();
    });

    test("debe fallar si username está vacío", async () => {
      await expect(
        crearUsuario({
          nombre: "Juan",
          username: " ",
          password: "12345678",
          confirmarPassword: "12345678",
          tipoUsuario: "ADMINISTRADOR",
        })
      ).rejects.toEqual({
        status: 400,
        message: "El correo es requerido",
      });
    });

    test("debe fallar si no hay password", async () => {
      await expect(
        crearUsuario({
          nombre: "Juan",
          username: "juan@test.com",
          password: "",
          confirmarPassword: "",
          tipoUsuario: "ADMINISTRADOR",
        })
      ).rejects.toEqual({
        status: 400,
        message: "La contraseña es requerida",
      });
    });

    test("debe fallar si password tiene menos de 8 caracteres", async () => {
      await expect(
        crearUsuario({
          nombre: "Juan",
          username: "juan@test.com",
          password: "123",
          confirmarPassword: "123",
          tipoUsuario: "ADMINISTRADOR",
        })
      ).rejects.toEqual({
        status: 400,
        message: "La contraseña debe tener mínimo 8 caracteres",
      });
    });

    test("debe fallar si las contraseñas no coinciden", async () => {
      await expect(
        crearUsuario({
          nombre: "Juan",
          username: "juan@test.com",
          password: "12345678",
          confirmarPassword: "87654321",
          tipoUsuario: "ADMINISTRADOR",
        })
      ).rejects.toEqual({
        status: 400,
        message: "Las contraseñas no coinciden",
      });
    });

    test("debe fallar si tipoUsuario es inválido", async () => {
      await expect(
        crearUsuario({
          nombre: "Juan",
          username: "juan@test.com",
          password: "12345678",
          confirmarPassword: "12345678",
          tipoUsuario: "INVITADO",
        })
      ).rejects.toEqual({
        status: 400,
        message: "Tipo de usuario inválido. Valores: ADMINISTRADOR, COORDINADOR, SUPERADMIN",
      });
    });

    test("debe fallar si se intenta crear SUPERADMIN", async () => {
      await expect(
        crearUsuario({
          nombre: "Juan",
          username: "juan@test.com",
          password: "12345678",
          confirmarPassword: "12345678",
          tipoUsuario: "SUPERADMIN",
        })
      ).rejects.toEqual({
        status: 403,
        message: "No se puede asignar el rol de Super Admin desde aquí",
      });
    });

    test("debe fallar si username ya existe", async () => {
      mockExecute.mockResolvedValueOnce({
        rows: [{ 1: 1 }],
      });

      await expect(
        crearUsuario({
          nombre: "Juan",
          username: "juan@test.com",
          password: "12345678",
          confirmarPassword: "12345678",
          tipoUsuario: "ADMINISTRADOR",
        })
      ).rejects.toEqual({
        status: 409,
        message: "El correo ya está en uso",
      });

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe cerrar conexión y lanzar error si falla Oracle", async () => {
      mockExecute.mockRejectedValue(new Error("Error Oracle"));

      await expect(
        crearUsuario({
          nombre: "Juan",
          username: "juan@test.com",
          password: "12345678",
          confirmarPassword: "12345678",
          tipoUsuario: "ADMINISTRADOR",
        })
      ).rejects.toThrow("Error Oracle");

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("actualizarUsuario", () => {
    test("debe actualizar usuario correctamente con foto", async () => {
      const foto = Buffer.from("foto-test");

      mockExecute
        .mockResolvedValueOnce({
          rows: [{ 1: 1 }],
        })
        .mockResolvedValueOnce({
          rows: [],
        })
        .mockResolvedValueOnce({
          rowsAffected: 1,
        })
        .mockResolvedValueOnce({
          rows: [
            {
              USUARIO_ID: 5,
              NOMBRE: "Nuevo Nombre",
              USERNAME: "nuevo@test.com",
              TIPO_USUARIO: "COORDINADOR",
              FECHA_REGISTRO: "2026-05-29",
              FOTO: foto,
            },
          ],
        });

      mockMapUsuario.mockImplementation((row) => ({
        id: row.USUARIO_ID,
        nombre: row.NOMBRE,
        username: row.USERNAME,
        tipoUsuario: row.TIPO_USUARIO,
        fechaRegistro: row.FECHA_REGISTRO,
        foto: row.FOTO,
      }));

      const result = await actualizarUsuario(5, {
        nombre: " Nuevo Nombre ",
        username: " nuevo@test.com ",
        tipoUsuario: "coordinador",
        foto,
      });

      expect(mockExecute).toHaveBeenNthCalledWith(
        1,
        "SELECT 1 FROM USUARIO WHERE USUARIO_ID = :id",
        [5],
        { outFormat: "OUT_FORMAT_OBJECT" }
      );

      expect(mockExecute).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("AND USUARIO_ID != :id"),
        {
          username: "nuevo@test.com",
          id: 5,
        },
        { outFormat: "OUT_FORMAT_OBJECT" }
      );

      expect(mockExecute).toHaveBeenNthCalledWith(
        3,
        expect.stringContaining("UPDATE USUARIO"),
        {
          nombre: "Nuevo Nombre",
          username: "nuevo@test.com",
          tipoUsuario: "COORDINADOR",
          foto: {
            val: foto,
            type: "BLOB",
          },
          fotoUpdate: 1,
          id: 5,
        },
        { autoCommit: true }
      );

      expect(result).toEqual({
        id: 5,
        nombre: "Nuevo Nombre",
        username: "nuevo@test.com",
        tipoUsuario: "COORDINADOR",
        fechaRegistro: "2026-05-29",
        foto: `data:image/jpeg;base64,${foto.toString("base64")}`,
      });

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe actualizar usuario sin foto y sin username", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [{ 1: 1 }],
        })
        .mockResolvedValueOnce({
          rowsAffected: 1,
        })
        .mockResolvedValueOnce({
          rows: [
            {
              USUARIO_ID: 5,
              NOMBRE: "Nuevo Nombre",
              USERNAME: "actual@test.com",
              TIPO_USUARIO: "ADMINISTRADOR",
              FECHA_REGISTRO: "2026-05-29",
              FOTO: null,
            },
          ],
        });

      mockMapUsuario.mockImplementation((row) => ({
        id: row.USUARIO_ID,
        nombre: row.NOMBRE,
        username: row.USERNAME,
        tipoUsuario: row.TIPO_USUARIO,
        fechaRegistro: row.FECHA_REGISTRO,
        foto: row.FOTO || null,
      }));

      const result = await actualizarUsuario(5, {
        nombre: "Nuevo Nombre",
      });

      expect(mockExecute).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("UPDATE USUARIO"),
        {
          nombre: "Nuevo Nombre",
          username: null,
          tipoUsuario: null,
          foto: {
            val: null,
            type: "BLOB",
          },
          fotoUpdate: 0,
          id: 5,
        },
        { autoCommit: true }
      );

      expect(result).toEqual({
        id: 5,
        nombre: "Nuevo Nombre",
        username: "actual@test.com",
        tipoUsuario: "ADMINISTRADOR",
        fechaRegistro: "2026-05-29",
        foto: null,
      });

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe fallar si nombre está vacío", async () => {
      await expect(
        actualizarUsuario(5, {
          nombre: " ",
        })
      ).rejects.toEqual({
        status: 400,
        message: "El nombre no puede estar vacío",
      });

      expect(mockGetConnection).not.toHaveBeenCalled();
    });

    test("debe fallar si username está vacío", async () => {
      await expect(
        actualizarUsuario(5, {
          username: " ",
        })
      ).rejects.toEqual({
        status: 400,
        message: "El correo no puede estar vacío",
      });

      expect(mockGetConnection).not.toHaveBeenCalled();
    });

    test("debe fallar si tipoUsuario es inválido", async () => {
      await expect(
        actualizarUsuario(5, {
          tipoUsuario: "INVITADO",
        })
      ).rejects.toEqual({
        status: 400,
        message: "Tipo de usuario inválido. Valores: ADMINISTRADOR, COORDINADOR, SUPERADMIN",
      });

      expect(mockGetConnection).not.toHaveBeenCalled();
    });

    test("debe fallar si se intenta asignar SUPERADMIN", async () => {
      await expect(
        actualizarUsuario(5, {
          tipoUsuario: "SUPERADMIN",
        })
      ).rejects.toEqual({
        status: 403,
        message: "No se puede asignar el rol de Super Admin desde aquí",
      });

      expect(mockGetConnection).not.toHaveBeenCalled();
    });

    test("debe fallar si usuario no existe", async () => {
      mockExecute.mockResolvedValueOnce({
        rows: [],
      });

      await expect(
        actualizarUsuario(99, {
          nombre: "Juan",
        })
      ).rejects.toEqual({
        status: 404,
        message: "Usuario no encontrado",
      });

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe fallar si username ya está en uso", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [{ 1: 1 }],
        })
        .mockResolvedValueOnce({
          rows: [{ 1: 1 }],
        });

      await expect(
        actualizarUsuario(5, {
          username: "duplicado@test.com",
        })
      ).rejects.toEqual({
        status: 409,
        message: "El correo ya está en uso",
      });

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe cerrar conexión y lanzar error si falla Oracle", async () => {
      mockExecute.mockRejectedValue(new Error("Error Oracle"));

      await expect(
        actualizarUsuario(5, {
          nombre: "Juan",
        })
      ).rejects.toThrow("Error Oracle");

      expect(mockClose).toHaveBeenCalled();
    });
  });

  describe("eliminarUsuario", () => {
    test("debe eliminar usuario correctamente", async () => {
      mockExecute
        .mockResolvedValueOnce({
          rows: [{ 1: 1 }],
        })
        .mockResolvedValueOnce({
          rowsAffected: 1,
        });

      await eliminarUsuario(5, 1);

      expect(mockExecute).toHaveBeenNthCalledWith(
        1,
        "SELECT 1 FROM USUARIO WHERE USUARIO_ID = :id",
        [5],
        { outFormat: "OUT_FORMAT_OBJECT" }
      );

      expect(mockExecute).toHaveBeenNthCalledWith(
        2,
        "DELETE FROM USUARIO WHERE USUARIO_ID = :id",
        [5],
        { autoCommit: true }
      );

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe fallar si intenta eliminar su propia cuenta", async () => {
      await expect(eliminarUsuario(5, 5)).rejects.toEqual({
        status: 400,
        message: "No puedes eliminar tu propia cuenta",
      });

      expect(mockGetConnection).not.toHaveBeenCalled();
    });

    test("debe fallar si usuario no existe", async () => {
      mockExecute.mockResolvedValueOnce({
        rows: [],
      });

      await expect(eliminarUsuario(99, 1)).rejects.toEqual({
        status: 404,
        message: "Usuario no encontrado",
      });

      expect(mockClose).toHaveBeenCalled();
    });

    test("debe cerrar conexión y lanzar error si falla Oracle", async () => {
      mockExecute.mockRejectedValue(new Error("Error Oracle"));

      await expect(eliminarUsuario(5, 1)).rejects.toThrow("Error Oracle");

      expect(mockClose).toHaveBeenCalled();
    });
  });
});