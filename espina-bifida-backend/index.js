import 'dotenv/config';
import express from 'express';
import oracledb from 'oracledb';

const app = express();
app.use(express.json());

app.get('/test', async (req, res) => {
  let conn;
  try {
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING,   // alias exacto del tnsnames.ora
      configDir: process.env.TNS_ADMIN,               // carpeta donde está tnsnames.ora
      walletLocation: process.env.TNS_ADMIN,          // carpeta donde está ewallet.pem
      walletPassword: process.env.WALLET_PASSWORD     // password del wallet, no el de ADMIN
    });

    const result = await conn.execute(
      `select 'OK' as status, sysdate as fecha from dual`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    res.json(result.rows[0]);
  } catch (e) {
    console.error('Error directo Oracle:', e);
    res.status(500).json({
      message: e.message,
      stack: e.stack
    });
  } finally {
    if (conn) await conn.close();
  }
});

app.listen(3000, () => {
  console.log('http://localhost:3000');
});