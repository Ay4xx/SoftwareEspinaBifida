// Archivo nuevo — funciones de validación reutilizables

const ESTADOS_CURP = [
  "AS","BC","BS","CC","CL","CM","CS","CH","DF","DG",
  "GT","GR","HG","JC","MC","MN","MS","NT","NL","OC",
  "PL","QT","QR","SP","SL","SR","TC","TS","TL","VZ",
  "YN","ZS","NE",
];

const REGEX_CURP = new RegExp(
  `^[A-Z][AEIOU][A-Z]{2}` +
  `\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])` +
  `[HMX]` +
  `(${ESTADOS_CURP.join("|")})` +
  `[B-DF-HJ-NP-TV-Z]{3}` +
  `[0-9A-Z]\\d$`
);

/**
 * Valida el formato de una CURP mexicana.
 * @param {string} curp
 * @returns {string|null} Mensaje de error, o null si es válida.
 */
export function validarCURP(curp) {
  if (!curp) return null;
  if (curp.length !== 18) return "La CURP debe tener exactamente 18 caracteres.";
  if (!REGEX_CURP.test(curp)) return "El formato de la CURP no es válido.";
  return null;
}
