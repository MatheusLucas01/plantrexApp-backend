const nodemailer = require('nodemailer');

const EMAIL_CONFIGURED = process.env.EMAIL_USER && process.env.EMAIL_PASS;

let transporter = null;
if (EMAIL_CONFIGURED) {
    transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // STARTTLS
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS.replace(/\s/g, ''), // remove espaços do App Password
        },
    });
}

/**
 * Envia código de verificação por e-mail.
 * @param {string} email - Destinatário
 * @param {string} codigo - Código de 6 dígitos
 * @param {string} tipo - "cadastro" | "redefinicao"
 */
const enviarCodigoEmail = async (email, codigo, tipo = 'cadastro') => {
    const assunto = tipo === 'redefinicao'
        ? 'Plantrex — Redefinição de senha'
        : 'Plantrex — Confirme seu cadastro';

    const mensagem = tipo === 'redefinicao'
        ? `Seu código para redefinir a senha é:`
        : `Seu código de verificação para concluir o cadastro é:`;

    if (!EMAIL_CONFIGURED) {
        console.log(`\n[EMAIL DEV] Para: ${email} | ${assunto} | Código: ${codigo}\n`);
        return;
    }

    await transporter.sendMail({
        from: `"Plantrex" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: assunto,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 24px; background: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #00875F; margin-bottom: 8px;">Plantrex</h2>
            <p style="color: #374151;">${mensagem}</p>
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #00875F; text-align: center; padding: 20px 0;">
                ${codigo}
            </div>
            <p style="color: #9CA3AF; font-size: 13px;">Válido por 10 minutos. Não compartilhe este código.</p>
        </div>`,
    });
};

module.exports = { enviarCodigoEmail };
