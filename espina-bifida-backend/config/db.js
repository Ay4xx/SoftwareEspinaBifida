import oracledb from "oracledb"; 
import "dotenv/config";

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

// IMPORTANTE: Definimos la ruta explícitamente por si la variable de entorno falla
const walletDir = process.env.TNS_ADMIN;

export async function getConnection() {
  try {
    return await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD, // Volvemos a incluirla aquí
      connectString: process.env.DB_CONNECT_STRING,
      configDir: walletDir,
      walletLocation: walletDir,
      walletPassword: process.env.WALLET_PASSWORD
    });
  } catch (error) {
    console.error("Detalles del error de conexión:", error.message);
    throw error;
  }
}