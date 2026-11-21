import nodemailer from 'nodemailer';

/**
 * Generate standard HTML email template for CookTrack OTP
 */
const getOtpEmailHtml = (otp, userName = 'Cook') => `
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
`;

/**
 * Send email using Resend REST API (HTTPS Port 443 - works on Render Free Tier)
 */
const sendViaResend = async (toEmail, otp, userName) => {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;

  console.log(`[EmailService] Attempting to send OTP email to ${toEmail} via Resend HTTP API...`);
  const sender = process.env.RESEND_FROM || process.env.EMAIL_FROM || 'CookTrack <onboarding@resend.dev>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: sender,
      to: [toEmail],
      subject: `Your CookTrack Verification Code: ${otp}`,
      html: getOtpEmailHtml(otp, userName),
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Resend API error (${response.status})`);
  }

  console.log(`[EmailService] OTP email successfully sent via Resend! ID: ${data.id}`);
  return { success: true, provider: 'resend', messageId: data.id };
};

/**
 * Send email using Brevo (Sendinblue) REST API (HTTPS Port 443)
 */
const sendViaBrevo = async (toEmail, otp, userName) => {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) return null;

  console.log(`[EmailService] Attempting to send OTP email to ${toEmail} via Brevo HTTP API...`);
  const senderEmail = process.env.EMAIL_USER || 'no-reply@cooktrack.app';

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'CookTrack', email: senderEmail },
      to: [{ email: toEmail, name: userName }],
      subject: `Your CookTrack Verification Code: ${otp}`,
      htmlContent: getOtpEmailHtml(otp, userName),
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Brevo API error (${response.status})`);
  }

  console.log(`[EmailService] OTP email successfully sent via Brevo! ID: ${data.messageId}`);
  return { success: true, provider: 'brevo', messageId: data.messageId };
};

/**
 * Send email using Nodemailer direct SMTP (Port 465 with 5s fast timeout)
 */
const sendViaNodemailer = async (toEmail, otp, userName) => {
  const rawUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const rawPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const user = rawUser ? rawUser.trim() : null;
  const pass = rawPass ? rawPass.replace(/\s+/g, '').trim() : null;

  if (!user || !pass) return null;

  console.log(`[EmailService] Attempting SMTP via smtp.gmail.com:465 for ${user}...`);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_PORT ? process.env.SMTP_PORT == '465' : true,
    auth: { user, pass },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"CookTrack" <${user}>`,
    to: toEmail,
    subject: `Your CookTrack Verification Code: ${otp}`,
    html: getOtpEmailHtml(otp, userName),
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[EmailService] OTP email sent via SMTP to ${toEmail}. MessageId: ${info.messageId}`);
  return { success: true, provider: 'smtp', messageId: info.messageId };
};

/**
 * Main sendOtpEmail dispatcher
 * Attempts HTTP REST email APIs first (works across cloud firewalls like Render Free Tier),
 * then falls back to direct SMTP with quick timeouts, and finally provides a graceful cloud fallback.
 *
 * @param {string} toEmail - Recipient email
 * @param {string} otp - 6 digit numeric code
 * @param {string} userName - User's name
 */
export const sendOtpEmail = async (toEmail, otp, userName = 'Cook') => {
  // 1. Try Resend HTTP API (Port 443 - works on Render Free)
  try {
    const resendResult = await sendViaResend(toEmail, otp, userName);
    if (resendResult) return resendResult;
  } catch (err) {
    console.error('[EmailService] Resend HTTP API failed:', err.message);
  }

  // 2. Try Brevo HTTP API (Port 443)
  try {
    const brevoResult = await sendViaBrevo(toEmail, otp, userName);
    if (brevoResult) return brevoResult;
  } catch (err) {
    console.error('[EmailService] Brevo HTTP API failed:', err.message);
  }

  // 3. Try Nodemailer direct SMTP (with 5s fast timeout)
  try {
    const smtpResult = await sendViaNodemailer(toEmail, otp, userName);
    if (smtpResult) return smtpResult;
  } catch (err) {
    console.error('[EmailService] SMTP delivery failed (likely blocked by cloud host firewall):', err.message);
  }

  // 4. Fallback if no provider succeeded (e.g. Render Free Tier blocking SMTP without HTTP API configured)
  console.warn(`[EmailService] All email providers unavailable. Returning dev/cloud fallback code for ${toEmail}`);
  return {
    success: false,
    provider: 'fallback',
    devOtp: otp,
    warning: 'Cloud host blocked outbound SMTP traffic. Configure RESEND_API_KEY in server environment for automated delivery.',
  };
};
