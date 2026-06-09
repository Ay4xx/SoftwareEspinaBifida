import { jest } from "@jest/globals";

const mockInsertarMedicina = jest.fn();
const mockInsertarEquipoMedico = jest.fn();
const mockVerificarDuplicado = jest.fn();
const mockActualizarCantidadMedicina = jest.fn();
const mockActualizarCantidadEquipo = jest.fn();
const mockGetInventarioCompleto = jest.fn();
const mockEliminarArticulo = jest.fn();

jest.unstable_mockModule("../../modulos/fiorella/regservicios/regservicios.service.js", () => ({
  insertarMedicina: mockInsertarMedicina,
  insertarEquipoMedico: mockInsertarEquipoMedico,
  verificarDuplicado: mockVerificarDuplicado,
  actualizarCantidadMedicina: mockActualizarCantidadMedicina,
  actualizarCantidadEquipo: mockActualizarCantidadEquipo,
  getInventarioCompleto: mockGetInventarioCompleto,
  eliminarArticulo: mockEliminarArticulo,
}));

const {
  crearMedicina,
  crearEquipoMedico,
  registrarEntradaMedicina,
  registrarEntradaEquipo,
  listarInventario,
  eliminarArticuloController,
} = await import("../../modulos/fiorella/regservicios/regservicios.controller.js");

function mockRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe("regservicios.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe("crearMedicina", () => {
    test("crea medicina correctamente", async () => {
      const req = {
        body: {
          descripcion: "Paracetamol",
          unidad: "Caja",
          precio: 100,
          medicion: "500mg",
          cantidad_total: 10,
        },
      };
      const res = mockRes();

      mockVerificarDuplicado.mockResolvedValue(false);
      mockInsertarMedicina.mockResolvedValue({ id: 1 });

      await crearMedicina(req, res);

      expect(mockVerificarDuplicado).toHaveBeenCalledWith("Paracetamol", "medicina");
      expect(mockInsertarMedicina).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        message: "Medicina insertada correctamente",
        data: { id: 1 },
      });
    });

    test("responde 400 si faltan campos", async () => {
      const req = {
        body: {
          descripcion: "Paracetamol",
          unidad: "Caja",
        },
      };
      const res = mockRes();

      await crearMedicina(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Todos los campos son obligatorios",
      });
      expect(mockInsertarMedicina).not.toHaveBeenCalled();
    });

    test("responde 400 si la medicina ya existe", async () => {
      const req = {
        body: {
          descripcion: "Paracetamol",
          unidad: "Caja",
          precio: 100,
          medicion: "500mg",
          cantidad_total: 10,
        },
      };
      const res = mockRes();

      mockVerificarDuplicado.mockResolvedValue(true);

      await crearMedicina(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Esta medicina ya existe en el inventario",
      });
      expect(mockInsertarMedicina).not.toHaveBeenCalled();
    });

    test("responde 500 si falla al crear medicina", async () => {
      const req = {
        body: {
          descripcion: "Paracetamol",
          unidad: "Caja",
          precio: 100,
          medicion: "500mg",
          cantidad_total: 10,
        },
      };
      const res = mockRes();

      mockVerificarDuplicado.mockResolvedValue(false);
      mockInsertarMedicina.mockRejectedValue(new Error("Error insertando"));

      await crearMedicina(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error insertando",
      });
    });
  });

  describe("crearEquipoMedico", () => {
    test("crea equipo médico correctamente", async () => {
      const req = {
        body: {
          descripcion: "Silla de ruedas",
          precio: 1500,
          cantidad_total: 5,
        },
      };
      const res = mockRes();

      mockVerificarDuplicado.mockResolvedValue(false);
      mockInsertarEquipoMedico.mockResolvedValue({ id: 2 });

      await crearEquipoMedico(req, res);

      expect(mockVerificarDuplicado).toHaveBeenCalledWith("Silla de ruedas", "equipo");
      expect(mockInsertarEquipoMedico).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        message: "Equipo médico insertado correctamente",
        data: { id: 2 },
      });
    });

    test("responde 400 si faltan campos del equipo", async () => {
      const req = {
        body: {
          descripcion: "Silla de ruedas",
        },
      };
      const res = mockRes();

      await crearEquipoMedico(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Todos los campos son obligatorios",
      });
      expect(mockInsertarEquipoMedico).not.toHaveBeenCalled();
    });

    test("responde 400 si el equipo ya existe", async () => {
      const req = {
        body: {
          descripcion: "Silla de ruedas",
          precio: 1500,
          cantidad_total: 5,
        },
      };
      const res = mockRes();

      mockVerificarDuplicado.mockResolvedValue(true);

      await crearEquipoMedico(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Este equipo ya existe en el inventario",
      });
      expect(mockInsertarEquipoMedico).not.toHaveBeenCalled();
    });

    test("responde 500 si falla al crear equipo", async () => {
      const req = {
        body: {
          descripcion: "Silla de ruedas",
          precio: 1500,
          cantidad_total: 5,
        },
      };
      const res = mockRes();

      mockVerificarDuplicado.mockResolvedValue(false);
      mockInsertarEquipoMedico.mockRejectedValue(new Error("Error equipo"));

      await crearEquipoMedico(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error equipo",
      });
    });
  });

  describe("registrarEntradaMedicina", () => {
    test("actualiza cantidad de medicina correctamente", async () => {
      const req = {
        body: {
          medicinaId: 1,
          cantidad: 10,
        },
      };
      const res = mockRes();

      mockActualizarCantidadMedicina.mockResolvedValue();

      await registrarEntradaMedicina(req, res);

      expect(mockActualizarCantidadMedicina).toHaveBeenCalledWith(1, 10);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        message: "Cantidad actualizada correctamente",
      });
    });

    test("responde 400 si falta medicinaId o cantidad", async () => {
      const req = {
        body: {
          medicinaId: 1,
        },
      };
      const res = mockRes();

      await registrarEntradaMedicina(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "ID y cantidad son obligatorios",
      });
    });

    test("responde 400 si cantidad es menor o igual a 0", async () => {
      const req = {
        body: {
          medicinaId: 1,
          cantidad: 0,
        },
      };
      const res = mockRes();

      await registrarEntradaMedicina(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "ID y cantidad son obligatorios",
      });
    });

    test("responde 500 si falla actualizar medicina", async () => {
      const req = {
        body: {
          medicinaId: 1,
          cantidad: 5,
        },
      };
      const res = mockRes();

      mockActualizarCantidadMedicina.mockRejectedValue(new Error("Error actualizar"));

      await registrarEntradaMedicina(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error actualizar",
      });
    });
  });

  describe("registrarEntradaEquipo", () => {
    test("actualiza cantidad de equipo correctamente", async () => {
      const req = {
        body: {
          equipoId: 2,
          cantidad: 4,
        },
      };
      const res = mockRes();

      mockActualizarCantidadEquipo.mockResolvedValue();

      await registrarEntradaEquipo(req, res);

      expect(mockActualizarCantidadEquipo).toHaveBeenCalledWith(2, 4);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        message: "Cantidad actualizada correctamente",
      });
    });

    test("responde 400 si falta equipoId o cantidad", async () => {
      const req = {
        body: {
          equipoId: 2,
        },
      };
      const res = mockRes();

      await registrarEntradaEquipo(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "ID y cantidad son obligatorios",
      });
    });

    test("responde 400 si cantidad es menor o igual a 0", async () => {
      const req = {
        body: {
          equipoId: 2,
          cantidad: -1,
        },
      };
      const res = mockRes();

      await registrarEntradaEquipo(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "La cantidad debe ser mayor a 0",
      });
    });

    test("responde 500 si falla actualizar equipo", async () => {
      const req = {
        body: {
          equipoId: 2,
          cantidad: 4,
        },
      };
      const res = mockRes();

      mockActualizarCantidadEquipo.mockRejectedValue(new Error("Error equipo"));

      await registrarEntradaEquipo(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error equipo",
      });
    });
  });

  describe("listarInventario", () => {
    test("lista inventario correctamente", async () => {
      const req = {};
      const res = mockRes();

      const data = [
        { id: 1, descripcion: "Paracetamol", tipo: "medicina" },
        { id: 2, descripcion: "Silla de ruedas", tipo: "equipo" },
      ];

      mockGetInventarioCompleto.mockResolvedValue(data);

      await listarInventario(req, res);

      expect(mockGetInventarioCompleto).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        data,
      });
    });

    test("listarInventario responde 500 si falla el service", async () => {
      const req = {};
      const res = mockRes();

      mockGetInventarioCompleto.mockRejectedValue(new Error("Error inventario"));

      await listarInventario(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error inventario",
      });
    });
  });

  describe("eliminarArticuloController", () => {
    test("elimina artículo correctamente", async () => {
      const req = {
        params: {
          id: "1",
          tipo: "medicina",
        },
      };
      const res = mockRes();

      mockEliminarArticulo.mockResolvedValue();

      await eliminarArticuloController(req, res);

      expect(mockEliminarArticulo).toHaveBeenCalledWith("1", "medicina");
      expect(res.json).toHaveBeenCalledWith({
        ok: true,
        message: "Artículo eliminado correctamente",
      });
    });

    test("responde 400 si falta id o tipo", async () => {
      const req = {
        params: {
          id: "1",
        },
      };
      const res = mockRes();

      await eliminarArticuloController(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "ID y tipo son obligatorios",
      });
    });

    test("responde 500 si falla eliminar artículo", async () => {
      const req = {
        params: {
          id: "1",
          tipo: "equipo",
        },
      };
      const res = mockRes();

      mockEliminarArticulo.mockRejectedValue(new Error("Error eliminando"));

      await eliminarArticuloController(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        ok: false,
        message: "Error eliminando",
      });
    });
  });
});