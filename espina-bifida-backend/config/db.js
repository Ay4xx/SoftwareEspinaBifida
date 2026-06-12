import oracledb from "oracledb";
import "dotenv/config";

// Configuración global necesaria para Thin mode
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

export async function getConnection() {
  try {
    return await oracledb.getConnection({
      // Con el Wallet, el usuario y la contraseña están guardados dentro del archivo cwallet.sso
      // Por lo tanto, no es estrictamente necesario pasarlos aquí si el wallet está bien configurado.
      connectString: process.env.DB_CONNECT_STRING,
      configDir: process.env.TNS_ADMIN,
      walletLocation: process.env.TNS_ADMIN,
      walletPassword: process.env.WALLET_PASSWORD
    });
  } catch (err) {
    console.error("Error al conectar a la BD:", err);
    throw err;
  }
}