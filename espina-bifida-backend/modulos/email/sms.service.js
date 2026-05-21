import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const sns = new SNSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

function limpiarYValidarTelefono(numero) {
  if (!numero) return null;

  // Elimina espacios, guiones, paréntesis y cualquier caracter no numérico
  const limpio = numero.replace(/\D/g, "");

  if (limpio.length !== 10) {
    console.warn(`[SMS] Número inválido, se omite el envío: "${numero}" (${limpio.length} dígitos)`);
    return null;
  }

  return `+52${limpio}`;
}

export async function enviarSMS(numero, mensaje) {
  const numeroFormateado = limpiarYValidarTelefono(numero);
  if (!numeroFormateado) return; 

  try {
    const command = new PublishCommand({
      Message: mensaje,
      PhoneNumber: numeroFormateado,
      MessageAttributes: {
        "AWS.SNS.SMS.SMSType": {
          DataType: "String",
          StringValue: "Transactional",
        },
      },
    });

    const response = await sns.send(command);
    console.log(`[SMS] Enviado a ${numeroFormateado} | MessageId: ${response.MessageId}`);
  } catch (error) {
    
    console.error("[SMS] Error al enviar:", error.message);
  }
}