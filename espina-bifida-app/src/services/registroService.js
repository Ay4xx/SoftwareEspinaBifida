const API_URL = "http://localhost:3001/api/registro";

export async function crearPacientePaso1(formData) {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const esInvitado = localStorage.getItem("guest") === "true";

  const body = {
    nombre:          formData.nombres,
    apellido:        formData.apellidoPaterno,
    genero:          formData.genero,
    fechaNacimiento: formData.fechaNacimiento,
    curp:            formData.curp,
    usuarioId:       esInvitado ? null : usuario?.id,
  };

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  // ✅ CURP duplicado
  if (response.status === 409) {
    const err = new Error(data.message || "Ya existe un paciente registrado con ese CURP.");
    err.code = "CURP_DUPLICADO";
    throw err;
  }

  if (!response.ok) throw new Error(data.message || "Error al registrar el paciente.");
  return data;
}

export async function actualizarPaso2(pacienteId, formData) {
  const body = {
    direccion:           formData.direccion,
    ciudad:              formData.ciudad,
    estado:              formData.estado,
    codigoPostal:        formData.codigoPostal,
    emergenciaContacto:  formData.emergenciaContacto,
    emergenciaTelefono:  formData.emergenciaTelefono,
    telefonoCasa:        formData.telefonoCasa,
    telefonoCelular:     formData.telefonoCelular,
    correo:              formData.correo,
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
    lugarNacimiento:    formData.lugarNacimiento,
    hospitalNacimiento: formData.hospitalNacimiento,
    tipoSangre:         formData.tipoSangre,
    usaValvula:         formData.usaValvula,
    notas:              formData.notas,
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
    tutorLugarNacimiento: formData.tutorLugarNacimiento,
    tutorEdad:            formData.tutorEdad,
    tutorOcupacion:       formData.tutorOcupacion,
    tutorEscolaridad:     formData.tutorEscolaridad,
    tutorParentesco:      formData.tutorParentesco,
    madreSeguroMedico:    formData.madreSeguroMedico,
    cdEmbarazo:           formData.cdEmbarazo,
    acidoFolico:          formData.acidoFolico,
    citasControl:         formData.citasControl,
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

export async function actualizarPaso5(pacienteId, foto) {
  const body = new FormData();
  body.append("foto", foto);
  const response = await fetch(`${API_URL}/${pacienteId}/paso5`, {
    method: "PUT",
    body,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Error al guardar la fotografía.");
  return data;
}