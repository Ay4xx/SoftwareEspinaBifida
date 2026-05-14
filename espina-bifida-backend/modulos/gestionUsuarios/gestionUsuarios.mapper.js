export function mapUsuario(row) {
    return {
        id:            row.USUARIO_ID,
        nombre:        row.NOMBRE,
        username:      row.USERNAME,
        tipoUsuario:   row.TIPO_USUARIO,
        fechaRegistro: row.FECHA_REGISTRO,
    };
}