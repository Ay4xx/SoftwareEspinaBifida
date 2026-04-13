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
    folio: row.PACIENTE_ID.toString().padStart(3, '0'),
    initials,
    foto: row.FOTOGRAFIA || null,
    name: nombre,
    subtitle: "Paciente registrado",
    status:
      row.ESTATUS_MEMBRESIA && row.ESTATUS_MEMBRESIA.toLowerCase() === 'activa'
        ? "Activo"
        : "Inactivo",
    location: [row.CIUDAD_RESIDENCIA, row.ESTADO_RESIDENCIA]
      .filter(Boolean)
      .join(", "),
    totalConsultas: row.TOTAL_CONSULTAS || 0,
    ultimaVisita: row.FECHA_ULTIMA_VISITA || null,
  };
}