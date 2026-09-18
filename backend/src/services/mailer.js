/**
 * GOD'S EYE SECURITY FORCE (GESF)
 * Enterprise Email Dispatcher Service (ESM)
 */

import nodemailer from 'nodemailer';

let cachedTransporter = null;
let isEthereal = false;

async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (user && pass) {
    console.log(`📧 [MAILER] Initializing Production SMTP: ${host || 'smtp.gmail.com'} for sender: ${user}`);
    cachedTransporter = nodemailer.createTransport({
      host: host || 'smtp.gmail.com',
      port: port,
      secure: secure,
      auth: { user, pass }
    });
    isEthereal = false;
    return cachedTransporter;
  }

  // Otherwise, use Ethereal for instant zero-config real SMTP testing
  console.log('📧 [MAILER] No external SMTP in .env. Initializing Ethereal Test Mailer...');
  const testAccount = await nodemailer.createTestAccount();
  cachedTransporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
  isEthereal = true;
  console.log(`📧 [MAILER] Ethereal SMTP active. Sender: ${testAccount.user}`);
  return cachedTransporter;
}

/**
 * Send Security Recovery OTP Email
 * @param {string} recipientEmail 
 * @param {string} otp 
 * @returns {Promise<{ messageId: string, previewUrl?: string, isEthereal: boolean }>}
 */
export async function sendOtpEmail(recipientEmail, otp) {
  const transporter = await getTransporter();

  const senderUser = process.env.SMTP_USER || 'preethamgowdar77@gmail.com';
  const senderAddress = `"GESF Operations Portal" <${senderUser}>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0b0f19; color: #f1f5f9; padding: 24px; }
        .card { background-color: #111827; border: 1px solid #1f2937; border-radius: 8px; max-width: 520px; margin: 0 auto; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
        .badge { display: inline-block; background: rgba(6, 182, 212, 0.15); color: #00F0FF; padding: 4px 10px; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; border-radius: 4px; border: 1px solid #00F0FF; margin-bottom: 16px; }
        .otp-box { background: #0b0f19; border: 2px dashed #00F0FF; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-code { font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 0.25em; color: #00F0FF; }
        .footer { font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid #1f2937; padding-top: 16px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">GESF SECURITY OPERATIONS &bull; CREDENTIAL RECOVERY</div>
        <h2 style="margin: 0 0 12px 0; color: #ffffff;">Password Reset Security Passcode</h2>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">
          A passcode recovery request was initiated for your employee profile (<strong>${recipientEmail}</strong>). Use the one-time authorization code below to complete your credential update.
        </p>

        <div class="otp-box">
          <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">Your One-Time Passcode (OTP)</div>
          <div class="otp-code">${otp}</div>
          <div style="font-size: 11px; color: #64748b; margin-top: 6px;">Valid for 10 minutes &bull; Single-use authorization</div>
        </div>

        <p style="font-size: 13px; color: #64748b;">
          If you did not request this recovery code, please notify the GESF Information Security Operations Center immediately.
        </p>

        <div class="footer">
          &copy; 2026 GOD'S EYE SECURITY FORCE &bull; Confidential & Proprietary Operations Systems
        </div>
      </div>
    </body>
    </html>
  `;

  const info = await transporter.sendMail({
    from: senderAddress,
    to: recipientEmail,
    replyTo: senderUser,
    subject: `GESF Security OTP: ${otp}`,
    text: `Your GESF Passcode Recovery Code is: ${otp}. Valid for 10 minutes.`,
    html: htmlContent,
    headers: {
      'X-Priority': '1 (Highest)',
      'X-MSMail-Priority': 'High',
      'Importance': 'High'
    }
  });

  const previewUrl = isEthereal ? nodemailer.getTestMessageUrl(info) : null;

  console.log(`\n📨 [EMAIL DISPATCHED] To: ${recipientEmail} | OTP: ${otp} | ID: ${info.messageId}`);
  if (previewUrl) {
    console.log(`🌐 [WEBMAIL PREVIEW LINK]: ${previewUrl}\n`);
  }

  return {
    messageId: info.messageId,
    previewUrl,
    isEthereal
  };
}
