import bcrypt from "bcrypt";
const hash = await bcrypt.hash("Espina1234", 10);
console.log(hash);