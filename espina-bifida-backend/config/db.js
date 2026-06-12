export async function getConnection() {
  return await oracledb.getConnection({
    // El usuario debe ir aquí, pero NO la contraseña
    user: process.env.DB_USER, 
    
    // Esto es lo que define que usas Wallet
    connectString: process.env.DB_CONNECT_STRING,
    configDir: process.env.TNS_ADMIN,
    walletLocation: process.env.TNS_ADMIN,
    walletPassword: process.env.WALLET_PASSWORD
    
    // NOTA: No ponemos 'password' aquí. 
    // El driver tomará el usuario de 'user' y la contraseña del Wallet.
  });
}