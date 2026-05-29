import { jest, describe, beforeEach, test, expect } from "@jest/globals";

const mockObtenerHistorialFamiliar = jest.fn();

jest.unstable_mockModule("../../modulos/detallefamilia/familia.service.js", () => ({
  obtenerHistorialFamiliar: mockObtenerHistorialFamiliar,
}));

const { getHistorialFamiliar } = await import(
  "../../modulos/detallefamilia/familia.controller.js"
);

function crearMockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("familia.controller.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getHistorialFamiliar", () => {
    test("debe obtener historial familiar correctamente", async () => {
      const req = {
        params: {
          id: "10",
        },
      };
      const res = crearMockRes();

      const data = [
        {
          PADRE_ID: 1,
          PACIENTE_ID: 10,
          PADRE_LUGAR_NACIMIENTO: "Monterrey",
          PADRE_ESCOLARIDAD: "Licenciatura",
          PADRE_OCUPACION: "Ingeniero",
          PADRE_EDAD: 40,
          PADRE_PARENTESCO: "S",
          PADRE_SEGURO: "IMSS",
          MADRE_ID: 2,
          MADRE_LUGAR_NACIMIENTO: "Guadalupe",
          MADRE_ESCOLARIDAD: "Preparatoria",
          MADRE_OCUPACION: "Maestra",
          MADRE_EDAD: 38,
          MADRE_PARENTESCO: "S",
          CD_EMBARAZO: "No",
          ACIDO_FOLICO: "S",
          CITAS_CONTROL: 5,
          MADRE_SEGURO: "IMSS",
          ADICCIONES: "No",
          HIJO_DTN: "No",
          FAMILIAR_DTN: "No",
          EXPO_TOXICOS: "No",
          DESCRIPCION_EXPO_TOXICOS: null,
        },
      ];

      mockObtenerHistorialFamiliar.mockResolvedValue(data);

      await getHistorialFamiliar(req, res);

      expect(mockObtenerHistorialFamiliar).toHaveBeenCalledWith("10");
      expect(res.json).toHaveBeenCalledWith(data);
      expect(res.status).not.toHaveBeenCalled();
    });

    test("debe responder 500 si ocurre un error", async () => {
      const req = {
        params: {
          id: "10",
        },
      };
      const res = crearMockRes();

      mockObtenerHistorialFamiliar.mockRejectedValue(new Error("DB error"));

      await getHistorialFamiliar(req, res);

      expect(mockObtenerHistorialFamiliar).toHaveBeenCalledWith("10");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Error al obtener información familiar",
      });
    });
  });
});