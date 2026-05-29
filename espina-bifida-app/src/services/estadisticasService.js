export async function getEstadisticas() {
  const response = await fetch(
    "http://localhost:3001/api/estadisticas"
  );

  if (!response.ok) {
    throw new Error("Error al obtener las estadísticas");
  }

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.message || "Error en la respuesta del servidor");
  }

  return result.data;
}

export async function descargarReporteMensual(filtros) {
  const response = await fetch(
    "http://localhost:3001/api/estadisticas/reporte",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(filtros),
    }
  );

  if (!response.ok) {
    throw new Error("Error al descargar el reporte");
  }

  // Solo retorna el blob — el modal se encarga de la descarga
  return response.blob();
}