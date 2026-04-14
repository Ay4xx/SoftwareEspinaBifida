export function mapPacienteLogin(row) {
  return {
    id: row.USUARIO_ID,
    username: row.USERNAME
  };
}