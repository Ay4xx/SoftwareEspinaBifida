import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";


import { getEstadisticasModel } from "./estadisticas.model.js";

const execFileAsync = promisify(execFile);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SCRIPTS_DIR = path.resolve(__dirname, "../../scripts");

async function runPython(scriptName, jsonPayload) {

  return new Promise((resolve, reject) => {

    console.log("\n========== RUN PYTHON ==========");
    console.log("Script:", scriptName);

    const scriptPath = path.join(SCRIPTS_DIR, scriptName);

    console.log("Script path:", scriptPath);

    const py = spawn("py", [scriptPath]);

    let stdout = [];
    let stderr = [];

    py.stdout.on("data", (data) => {
      console.log("PYTHON STDOUT CHUNK RECEIVED");
      stdout.push(data);
    });

    py.stderr.on("data", (data) => {

      const text = data.toString();

      console.log("\nPYTHON STDERR:");
      console.log(text);

      stderr.push(data);
    });

    py.on("close", (code) => {

      console.log("\nPYTHON PROCESS CLOSED");
      console.log("Exit code:", code);

      const stdoutBuffer = Buffer.concat(stdout);
      const stderrBuffer = Buffer.concat(stderr);

      if (stderrBuffer.length > 0) {

        const errText = stderrBuffer.toString();

        console.log("\nFULL STDERR:");
        console.log(errText);

        if (
          errText.includes("Traceback") ||
          errText.includes("Error")
        ) {
          return reject(
            new Error(`Python Error:\n${errText}`)
          );
        }
      }

      const stdoutText = stdoutBuffer.toString("utf8");

      console.log(
        "\nSTDOUT first 100 chars:"
      );

      console.log(
        stdoutText.slice(0, 100)
      );

      try {

        const cleanBase64 = stdoutText
          .trim()
          .replace(/\r/g, "")
          .replace(/\n/g, "");

        console.log(
          "Starts with JVBER:",
          cleanBase64.startsWith("JVBER")
        );

        const buffer = Buffer.from(
          cleanBase64,
          "base64"
        );

        console.log(
          "\nDecoded buffer size:",
          buffer.length
        );

        resolve(buffer);

      } catch (err) {

        reject(err);
      }
    });

    py.on("error", (err) => {

      console.log("\nFAILED TO START PYTHON");
      console.log(err);

      reject(err);
    });

    console.log("\nSending payload to Python...");

    py.stdin.write(jsonPayload);

    py.stdin.end();

    console.log("Payload sent");
  });
}


export async function getEstadisticasService() {
  const { kpis: k, series } = await getEstadisticasModel();

  return buildStatsObject(k, series);
}

export async function descargarReporteMensualService(filtros) {
    //DEBUGS ----------------------------------------------------------------------------
  console.log("SERVICE -> enviando data:", filtros);
  //DEBUGS ----------------------------------------------------------------------------
  const { kpis: k, series } = await getEstadisticasModel();
  const stats = buildStatsObject(k, series);

  const payload = buildFilteredPayload(stats, filtros);

  const { tipoArchivo } = filtros;

  //DEBUGS ----------------------------------------------------------------------------
  console.log("\n========== SERVICE ==========");
  console.log("Tipo archivo:", tipoArchivo);

  console.log(
    "Payload sections:",
    Object.keys(payload)
  );
  //DEBUGS ----------------------------------------------------------------------------

  if (tipoArchivo === "excel") {
    return runPython("generate_excel.py", JSON.stringify(payload));
  }

  if (tipoArchivo === "pdf") {
    return runPython("generate_pdf.py", JSON.stringify(payload));
  }

  if (tipoArchivo === "csv") {
    return Buffer.from(convertirACSV(payload), "utf-8");
  }

  return payload;
}


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
      total:               Number(k.TOTAL_VISITAS)            || 0,
      mes:                 Number(k.VISITAS_MES)              || 0,
      cuotas_totales:      Number(k.CUOTAS_TOTALES)           || 0,
      ingresos_totales:    Number(k.INGRESOS_TOTALES)         || 0,
      descuentos_totales:  Number(k.DESCUENTOS_TOTALES)       || 0,
      ingreso_promedio:    Number(k.INGRESO_PROMEDIO_VISITA)  || 0,
      porcentaje_pago:     Number(k.PORCENTAJE_PAGO_COMPLETO) || 0,
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
      total:               Number(k.TOTAL_EQUIPOS)              || 0,
      cantidad_total:      Number(k.CANTIDAD_TOTAL_EQUIPOS)     || 0,
      en_uso:              Number(k.EQUIPOS_EN_USO)             || 0,
      regresados:          Number(k.EQUIPOS_REGRESADOS)         || 0,
      porcentaje_retorno:  Number(k.PORCENTAJE_RETORNO_EQUIPOS) || 0,
      valor_total:         Number(k.VALOR_TOTAL_EQUIPOS)        || 0,
    },
    notificaciones: {
      rechazados:       Number(k.PACIENTES_RECHAZADOS)      || 0,
      tasa_aprobacion:  Number(k.TASA_APROBACION_PACIENTES) || 0,
      mes:              Number(k.NOTIFICACIONES_MES)        || 0,
    },
    series,
  };
}

function buildFilteredPayload(stats, filtros) {
  const payload = { series: stats.series };

  if (filtros.pacientes)       payload.pacientes      = stats.pacientes;
  if (filtros.citas)           payload.citas          = stats.citas;
  if (filtros.visitas)         payload.visitas        = stats.visitas;
  if (filtros.membresias)      payload.membresias     = stats.membresias;
  if (filtros.servicios)       payload.servicios      = stats.servicios;
  if (filtros.medicinas)       payload.medicinas      = stats.medicinas;
  if (filtros.equipo)          payload.equipo         = stats.equipo;
  if (filtros.notificaciones)  payload.notificaciones = stats.notificaciones;

  const hasSections = [
    "pacientes","citas","visitas","membresias",
    "servicios","medicinas","equipo","notificaciones",
  ].some((k) => filtros[k]);

  if (!hasSections) {
    return { ...stats };
  }

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