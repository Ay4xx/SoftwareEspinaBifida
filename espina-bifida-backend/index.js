import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, ".env") });


const { default: app } = await import("./app.js"); 

app.listen(3001, () => {
  console.log("Servidor corriendo en http://localhost:3001");
});