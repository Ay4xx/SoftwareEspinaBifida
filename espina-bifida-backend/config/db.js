import oracledb from "oracledb";
import "dotenv/config";

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

export async function getConnection() {
  return await oracledb.getConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
    configDir: process.env.TNS_ADMIN,
    walletLocation: process.env.TNS_ADMIN,
     walletPassword: process.env.WALLET_PASSWORD
  });
}