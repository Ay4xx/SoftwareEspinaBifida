export function mapPacienteLogin(row) {
  return {
    id:          row.USUARIO_ID,
    username:    row.USERNAME,
    tipoUsuario: row.TIPO_USUARIO,
    nombre:      row.NOMBRE   || null,
    foto:        row.FOTO     || null,
  };
}