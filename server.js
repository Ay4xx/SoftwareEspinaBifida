process.env.TNS_ADMIN = "C:\\Users\\Fiorellaa\\Downloads\\Wallet_EspinaBifida";

const express = require("express");
const oracledb = require("oracledb");
const cors = require("cors");

oracledb.initOracleClient({ 
  libDir: "C:\\Users\\Fiorellaa\\Downloads\\instantclient-basic-windows.x64-23.26.1.0.0\\instantclient_23_0" 
});

const app = express();
app.use(cors());
app.use(express.json());

const config = {
  user: "GUEST",
  password: "Gu3st123$5&&",
  connectString: "espinabifida_high",
};

async function getConnection() {
  return await oracledb.getConnection(config);
}

app.get("/test", async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    res.json({ ok: true, mensaje: "Conexión exitosa a Oracle" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

app.get("/api/medicos", async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT MEDICO_ID, NOMBRE, APELLIDO, ESPECIALIDAD FROM MEDICO`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

app.get("/api/servicios/:medicoId", async (req, res) => {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(
      `SELECT SERVICIO_ID, NOMBRE_SERVICIO, DESCRIPCION, COSTO
       FROM SERVICIO
       WHERE MEDICO_ID = :medicoId`,
      { medicoId: parseInt(req.params.medicoId) },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) await conn.close();
  }
});

app.listen(4000, () => console.log("Servidor corriendo en http://localhost:4000"));