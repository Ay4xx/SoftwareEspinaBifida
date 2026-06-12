// 1. IMPORTACIÓN OBLIGATORIA
import oracledb from "oracledb"; 
import "dotenv/config";

// 2. CONFIGURACIÓN DEL DRIVER (Es mejor hacerlo antes de exportar la función)
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// 3. FUNCIÓN DE CONEXIÓN
export async function getConnection() {
  try {
    return await oracledb.getConnection({
      user: process.env.DB_USER,
      connectString: process.env.DB_CONNECT_STRING,
      configDir: process.env.TNS_ADMIN,
      walletLocation: process.env.TNS_ADMIN,
      walletPassword: process.env.WALLET_PASSWORD
    });
  } catch (error) {
    console.error("Error al obtener la conexión:", error);
    throw error;
  }
}