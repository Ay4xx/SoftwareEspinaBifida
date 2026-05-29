import { jest, describe, beforeEach, test, expect } from "@jest/globals";

const mockGetEstadisticasModel = jest.fn();

jest.unstable_mockModule("../../modulos/estadisticas/estadisticas.model.js", () => ({
  getEstadisticasModel: mockGetEstadisticasModel,
}));

const {
  getEstadisticasService,
  descargarReporteMensualService,
} = await import("../../modulos/estadisticas/estadisticas.service.js");

const statsCompletas = {
  TOTAL_ARTICULOS: 10,
  EXISTENCIAS_NORMAL: 6,
  EXISTENCIAS_BAJAS: 3,
  EXISTENCIAS_AGOTADAS: 1,

  TOTAL_PACIENTES: 20,
  PACIENTES_ACTIVOS: 18,
  PACIENTES_INACTIVOS: 2,
  PACIENTES_NUEVOS_MES: 4,

  VISITAS_MES: 8,
  SERVICIOS_REALIZADOS: 12,
  MEDICINAS_ENTREGADAS: 30,
  EQUIPO_SIN_REGRESAR: 2,

  INGRESOS_MES: 5000,
  REGISTROS_PENDIENTES: 3,
  NOTIFICACIONES_MES: 6,
  TOTAL_REPORTES: 15,
};

describe("estadisticas.service.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getEstadisticasService", () => {
    test("debe mapear estadísticas correctamente", async () => {
      mockGetEstadisticasModel.mockResolvedValue(statsCompletas);

      const result = await getEstadisticasService();

      expect(mockGetEstadisticasModel).toHaveBeenCalled();

      expect(result).toEqual({
        totalArticulos: 10,
        existenciasNormal: 6,
        existenciasBajas: 3,
        existenciasAgotadas: 1,

        totalPacientes: 20,
        pacientesActivos: 18,
        pacientesInactivos: 2,
        pacientesNuevosMes: 4,

        visitasMes: 8,
        serviciosRealizados: 12,
        medicinasEntregadas: 30,
        equipoSinRegresar: 2,

        ingresosMes: 5000,
        registrosPendientes: 3,
        notificacionesMes: 6,
        totalReportes: 15,
      });
    });

    test("debe regresar 0 cuando los valores vienen null o undefined", async () => {
      mockGetEstadisticasModel.mockResolvedValue({});

      const result = await getEstadisticasService();

      expect(result).toEqual({
        totalArticulos: 0,
        existenciasNormal: 0,
        existenciasBajas: 0,
        existenciasAgotadas: 0,

        totalPacientes: 0,
        pacientesActivos: 0,
        pacientesInactivos: 0,
        pacientesNuevosMes: 0,

        visitasMes: 0,
        serviciosRealizados: 0,
        medicinasEntregadas: 0,
        equipoSinRegresar: 0,

        ingresosMes: 0,
        registrosPendientes: 0,
        notificacionesMes: 0,
        totalReportes: 0,
      });
    });
  });

  describe("descargarReporteMensualService", () => {
    test("debe regresar reporte JSON con todas las secciones seleccionadas", async () => {
      mockGetEstadisticasModel.mockResolvedValue(statsCompletas);

      const result = await descargarReporteMensualService({
        inventario: true,
        pacientes: true,
        servicios: true,
        reportes: true,
      });

      expect(result).toEqual({
        inventario: {
          totalArticulos: 10,
          existenciasNormal: 6,
          existenciasBajas: 3,
          existenciasAgotadas: 1,
        },
        pacientes: {
          totalPacientes: 20,
          pacientesActivos: 18,
          pacientesInactivos: 2,
          pacientesNuevosMes: 4,
        },
        servicios: {
          visitasMes: 8,
          serviciosRealizados: 12,
          medicinasEntregadas: 30,
          equipoSinRegresar: 2,
        },
        reportes: {
          ingresosMes: 5000,
          registrosPendientes: 3,
          notificacionesMes: 6,
          totalReportes: 15,
        },
      });
    });

    test("debe regresar solo inventario si solo inventario está seleccionado", async () => {
      mockGetEstadisticasModel.mockResolvedValue(statsCompletas);

      const result = await descargarReporteMensualService({
        inventario: true,
      });

      expect(result).toEqual({
        inventario: {
          totalArticulos: 10,
          existenciasNormal: 6,
          existenciasBajas: 3,
          existenciasAgotadas: 1,
        },
      });
    });

    test("debe generar CSV correctamente", async () => {
      mockGetEstadisticasModel.mockResolvedValue(statsCompletas);

      const result = await descargarReporteMensualService({
        inventario: true,
        tipoArchivo: "csv",
      });

      expect(result).toContain("INVENTARIO");
      expect(result).toContain("campo,valor");
      expect(result).toContain("totalArticulos,10");
      expect(result).toContain("existenciasNormal,6");
      expect(result).toContain("existenciasBajas,3");
      expect(result).toContain("existenciasAgotadas,1");
    });

    test("debe generar Excel como buffer", async () => {
      mockGetEstadisticasModel.mockResolvedValue(statsCompletas);

      const result = await descargarReporteMensualService({
        pacientes: true,
        tipoArchivo: "excel",
      });

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    test("debe generar PDF como buffer", async () => {
      mockGetEstadisticasModel.mockResolvedValue(statsCompletas);

      const result = await descargarReporteMensualService({
        reportes: true,
        tipoArchivo: "pdf",
      });

      expect(result).toBeDefined();
      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);

      const inicioPDF = result.subarray(0, 4).toString();
      expect(inicioPDF).toBe("%PDF");
    });

    test("debe regresar objeto vacío si no se selecciona ninguna sección", async () => {
      mockGetEstadisticasModel.mockResolvedValue(statsCompletas);

      const result = await descargarReporteMensualService({});

      expect(result).toEqual({});
    });

    test("debe usar 0 en el reporte si los valores vienen undefined", async () => {
      mockGetEstadisticasModel.mockResolvedValue({});

      const result = await descargarReporteMensualService({
        inventario: true,
        pacientes: true,
        servicios: true,
        reportes: true,
      });

      expect(result).toEqual({
        inventario: {
          totalArticulos: 0,
          existenciasNormal: 0,
          existenciasBajas: 0,
          existenciasAgotadas: 0,
        },
        pacientes: {
          totalPacientes: 0,
          pacientesActivos: 0,
          pacientesInactivos: 0,
          pacientesNuevosMes: 0,
        },
        servicios: {
          visitasMes: 0,
          serviciosRealizados: 0,
          medicinasEntregadas: 0,
          equipoSinRegresar: 0,
        },
        reportes: {
          ingresosMes: 0,
          registrosPendientes: 0,
          notificacionesMes: 0,
          totalReportes: 0,
        },
      });
    });
  });
});