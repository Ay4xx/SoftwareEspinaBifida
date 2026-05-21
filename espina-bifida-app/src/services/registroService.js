const API_URL = "http://localhost:3001/api/registro";

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
    tutorLugarNacimiento: nullIfEmpty(formData.tutorLugarNacimiento),
    tutorEdad:            nullIfEmpty(formData.tutorEdad),
    tutorOcupacion:       nullIfEmpty(formData.tutorOcupacion),
    tutorEscolaridad:     nullIfEmpty(formData.tutorEscolaridad),
    tutorParentesco:      nullIfEmpty(formData.tutorParentesco),
    madreSeguroMedico:    nullIfEmpty(formData.madreSeguroMedico),
    cdEmbarazo:           nullIfEmpty(formData.cdEmbarazo),
    acidoFolico:          nullIfEmpty(formData.acidoFolico),
    citasControl:         nullIfEmpty(formData.citasControl),
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
  body.append("foto",      foto);
  body.append("usuarioId", esInvitado ? "" : usuario?.id || "");
  body.append("nombre",    formData?.nombres         || "");
  body.append("apellido",  formData?.apellidoPaterno || "");
  body.append("correo",    formData?.correo          || "");

  const response = await fetch(`${API_URL}/${pacienteId}/paso5`, {
    method: "PUT",
    body,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Error al guardar la fotografía.");
  return data;
}