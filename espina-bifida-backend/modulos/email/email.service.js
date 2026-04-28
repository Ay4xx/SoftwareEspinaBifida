import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function enviarCorreoPreRegistro({ nombre, apellido, correo }) {
  if (!correo) return;
  await transporter.sendMail({
    from: `"Asociación Espina Bífida" <${process.env.MAIL_USER}>`,
    to: correo,
    subject: "Solicitud de registro recibida",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Solicitud de registro recibida</h2>
        <p>Estimado/a <strong>${nombre} ${apellido}</strong>,</p>
        <p>
          Hemos recibido su solicitud de registro como paciente en la
          <strong>Asociación Espina Bífida</strong>.
        </p>
        <p>
          Su solicitud está siendo revisada por nuestro equipo.
          En cuanto sea procesada, le notificaremos el resultado por este medio.
        </p>
        <p>Gracias por su confianza.</p>
        <br />
        <p style="color: #6b7280; font-size: 14px;">
          Este correo fue generado automáticamente, por favor no responda a este mensaje.
        </p>
      </div>
    `,
  });
}

export async function enviarCorreoAprobacion({ nombre, apellido, correo }) {
  if (!correo) return;
  await transporter.sendMail({
    from: `"Asociación Espina Bífida" <${process.env.MAIL_USER}>`,
    to: correo,
    subject: "Solicitud de registro aprobada",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">¡Solicitud de registro aprobada!</h2>
        <p>Estimado/a <strong>${nombre} ${apellido}</strong>,</p>
        <p>
          Nos complace informarle que su solicitud de registro como paciente
          ha sido <strong>aprobada</strong> exitosamente.
        </p>
        <p>
          Ya forma parte de nuestro sistema y puede acudir a nuestras instalaciones
          para recibir atención médica.
        </p>
        <p>Bienvenido/a a la Asociación Espina Bífida.</p>
        <br />
        <p style="color: #6b7280; font-size: 14px;">
          Este correo fue generado automáticamente, por favor no responda a este mensaje.
        </p>
      </div>
    `,
  });
}

export async function enviarCorreoRechazo({ nombre, apellido, correo }) {
  if (!correo) return;
  await transporter.sendMail({
    from: `"Asociación Espina Bífida" <${process.env.MAIL_USER}>`,
    to: correo,
    subject: "Solicitud de registro rechazada",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Solicitud de registro rechazada</h2>
        <p>Estimado/a <strong>${nombre} ${apellido}</strong>,</p>
        <p>
          Lamentamos informarle que su solicitud de registro como paciente
          ha sido <strong>rechazada</strong> debido a datos incorrectos o faltantes
          en su expediente.
        </p>
        <p>
          Es necesario que acuda <strong>presencialmente</strong> a nuestras instalaciones
          para poder completar y verificar su información correctamente.
        </p>
        <p>Le pedimos disculpas por los inconvenientes ocasionados.</p>
        <br />
        <p style="color: #6b7280; font-size: 14px;">
          Este correo fue generado automáticamente, por favor no responda a este mensaje.
        </p>
      </div>
    `,
  });
}

export async function enviarCorreoAltaManual({ nombre, apellido, correo }) {
  if (!correo) return;
  await transporter.sendMail({
    from: `"Asociación Espina Bífida" <${process.env.MAIL_USER}>`,
    to: correo,
    subject: "Bienvenido a la Asociación Espina Bífida",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">¡Bienvenido/a!</h2>
        <p>Estimado/a <strong>${nombre} ${apellido}</strong>,</p>
        <p>
          Nos complace informarle que ha sido dado/a de alta como paciente en la
          <strong>Asociación Espina Bífida</strong>.
        </p>
        <p>
          Ya forma parte de nuestro sistema y puede acudir a nuestras instalaciones
          para recibir atención médica.
        </p>
        <br />
        <p style="color: #6b7280; font-size: 14px;">
          Este correo fue generado automáticamente, por favor no responda a este mensaje.
        </p>
      </div>
    `,
  });
} 