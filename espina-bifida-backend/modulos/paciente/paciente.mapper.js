export function mapPacienteToCard(row) {
  const nombre = row.NOMBRE || "Sin nombre";

  const initials = nombre
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

  return {
    id: row.PACIENTE_ID,
    initials,
    name: nombre,
    subtitle: "Paciente registrado",
    status:
      row.VIVE && row.VIVE.toUpperCase() === "SI"
        ? "Activo"
        : "Inactivo",
    location: [row.CIUDAD_RESIDENCIA, row.ESTADO_RESIDENCIA]
      .filter(Boolean)
      .join(", "),
    etapaVida: row.ETAPA_VIDA || "Sin etapa",
    ultimaVisita: row.FECHA_ULTIMA_VISITA || null,
  };
}