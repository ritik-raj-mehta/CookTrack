import nodemailer from 'nodemailer';

let transporterPromise = null;

const getTransporter = async () => {
  if (transporterPromise) {
    return transporterPromise;
  }

  transporterPromise = (async () => {
    // 1. Check if SMTP credentials exist in environment (.env)
    const host = process.env.SMTP_HOST || (process.env.EMAIL_USER && process.env.EMAIL_PASS ? 'smtp.gmail.com' : null);
    const rawUser = process.env.SMTP_USER || process.env.EMAIL_USER;
    const rawPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

    const user = rawUser ? rawUser.trim() : null;
    // Google app passwords may contain spaces (e.g. "cnfg brab razq xkca") - strip spaces for nodemailer
    const pass = rawPass ? rawPass.replace(/\s+/g, "").trim() : null;

    if (user && pass) {
      console.log(`[EmailService] Configuring Nodemailer for Gmail user: ${user}`);
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass,
        },
      });
    }

    // 2. If no user/pass in .env, automatically create an Ethereal test inbox
    console.log('[EmailService] No SMTP_USER in .env. Creating Ethereal Test Account...');
    const testAccount = await nodemailer.createTestAccount();
    console.log('[EmailService] Ethereal account ready:', testAccount.user);

    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  })();

  return transporterPromise;
};

/**
 * Send OTP Verification Email
 * @param {string} toEmail - Recipient email
 * @param {string} otp - 6 digit numeric code
 * @param {string} userName - User's name
 */
export const sendOtpEmail = async (toEmail, otp, userName = 'Cook') => {
  const transporter = await getTransporter();

  const senderEmail = process.env.EMAIL_USER || 'no-reply@cooktrack.app';
  const mailOptions = {
    from: process.env.EMAIL_FROM || `"CookTrack" <${senderEmail}>`,
    to: toEmail,
    subject: `Your CookTrack Verification Code: ${otp}`,
    html: `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #059669; margin: 0; font-size: 26px;">🍳 CookTrack</h2>
          <p style="color: #6b7280; font-size: 13px; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">Smart Kitchen System</p>
        </div>
        
        <p style="font-size: 16px; color: #1f2937;">Hello <strong>${userName}</strong>,</p>
        <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">
          Thank you for signing up with CookTrack! Please use the following 6-digit One-Time Password (OTP) to complete your registration and activate your kitchen account:
        </p>
        
        <div style="margin: 28px 0; text-align: center;">
          <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #047857; background: #ecfdf5; border: 2px dashed #10b981; padding: 14px 28px; border-radius: 12px; font-family: monospace;">
            ${otp}
          </span>
        </div>
        
        <p style="font-size: 13px; color: #ef4444; font-weight: 600; text-align: center;">
          ⏰ This code is valid for 10 minutes.
        </p>
        
        <p style="font-size: 13px; color: #9ca3af; line-height: 1.5; margin-top: 24px; border-top: 1px solid #f3f4f6; padding-top: 16px;">
          If you did not request this verification code, please ignore this email. No account has been created yet.
        </p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[EmailService] OTP email sent to ${toEmail}. MessageId: ${info.messageId}`);

  // If Ethereal test inbox was used, log the web preview link for easy checking
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`[EmailService] ✉️ View sent email preview at: ${previewUrl}`);
  }

  return { success: true, previewUrl, messageId: info.messageId };
};
