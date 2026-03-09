/**
 * Serviço de SMS via Twilio.
 * Se as variáveis de ambiente do Twilio não estiverem configuradas,
 * o código é exibido no console (útil para desenvolvimento).
 */

const twilio = require('twilio');

const TWILIO_CONFIGURED =
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER;

let client = null;
if (TWILIO_CONFIGURED) {
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

/**
 * Envia um código de verificação por SMS.
 * @param {string} telefone - Número de destino (somente dígitos, ex: "62999887766")
 * @param {string} codigo - Código de 6 dígitos
 */
const enviarCodigoSms = async (telefone, codigo) => {
    const mensagem = `Plantrex: Seu código de verificação é ${codigo}. Válido por 10 minutos. Não compartilhe este código.`;

    if (!TWILIO_CONFIGURED) {
        console.log(`\n[SMS DEV] Para: +55${telefone} | Código: ${codigo}\n`);
        return;
    }

    await client.messages.create({
        body: mensagem,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: `+55${telefone}`,
    });
};

module.exports = { enviarCodigoSms };
