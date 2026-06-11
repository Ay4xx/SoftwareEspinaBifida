import API_BASE from "../config.js"; // ajusta la ruta según dónde esté

const API_URL = `${API_BASE}/api/registro`;
const PACIENTES_URL = `${API_BASE}/api/pacientes`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function nullIfEmpty(val) {
  if (val === undefined || val === null || val === "") return null;
  return val;
}

function getUsuarioLocal() {
  const usuario  = JSON.parse(localStorage.getItem("usuario") || "null");
  const esInvitado = localStorage.getItem("guest") === "true";
  return { usuario, esInvitado };
}

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (response.status === 409) {
    const err = new Error(data.message || "Ya existe un paciente registrado con ese CURP.");
    err.code = "CURP_DUPLICADO";
    throw err;
  }
  if (!response.ok) throw new Error(data.message || "Error en la solicitud.");
  return data;
}

function appendDocumentos(body, documentos = {}) {
  const campos = [
    ["preregistro",          "docPreregistro"],
    ["actaNacimiento",       "docActaNacimiento"],
    ["curp",                 "docCurp"],
    ["comprobanteDomicilio", "docComprobanteDomicilio"],
    ["ineFamilia",           "docIneFamilia"],
  ];
  campos.forEach(([key, fieldName]) => {
    if (documentos[key] instanceof File) body.append(fieldName, documentos[key]);
  });
}

// ── Servicios públicos ────────────────────────────────────────────────────────

export async function crearPacientePaso1(formData) {
  const { usuario, esInvitado } = getUsuarioLocal();

  return fetchJSON(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre:          nullIfEmpty(formData.nombres),
      apellido:        nullIfEmpty(formData.apellidoPaterno),
      genero:          nullIfEmpty(formData.genero),
      fechaNacimiento: nullIfEmpty(formData.fechaNacimiento),
      curp:            formData.curp,
      usuarioId:       esInvitado ? null : usuario?.id,
    }),
  });
}

export async function actualizarPaso2(pacienteId, formData) {
  const { usuario, esInvitado } = getUsuarioLocal();

  return fetchJSON(`${API_URL}/${pacienteId}/paso2`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      direccion:          nullIfEmpty(formData.direccion),
      ciudad:             nullIfEmpty(formData.ciudad),
      estado:             nullIfEmpty(formData.estado),
      codigoPostal:       nullIfEmpty(formData.codigoPostal),
      emergenciaContacto: nullIfEmpty(formData.emergenciaContacto),
      emergenciaTelefono: nullIfEmpty(formData.emergenciaTelefono),
      telefonoCasa:       nullIfEmpty(formData.telefonoCasa),
      telefonoCelular:    nullIfEmpty(formData.telefonoCelular),
      correo:             nullIfEmpty(formData.correo),
      usuarioId:          esInvitado ? null : usuario?.id,
      nombre:             nullIfEmpty(formData.nombres),
      apellido:           nullIfEmpty(formData.apellidoPaterno),
    }),
  });
}

export async function actualizarPaso3(pacienteId, formData) {
  return fetchJSON(`${API_URL}/${pacienteId}/paso3`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      lugarNacimiento:    nullIfEmpty(formData.lugarNacimiento),
      hospitalNacimiento: nullIfEmpty(formData.hospitalNacimiento),
      tipoSangre:         nullIfEmpty(formData.tipoSangre),
      usaValvula:         nullIfEmpty(formData.usaValvula),
      notas:              nullIfEmpty(formData.notas),
      tipoEspinaBifida:   nullIfEmpty(formData.tipoEspinaBifida),
      otrosPadecimiento:  nullIfEmpty(formData.otrosPadecimiento),
    }),
  });
}

export async function actualizarPaso4(pacienteId, formData) {
  return fetchJSON(`${API_URL}/${pacienteId}/paso4`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      tutorParentesco:        nullIfEmpty(formData.tutorParentesco),
      tutorNombre:            nullIfEmpty(formData.tutorNombre),
      tutorLugarNacimiento:   nullIfEmpty(formData.tutorLugarNacimiento),
      tutorEdad:              nullIfEmpty(formData.tutorEdad),
      tutorOcupacion:         nullIfEmpty(formData.tutorOcupacion),
      tutorEscolaridad:       nullIfEmpty(formData.tutorEscolaridad),
      tutorSeguroMedico:      nullIfEmpty(formData.tutorSeguroMedico),
      madreSeguroMedico:      nullIfEmpty(formData.madreSeguroMedico),
      cdEmbarazo:             nullIfEmpty(formData.cdEmbarazo),
      acidoFolico:            nullIfEmpty(formData.acidoFolico),
      citasControl:           nullIfEmpty(formData.citasControl),
      adicciones:             nullIfEmpty(formData.adicciones),
      hijoDtn:                nullIfEmpty(formData.hijoDtn),
      familiarDtn:            nullIfEmpty(formData.familiarDtn),
      expoToxicos:            nullIfEmpty(formData.expoToxicos),
      descripcionExpoToxicos: nullIfEmpty(formData.descripcionExpoToxicos),
    }),
  });
}

export async function actualizarPaso5(pacienteId, foto, formData) {
  const { usuario, esInvitado } = getUsuarioLocal();

  const body = new FormData();
  if (foto instanceof File) body.append("foto", foto);
  body.append("usuarioId", esInvitado ? "" : usuario?.id || "");
  body.append("nombre",    formData?.nombres         || "");
  body.append("apellido",  formData?.apellidoPaterno || "");
  body.append("correo",    formData?.correo          || "");
  appendDocumentos(body, formData?.documentos);

  return fetchJSON(`${API_URL}/${pacienteId}/paso5`, { method: "PUT", body });
}

export async function actualizarPaciente(pacienteId, formData, tutores) {
  const body = new FormData();
  const campos = [
    ["nombre",             formData.nombres],
    ["apellido",           formData.apellidoPaterno],
    ["genero",             formData.genero],
    ["fechaNacimiento",    formData.fechaNacimiento],
    ["curp",               formData.curp],
    ["direccion",          formData.direccion],
    ["ciudad",             formData.ciudad],
    ["estado",             formData.estado],
    ["codigoPostal",       formData.codigoPostal],
    ["telefonoCasa",       formData.telefonoCasa],
    ["telefonoCelular",    formData.telefonoCelular],
    ["correo",             formData.correo],
    ["emergenciaContacto", formData.emergenciaContacto],
    ["emergenciaTelefono", formData.emergenciaTelefono],
    ["lugarNacimiento",    formData.lugarNacimiento],
    ["hospitalNacimiento", formData.hospitalNacimiento],
    ["tipoSangre",         formData.tipoSangre],
    ["usaValvula",         formData.usaValvula],
    ["notas",              formData.notas],
    ["tipoEspinaBifida",   formData.tipoEspinaBifida],
    ["otrosPadecimiento",  formData.otrosPadecimiento],
  ];
  campos.forEach(([key, val]) => body.append(key, val || ""));
  body.append("tutores", JSON.stringify(tutores));
  if (formData.foto instanceof File) body.append("foto", formData.foto);

  return fetchJSON(`${PACIENTES_URL}/${pacienteId}`, { method: "PUT", body });
}
