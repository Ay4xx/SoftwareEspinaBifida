import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

import { getEstadisticasModel } from "./estadisticas.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCRIPTS_DIR = path.resolve(__dirname, "../../scripts");

function runPython(scriptName, jsonPayload) {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(SCRIPTS_DIR, scriptName);

    console.log("\n========== RUN PYTHON ==========");
    console.log("Script path:", scriptPath);
    console.log("Payload size:", jsonPayload.length, "chars");

    const pythonCmd = process.platform === "win32" ? "py" : "python3";
    const py = spawn(pythonCmd, [scriptPath]);

    const stdout = [];
    const stderr = [];

    py.stdout.on("data", (d) => {
      console.log("STDOUT CHUNK:", d.length, "bytes");
      stdout.push(d);
    });

    py.stderr.on("data", (d) => {
      console.log("STDERR:", d.toString());
      stderr.push(d);
    });

    py.on("close", (code) => {
      console.log("PYTHON CLOSE CODE:", code);
      console.log("STDERR LENGTH:", Buffer.concat(stderr).length);
      console.log("STDOUT LENGTH:", Buffer.concat(stdout).length);
      console.log("STDERR TEXT:", Buffer.concat(stderr).toString().slice(0, 500));

      const errText = Buffer.concat(stderr).toString();

      if (errText.includes("Traceback") || errText.includes("Error")) {
        return reject(new Error(`Python error:\n${errText}`));
      }

      if (code !== 0) {
        return reject(new Error(`Python exited with code ${code}.\nSTDERR: ${errText}`));
      }

      try {
        const b64 = Buffer.concat(stdout)
          .toString("utf8")
          .trim()
          .replace(/\r|\n/g, "");

        console.log("B64 length:", b64.length);
        console.log("B64 starts with:", b64.slice(0, 20));

        const buffer = Buffer.from(b64, "base64");
        console.log("Decoded buffer size:", buffer.length, "bytes");
        resolve(buffer);
      } catch (e) {
        reject(e);
      }
    });

    py.on("error", (err) => {
      console.log("SPAWN ERROR:", err);
      reject(err);
    });

    py.stdin.write(jsonPayload);
    py.stdin.end();
    console.log("Payload sent to Python stdin");
  });
}

/* ── Series que corresponden a cada sección ─────────────────────────────── */
const SERIES_POR_SECCION = {
  pacientes:      ["pacientesNuevosMes"],
  citas:          ["citasMes", "citasAtendidasMes", "citasCanceladasMes"],
  visitas:        ["visitasMes", "ingresosMes", "descuentosMes", "serviciosMes", "medicinasUtilizadasMes"],
  membresias:     [],
  servicios:      ["serviciosMes", "visitasMes", "medicinasUtilizadasMes"],
  medicinas:      ["medicinasUtilizadasMes", "actualizacionesMes"],
  equipo:         ["equiposEnUsoMes"],
  notificaciones: ["notificacionesMes"],
};

/* ── Exports públicos ───────────────────────────────────────────────────── */

export async function getEstadisticasService({ fechaInicio, fechaFin } = {}) {
  const { kpis: k, series } = await getEstadisticasModel({ fechaInicio, fechaFin });
  return buildStatsObject(k, series);
}

export async function descargarReporteMensualService(filtros) {
  console.log("\n========== SERVICE ==========");
  console.log("Filtros:", JSON.stringify(filtros));

  const { fechaInicio, fechaFin } = filtros;
  const { kpis: k, series } = await getEstadisticasModel({ fechaInicio, fechaFin });
  const stats = buildStatsObject(k, series);
  const payload = buildFilteredPayload(stats, filtros);

  console.log("Payload keys:", Object.keys(payload));
  console.log("Series keys:", Object.keys(payload.series || {}));
  console.log("Tipo archivo:", filtros.tipoArchivo);

  const { tipoArchivo } = filtros;

  if (tipoArchivo === "excel") return runPython("generate_excel.py", JSON.stringify(payload));
  if (tipoArchivo === "pdf")   return runPython("generate_pdf.py",   JSON.stringify(payload));
  if (tipoArchivo === "csv")   return Buffer.from(convertirACSV(payload), "utf-8");

  return payload;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function buildStatsObject(k, series) {
  return {
    pacientes: {
      total:               Number(k.TOTAL_PACIENTES)              || 0,
      vivos:               Number(k.PACIENTES_VIVOS)              || 0,
      fallecidos:          Number(k.PACIENTES_FALLECIDOS)         || 0,
      nuevos_mes:          Number(k.PACIENTES_NUEVOS_MES)         || 0,
      con_valvula:         Number(k.PACIENTES_CON_VALVULA)        || 0,
      con_padecimientos:   Number(k.PACIENTES_CON_PADECIMIENTOS)  || 0,
    },
    citas: {
      total:      Number(k.TOTAL_CITAS)      || 0,
      atendidas:  Number(k.CITAS_ATENDIDAS)  || 0,
      canceladas: Number(k.CITAS_CANCELADAS) || 0,
      pendientes: Number(k.CITAS_PENDIENTES) || 0,
      mes:        Number(k.CITAS_MES)        || 0,
    },
    visitas: {
      total:              Number(k.TOTAL_VISITAS)            || 0,
      mes:                Number(k.VISITAS_MES)              || 0,
      cuotas_totales:     Number(k.CUOTAS_TOTALES)           || 0,
      ingresos_totales:   Number(k.INGRESOS_TOTALES)         || 0,
      descuentos_totales: Number(k.DESCUENTOS_TOTALES)       || 0,
      ingreso_promedio:   Number(k.INGRESO_PROMEDIO_VISITA)  || 0,
      porcentaje_pago:    Number(k.PORCENTAJE_PAGO_COMPLETO) || 0,
    },
    membresias: {
      activas:   Number(k.MEMBRESIAS_ACTIVAS)   || 0,
      inactivas: Number(k.MEMBRESIAS_INACTIVAS) || 0,
      vencidas:  Number(k.MEMBRESIAS_VENCIDAS)  || 0,
    },
    servicios: {
      total: Number(k.TOTAL_SERVICIOS_REALIZADOS) || 0,
      mes:   Number(k.SERVICIOS_REALIZADOS_MES)   || 0,
    },
    medicinas: {
      total:                      Number(k.TOTAL_MEDICINAS)               || 0,
      stock_total:                Number(k.STOCK_TOTAL_MEDICINAS)         || 0,
      bajo_stock:                 Number(k.MEDICINAS_BAJO_STOCK)          || 0,
      valor_inventario:           Number(k.VALOR_INVENTARIO_MEDICINAS)    || 0,
      utilizadas:                 Number(k.MEDICINAS_UTILIZADAS)          || 0,
      actualizaciones_inventario: Number(k.ACTUALIZACIONES_INVENTARIO)    || 0,
    },
    equipo: {
      total:              Number(k.TOTAL_EQUIPOS)              || 0,
      bajo_stock:         Number(k.EQUIPOS_BAJO_STOCK)         || 0,
      cantidad_total:     Number(k.CANTIDAD_TOTAL_EQUIPOS)     || 0,
      en_uso:             Number(k.EQUIPOS_EN_USO)             || 0,
      regresados:         Number(k.EQUIPOS_REGRESADOS)         || 0,
      porcentaje_retorno: Number(k.PORCENTAJE_RETORNO_EQUIPOS) || 0,
      valor_total:        Number(k.VALOR_TOTAL_EQUIPOS)        || 0,
    },
    notificaciones: {
      rechazados:      Number(k.PACIENTES_RECHAZADOS)      || 0,
      tasa_aprobacion: Number(k.TASA_APROBACION_PACIENTES) || 0,
      mes:             Number(k.NOTIFICACIONES_MES)        || 0,
    },
    series,
  };
}

function buildFilteredPayload(stats, filtros) {
  const secciones = [
    "pacientes", "citas", "visitas", "membresias",
    "servicios", "medicinas", "equipo", "notificaciones",
  ];

  const haySeleccion = secciones.some((k) => filtros[k]);
  if (!haySeleccion) return { ...stats };

  const payload = {};

  secciones.forEach((sec) => {
    if (filtros[sec]) payload[sec] = stats[sec];
  });

  const seriesNecesarias = new Set();
  secciones.forEach((sec) => {
    if (filtros[sec]) {
      (SERIES_POR_SECCION[sec] || []).forEach((s) => seriesNecesarias.add(s));
    }
  });

  payload.series = {};
  seriesNecesarias.forEach((key) => {
    payload.series[key] = stats.series[key] || [];
  });

  return payload;
}

function convertirACSV(data) {
  let csv = "";
  const skip = new Set(["series"]);
  Object.entries(data).forEach(([seccion, valores]) => {
    if (skip.has(seccion) || typeof valores !== "object" || Array.isArray(valores)) return;
    csv += `${seccion.toUpperCase()}\ncampo,valor\n`;
    Object.entries(valores).forEach(([key, value]) => {
      csv += `${key},${value}\n`;
    });
    csv += "\n";
  });
  return csv;
}