import { jest, describe, test, expect, beforeEach } from "@jest/globals";

const mockGetEstadisticasModel = jest.fn();

jest.unstable_mockModule("../../modulos/estadisticas/estadisticas.model.js", () => ({
  getEstadisticasModel: mockGetEstadisticasModel,
}));

const {
  getEstadisticasService,
  descargarReporteMensualService,
} = await import("../../modulos/estadisticas/estadisticas.service.js");

describe("estadisticas.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockData = {
    kpis: {
      TOTAL_PACIENTES: "10",
      PACIENTES_VIVOS: "8",
      PACIENTES_FALLECIDOS: "2",
      PACIENTES_NUEVOS_MES: "3",
      PACIENTES_CON_VALVULA: "4",
      PACIENTES_CON_PADECIMIENTOS: "7",

      TOTAL_CITAS: "20",
      CITAS_ATENDIDAS: "12",
      CITAS_CANCELADAS: "5",
      CITAS_PENDIENTES: "3",
      CITAS_MES: "9",

      TOTAL_VISITAS: "30",
      VISITAS_MES: "6",
      CUOTAS_TOTALES: "1000",
      INGRESOS_TOTALES: "900",
      DESCUENTOS_TOTALES: "100",
      INGRESO_PROMEDIO_VISITA: "30",
      PORCENTAJE_PAGO_COMPLETO: "80",

      MEMBRESIAS_ACTIVAS: "5",
      MEMBRESIAS_INACTIVAS: "2",
      MEMBRESIAS_VENCIDAS: "1",

      TOTAL_SERVICIOS_REALIZADOS: "15",
      SERVICIOS_REALIZADOS_MES: "4",

      TOTAL_MEDICINAS: "50",
      STOCK_TOTAL_MEDICINAS: "200",
      MEDICINAS_BAJO_STOCK: "3",
      VALOR_INVENTARIO_MEDICINAS: "5000",
      MEDICINAS_UTILIZADAS: "10",
      ACTUALIZACIONES_INVENTARIO: "2",

      TOTAL_EQUIPOS: "12",
      CANTIDAD_TOTAL_EQUIPOS: "18",
      EQUIPOS_EN_USO: "9",
      EQUIPOS_REGRESADOS: "6",
      PORCENTAJE_RETORNO_EQUIPOS: "70",
      VALOR_TOTAL_EQUIPOS: "12000",

      PACIENTES_RECHAZADOS: "2",
      TASA_APROBACION_PACIENTES: "85",
      NOTIFICACIONES_MES: "11",
    },
    series: {
      pacientesNuevosMes: [{ mes: "Enero", total: 3 }],
      citasMes: [{ mes: "Enero", total: 9 }],
      citasAtendidasMes: [{ mes: "Enero", total: 12 }],
      citasCanceladasMes: [{ mes: "Enero", total: 5 }],
      visitasMes: [{ mes: "Enero", total: 6 }],
      ingresosMes: [{ mes: "Enero", total: 900 }],
      descuentosMes: [{ mes: "Enero", total: 100 }],
      serviciosMes: [{ mes: "Enero", total: 4 }],
      medicinasUtilizadasMes: [{ mes: "Enero", total: 10 }],
      actualizacionesMes: [{ mes: "Enero", total: 2 }],
      equiposEnUsoMes: [{ mes: "Enero", total: 9 }],
      notificacionesMes: [{ mes: "Enero", total: 11 }],
    },
  };

  test("getEstadisticasService debe regresar las estadísticas formateadas", async () => {
    mockGetEstadisticasModel.mockResolvedValue(mockData);

    const result = await getEstadisticasService();

    expect(mockGetEstadisticasModel).toHaveBeenCalledTimes(1);

    expect(result.pacientes).toEqual({
      total: 10,
      vivos: 8,
      fallecidos: 2,
      nuevos_mes: 3,
      con_valvula: 4,
      con_padecimientos: 7,
    });

    expect(result.citas.total).toBe(20);
    expect(result.visitas.ingresos_totales).toBe(900);
    expect(result.membresias.activas).toBe(5);
    expect(result.medicinas.stock_total).toBe(200);
    expect(result.equipo.valor_total).toBe(12000);
    expect(result.notificaciones.tasa_aprobacion).toBe(85);
    expect(result.series).toEqual(mockData.series);
  });

  test("getEstadisticasService debe convertir valores inválidos a 0", async () => {
    mockGetEstadisticasModel.mockResolvedValue({
      kpis: {
        TOTAL_PACIENTES: null,
        PACIENTES_VIVOS: undefined,
        TOTAL_CITAS: "abc",
      },
      series: {},
    });

    const result = await getEstadisticasService();

    expect(result.pacientes.total).toBe(0);
    expect(result.pacientes.vivos).toBe(0);
    expect(result.citas.total).toBe(0);
    expect(result.series).toEqual({});
  });

  test("descargarReporteMensualService debe regresar payload completo si no hay secciones seleccionadas", async () => {
    mockGetEstadisticasModel.mockResolvedValue(mockData);

    const result = await descargarReporteMensualService({
      tipoArchivo: "json",
    });

    expect(result.pacientes.total).toBe(10);
    expect(result.citas.total).toBe(20);
    expect(result.series).toEqual(mockData.series);
  });

  test("descargarReporteMensualService debe filtrar por secciones seleccionadas", async () => {
    mockGetEstadisticasModel.mockResolvedValue(mockData);

    const result = await descargarReporteMensualService({
      tipoArchivo: "json",
      pacientes: true,
      citas: true,
    });

    expect(result.pacientes).toBeDefined();
    expect(result.citas).toBeDefined();
    expect(result.visitas).toBeUndefined();
    expect(result.membresias).toBeUndefined();

    expect(result.series.pacientesNuevosMes).toEqual(mockData.series.pacientesNuevosMes);
    expect(result.series.citasMes).toEqual(mockData.series.citasMes);
    expect(result.series.citasAtendidasMes).toEqual(mockData.series.citasAtendidasMes);
    expect(result.series.citasCanceladasMes).toEqual(mockData.series.citasCanceladasMes);
  });

  test("descargarReporteMensualService debe generar CSV", async () => {
    mockGetEstadisticasModel.mockResolvedValue(mockData);

    const result = await descargarReporteMensualService({
      tipoArchivo: "csv",
      pacientes: true,
    });

    expect(Buffer.isBuffer(result)).toBe(true);

    const csv = result.toString("utf-8");

    expect(csv).toContain("PACIENTES");
    expect(csv).toContain("campo,valor");
    expect(csv).toContain("total,10");
    expect(csv).toContain("vivos,8");
  });
});