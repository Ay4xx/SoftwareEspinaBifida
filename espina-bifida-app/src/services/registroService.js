const API_URL      = "http://localhost:3001/api/registro";
const PACIENTES_URL = "http://localhost:3001/api/pacientes";

function nullIfEmpty(val) {
  if (val === undefined || val === null || val === "") return null;
  return val;
}

export async function crearPacientePaso1(formData) {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const esInvitado = localStorage.getItem("guest") === "true";

  const body = {
    nombre:          nullIfEmpty(formData.nombres),
    apellido:        nullIfEmpty(formData.apellidoPaterno),
    genero:          nullIfEmpty(formData.genero),
    fechaNacimiento: nullIfEmpty(formData.fechaNacimiento),
    curp:            formData.curp,
    usuarioId:       esInvitado ? null : usuario?.id,
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (response.status === 409) {
    const err = new Error(data.message || "Ya existe un paciente registrado con ese CURP.");
    err.code = "CURP_DUPLICADO";
    throw err;
  }

  if (!response.ok) throw new Error(data.message || "Error al registrar el paciente.");
  return data;
}

export async function actualizarPaso2(pacienteId, formData) {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const esInvitado = localStorage.getItem("guest") === "true";

  const body = {
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
  };

  const response = await fetch(`${API_URL}/${pacienteId}/paso2`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Error al guardar contacto.");
  return data;
}

export async function actualizarPaso3(pacienteId, formData) {
  const body = {
    lugarNacimiento:    nullIfEmpty(formData.lugarNacimiento),
    hospitalNacimiento: nullIfEmpty(formData.hospitalNacimiento),
    tipoSangre:         nullIfEmpty(formData.tipoSangre),
    usaValvula:         nullIfEmpty(formData.usaValvula),
    notas:              nullIfEmpty(formData.notas),
    tipoEspinaBifida:   nullIfEmpty(formData.tipoEspinaBifida),
    otrosPadecimiento:  nullIfEmpty(formData.otrosPadecimiento),
  };
  const response = await fetch(`${API_URL}/${pacienteId}/paso3`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Error al guardar historial médico.");
  return data;
}

export async function actualizarPaso4(pacienteId, formData) {
  const body = {
    tutorParentesco:        nullIfEmpty(formData.tutorParentesco),
    tutorNombre:            nullIfEmpty(formData.tutorNombre),         // ← CORREGIDO
    tutorLugarNacimiento:   nullIfEmpty(formData.tutorLugarNacimiento),
    tutorEdad:              nullIfEmpty(formData.tutorEdad),
    tutorOcupacion:         nullIfEmpty(formData.tutorOcupacion),
    tutorEscolaridad:       nullIfEmpty(formData.tutorEscolaridad),
    tutorSeguroMedico:      nullIfEmpty(formData.tutorSeguroMedico),
    madreSeguroMedico:      nullIfEmpty(formData.madreSeguroMedico),
    cdEmbarazo:             nullIfEmpty(formData.cdEmbarazo),
    acidoFolico:            nullIfEmpty(formData.acidoFolico),
    citasControl:           nullIfEmpty(formData.citasControl),
    adicciones:             nullIfEmpty(formData.adicciones),          // ← CORREGIDO
    hijoDtn:                nullIfEmpty(formData.hijoDtn),             // ← CORREGIDO
    familiarDtn:            nullIfEmpty(formData.familiarDtn),         // ← CORREGIDO
    expoToxicos:            nullIfEmpty(formData.expoToxicos),         // ← CORREGIDO
    descripcionExpoToxicos: nullIfEmpty(formData.descripcionExpoToxicos), // ← CORREGIDO
  };
  const response = await fetch(`${API_URL}/${pacienteId}/paso4`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Error al guardar historial del tutor.");
  return data;
}

export async function actualizarPaso5(pacienteId, foto, formData) {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const esInvitado = localStorage.getItem("guest") === "true";

  const body = new FormData();
  if (foto instanceof File) body.append("foto", foto);
  body.append("usuarioId", esInvitado ? "" : usuario?.id || "");
  body.append("nombre",    formData?.nombres         || "");
  body.append("apellido",  formData?.apellidoPaterno || "");
  body.append("correo",    formData?.correo          || "");

  const documentos = formData?.documentos || {};
  if (documentos.preregistro          instanceof File) body.append("docPreregistro",          documentos.preregistro);
  if (documentos.actaNacimiento       instanceof File) body.append("docActaNacimiento",       documentos.actaNacimiento);
  if (documentos.curp                 instanceof File) body.append("docCurp",                 documentos.curp);
  if (documentos.comprobanteDomicilio instanceof File) body.append("docComprobanteDomicilio", documentos.comprobanteDomicilio);
  if (documentos.ineFamilia           instanceof File) body.append("docIneFamilia",           documentos.ineFamilia);

  const response = await fetch(`${API_URL}/${pacienteId}/paso5`, {
    method: "PUT",
    body,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Error al guardar la fotografía.");
  return data;
}

export async function actualizarPaciente(pacienteId, formData, tutores) {
  const body = new FormData();
  body.append("nombre",             formData.nombres || "");
  body.append("apellido",           formData.apellidoPaterno || "");
  body.append("genero",             formData.genero || "");
  body.append("fechaNacimiento",    formData.fechaNacimiento || "");
  body.append("curp",               formData.curp || "");
  body.append("direccion",          formData.direccion || "");
  body.append("ciudad",             formData.ciudad || "");
  body.append("estado",             formData.estado || "");
  body.append("codigoPostal",       formData.codigoPostal || "");
  body.append("telefonoCasa",       formData.telefonoCasa || "");
  body.append("telefonoCelular",    formData.telefonoCelular || "");
  body.append("correo",             formData.correo || "");
  body.append("emergenciaContacto", formData.emergenciaContacto || "");
  body.append("emergenciaTelefono", formData.emergenciaTelefono || "");
  body.append("lugarNacimiento",    formData.lugarNacimiento || "");
  body.append("hospitalNacimiento", formData.hospitalNacimiento || "");
  body.append("tipoSangre",         formData.tipoSangre || "");
  body.append("usaValvula",         formData.usaValvula || "");
  body.append("notas",              formData.notas || "");
  body.append("tipoEspinaBifida",   formData.tipoEspinaBifida || "");
  body.append("otrosPadecimiento",  formData.otrosPadecimiento || "");
  body.append("tutores",            JSON.stringify(tutores));
  if (formData.foto instanceof File) body.append("foto", formData.foto);

  const response = await fetch(`${PACIENTES_URL}/${pacienteId}`, {
    method: "PUT",
    body,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Error al guardar cambios.");
  return data;
}