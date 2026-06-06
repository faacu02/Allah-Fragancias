import nodemailer from 'nodemailer';
import { env } from './env';

const escapeHtml = (str: string) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendWelcomeEmail = async (toEmail: string, userName: string) => {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    console.warn("Correo no enviado: Credenciales SMTP faltantes");
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"Allah Fragancias" <${env.SMTP_USER}>`,
      to: toEmail,
      subject: 'Bienvenido a Allah Fragancias',
      html: `
        <div style="background-color: #0d0d0d; margin: 0; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff;">
          <div style="max-width: 500px; margin: 0 auto; border: 1px solid rgba(212, 175, 55, 0.3); background-color: #000000; padding: 40px;">
            <div style="text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.1); padding-bottom: 30px; margin-bottom: 40px;">
              <h1 style="color: #d4af37; font-family: serif; letter-spacing: 4px; text-transform: uppercase; margin: 0; font-size: 24px;">
                Allah Fragancias
              </h1>
              <p style="color: #666; font-size: 10px; letter-spacing: 5px; text-transform: uppercase; margin-top: 10px;">Luxurious Collection</p>
            </div>
            <h2 style="font-family: serif; color: #fff; font-size: 22px; margin-bottom: 15px;">Bienvenido/a ${escapeHtml(userName)},</h2>
            <p style="color: #aaaaaa; font-size: 14px; line-height: 1.6; letter-spacing: 0.5px;">
              Te has unido al círculo exclusivo de Allah Fragancias. Ahora podés explorar nuestra colección de esencias del desierto y realizar tus pedidos.
            </p>
            <div style="text-align: center; margin: 40px 0;">
              <a href="${env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}" style="background-color: #d4af37; color: #000; padding: 14px 32px; text-decoration: none; font-weight: bold; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; display: inline-block;">
                Explorar Colección
              </a>
            </div>
            <div style="text-align: center; margin-top: 50px; padding-top: 30px; border-top: 1px solid rgba(212, 175, 55, 0.1);">
              <p style="color: #444; font-size: 12px; line-height: 1.5;">
                Gracias por elegir la exclusividad.<br>
                Allah Fragancias
              </p>
            </div>
          </div>
        </div>
      `
    });
    console.log("Correo de bienvenida enviado a:", toEmail);
    return true;
  } catch (err) {
    console.error("Error enviando correo de bienvenida:", err);
    return false;
  }
};

export const sendPasswordResetEmail = async (toEmail: string, token: string) => {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    console.warn("Correo no enviado: Credenciales SMTP faltantes");
    return false;
  }

  const baseUrl = env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/#reset-token=${token}`;

  try {
    await transporter.sendMail({
      from: `"Allah Fragancias" <${env.SMTP_USER}>`,
      to: toEmail,
      subject: 'Allah Fragancias - Restablecer Contraseña',
      html: `
        <div style="background-color: #0d0d0d; padding: 40px 20px; font-family: sans-serif; color: #fff;">
          <div style="max-width: 500px; margin: 0 auto; border: 1px solid rgba(212, 175, 55, 0.3); background-color: #000; padding: 40px;">
            <h1 style="color: #d4af37; font-family: serif; text-align: center; letter-spacing: 4px; text-transform: uppercase; font-size: 20px; margin-bottom: 30px;">
              Allah Fragancias
            </h1>
            <p style="color: #aaa; font-size: 14px; line-height: 1.6;">Recibiste este correo porque solicitaste restablecer tu contraseña.</p>
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetUrl}" style="background-color: #d4af37; color: #000; padding: 14px 32px; text-decoration: none; font-weight: bold; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; display: inline-block;">
                Restablecer Contraseña
              </a>
            </div>
            <p style="color: #666; font-size: 12px;">Si no solicitaste esto, ignorá este correo. El enlace expira en 1 hora.</p>
          </div>
        </div>
      `
    });
    console.log("Correo de restablecimiento enviado a:", toEmail);
    return true;
  } catch (err) {
    console.error("Error enviando correo de restablecimiento:", err);
    return false;
  }
};

interface OrderContext {
  orderId: string;
  userName: string;
  phone?: string;
  total: number;
  paymentMethod: string;
  items: Array<{ title: string; quantity: number; price: number }>;
}

export const sendOrderEmail = async (toEmail: string, context: OrderContext, isPaid: boolean = false) => {
  if (!env.SMTP_USER || !env.SMTP_PASS) {
      console.warn("Correo no enviado: Credenciales SMTP faltantes en .env");
      return false;
  }

  const statusTitle = isPaid ? "PAGO APROBADO" : "NUEVA ORDEN";
   const statusMessage = isPaid 
     ? "Hemos recibido el pago de tu encargo exitosamente. Las finas notas de tu nueva adquisición comenzarán a ser preparadas."
      : context.paymentMethod === 'transferencia'
        ? "Hemos reservado tus fragancias. Por favor envía el comprobante de transferencia por WhatsApp para confirmar tu pago."
        : "Hemos reservado tus fragancias. Coordina con el administrador para finalizar tu adquisición o abona el saldo pendiente.";

  const itemsHtml = context.items.map(item => `
    <tr>
      <td style="padding: 15px 0; border-bottom: 1px solid rgba(212, 175, 55, 0.2); color: #fff;">
        <span style="font-family: serif; font-size: 16px; color: #d4af37;">${escapeHtml(item.title)}</span><br>
        <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #888;">CANTIDAD: ${item.quantity}</span>
      </td>
      <td style="text-align: right; padding: 15px 0; border-bottom: 1px solid rgba(212, 175, 55, 0.2); color: #fff; font-family: monospace;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const htmlBody = `
    <div style="background-color: #0d0d0d; margin: 0; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #ffffff;">
      <div style="max-w-xl; margin: 0 auto; border: 1px solid rgba(212, 175, 55, 0.3); background-color: #000000; padding: 40px;">
        <div style="text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.1); padding-bottom: 30px; margin-bottom: 40px;">
          <h1 style="color: #d4af37; font-family: serif; letter-spacing: 4px; text-transform: uppercase; margin: 0; font-size: 24px;">
            Allah Fragancias
          </h1>
          <p style="color: #666; font-size: 10px; letter-spacing: 5px; text-transform: uppercase; margin-top: 10px;">Luxurious Collection</p>
        </div>
        <h2 style="font-family: serif; color: #fff; font-size: 22px; margin-bottom: 15px;">Estimado/a ${escapeHtml(context.userName || 'Miembro')},</h2>
        <p style="color: #aaaaaa; font-size: 14px; line-height: 1.6; letter-spacing: 0.5px;">
          ${statusMessage}
        </p>
        <div style="background-color: #050505; border: 1px solid rgba(212, 175, 55, 0.15); padding: 25px; margin: 40px 0;">
          <div style="margin-bottom: 20px; text-transform: uppercase; font-size: 11px; letter-spacing: 2px; color: #d4af37;">
            DETALLE DE LA ORDEN: <span style="color: #fff;">#${context.orderId.slice(-8)}</span>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
          </table>
          <div style="margin-top: 30px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(212, 175, 55, 0.1); padding-top: 20px;">
            <div style="color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">
              MÉTODO: ${context.paymentMethod.toUpperCase()}
            </div>
            <div style="text-align: right;">
              <span style="color: #888; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">TOTAL A PAGAR</span><br>
              <span style="color: #d4af37; font-size: 24px; font-family: serif;">$${context.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div style="text-align: center; margin-top: 50px; padding-top: 30px; border-top: 1px solid rgba(212, 175, 55, 0.1);">
          <p style="color: #444; font-size: 12px; line-height: 1.5;">
            Si tienes alguna duda, contacta al administrador respondiendo este correo.<br>
            Gracias por elegir la exclusividad.
          </p>
        </div>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Allah Fragancias" <${env.SMTP_USER}>`,
      to: toEmail,
      subject: `Allah Fragancias - ${statusTitle} #${context.orderId.slice(-8)}`,
      html: htmlBody,
    });
    console.log("Correo enviado exitosamente a:", toEmail);
    return true;
  } catch (err) {
    console.error("Error crítico enviando correo SMTP:", err);
    return false;
  }
};

export const sendAdminNotificationEmail = async (adminEmail: string, context: OrderContext, isPaid: boolean = false) => {
  if (!env.SMTP_USER || !env.SMTP_PASS) return false;
  
  const statusTitle = isPaid ? "NUEVO PAGO APROBADO" : "NUEVA ORDEN RECIBIDA";
   const actionText = isPaid 
     ? "El pago ha sido procesado por Mercado Pago. Prepárate para despachar este paquete."
      : context.paymentMethod === 'transferencia'
        ? "El cliente ha seleccionado TRANSFERENCIA BANCARIA. Espera el comprobante por WhatsApp para confirmar el pago."
        : "El cliente ha seleccionado pagar en EFECTIVO. Contactalo a la brevedad para coordinar.";

  const itemsHtml = context.items.map(item => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); color: #ccc;">
        <strong>${escapeHtml(item.title)}</strong> (Qt: ${item.quantity})
      </td>
      <td style="text-align: right; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); color: #d4af37;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const htmlBody = `
    <div style="background-color: #111; padding: 30px; font-family: sans-serif; color: #fff;">
      <h2 style="color: #d4af37;">${statusTitle}</h2>
      <p style="color: #aaa; margin-bottom: 30px;">${actionText}</p>
      <div style="background-color: #000; border: 1px solid #d4af37; padding: 20px;">
        <h3 style="color: #fff; margin-top: 0;">Detalles del Cliente</h3>
        <ul style="color: #ccc; padding-left: 20px; font-size: 14px;">
          <li><strong>Nombre:</strong> ${escapeHtml(context.userName)}</li>
          <li><strong>Teléfono:</strong> ${escapeHtml(context.phone || 'No registrado')}</li>
          <li><strong>ID de Orden:</strong> #${context.orderId.slice(-8)}</li>
          <li><strong>Método:</strong> ${context.paymentMethod.toUpperCase()}</li>
        </ul>
        <h3 style="color: #fff; margin-top: 30px; border-bottom: 1px solid #333; padding-bottom: 10px;">Productos</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${itemsHtml}
        </table>
        <h2 style="text-align: right; color: #d4af37; margin-top: 20px;">TOTAL: $${context.total.toFixed(2)}</h2>
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Allah Notificaciones" <${env.SMTP_USER}>`,
      to: adminEmail,
      subject: `VENTA: ${statusTitle} - ${escapeHtml(context.userName)}`,
      html: htmlBody,
    });
    return true;
  } catch (err) {
    console.error("Error notificando al admin:", err);
    return false;
  }
};
