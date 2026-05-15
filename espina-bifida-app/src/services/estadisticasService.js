export async function getEstadisticas() {

  const response = await fetch(
    "http://localhost:3001/api/estadisticas"
  );

  if (!response.ok) {
    throw new Error(
      "Error al obtener las estadísticas"
    );
  }

  const result = await response.json();

  if (!result.ok) {
    throw new Error(
      result.message ||
      "Error en la respuesta del servidor"
    );
  }

  return result.data;
}

export async function descargarReporteMensual(
  filtros
) {

  const response = await fetch(
    "http://localhost:3001/api/estadisticas/reporte",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(filtros),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Error al descargar el reporte"
    );
  }

  if (
  filtros.tipoArchivo === "csv" ||
  filtros.tipoArchivo === "excel" ||
  filtros.tipoArchivo === "pdf"
) {

    const blob = await response.blob();

    const url =
      window.URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = url;

    if (filtros.tipoArchivo === "csv") {
      a.download = "reporte_mensual.csv";
    }

    if (filtros.tipoArchivo === "excel") {
      a.download = "reporte_mensual.xlsx";
    }

    if (filtros.tipoArchivo === "pdf") {
      a.download = "reporte_mensual.pdf";
    }

    document.body.appendChild(a);

    a.click();

    a.remove();

    window.URL.revokeObjectURL(url);

    return;
  }

  const result = await response.json();

  if (!result.ok) {
    throw new Error(
      result.message ||
      "Error en la respuesta del servidor"
    );
  }

  return result.data;
}