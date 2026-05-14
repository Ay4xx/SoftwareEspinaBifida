export async function getEstadisticas() {
  const response = await fetch("http://localhost:3001/api/estadisticas");

  if (!response.ok) {
    throw new Error("Error al obtener las estadísticas");
  }

  const result = await response.json();

  if (!result.ok) {
    throw new Error(result.message || "Error en la respuesta del servidor");
  }

  return result.data;
}