export function mapPacienteToCard(row) {
  const nombre = row.NOMBRE || "";
  const apellido = row.APELLIDO || "";
  const nombreCompleto = [nombre, apellido].filter(Boolean).join(" ").trim() || "Sin nombre";

  const initials = nombreCompleto
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join("");

  return {
    id: row.PACIENTE_ID,
    folio: row.PACIENTE_ID.toString().padStart(3, "0"),
    initials,
    foto: row.FOTOGRAFIA ? `/api/pacientes/${row.PACIENTE_ID}/foto` : null,
    name: nombreCompleto,
    nombre,
    apellido,
    curp: row.CURP || "Sin CURP",
    subtitle: row.CURP || "Sin CURP",
    status:
      row.ESTATUS_MEMBRESIA && row.ESTATUS_MEMBRESIA.toLowerCase() === "activo"
        ? "Activo"
        : "Inactivo",
    location: [row.CIUDAD_RESIDENCIA, row.ESTADO_RESIDENCIA]
      .filter(Boolean)
      .join(", "),
    totalConsultas: row.TOTAL_CONSULTAS || 0,
    ultimaVisita: row.FECHA_ULTIMA_VISITA || null,
    fechaNacimiento: row.FECHA_NACIMIENTO || null,
    etapaVida: row.ETAPA_VIDA || "Sin especificar",
  };
}