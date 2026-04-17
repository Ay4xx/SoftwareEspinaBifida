export function mapNotificacionToCard(row) {
  const nombre = row.NOMBRE || "Sin nombre";

  return {
    id: row.NOTIFICACION_ID,
    pacienteId: row.PACIENTE_ID,
    usuarioId: row.USUARIO_ID,
    titulo: row.TITULO || "Notificación",
    mensaje: row.MENSAJE || "",
    estado: row.ESTADO_PROCESO || "pendiente",
    fechaCreacion: row.FECHA_CREACION || null,

    paciente: {
      nombre,
      curp: row.CURP || "",
      ubicacion: [row.CIUDAD_RESIDENCIA, row.ESTADO_RESIDENCIA]
        .filter(Boolean)
        .join(", "),
      telefono: row.TELEFONO_CELULAR || row.TELEFONO_CASA || "",
      foto: row.PACIENTE_ID ? `http://localhost:3001/api/pacientes/${row.PACIENTE_ID}/foto` : null,
    },
  };
}