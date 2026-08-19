const { query } = require('../config/db');
const nodemailer = require('nodemailer');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendEmailOTP = async (email, otp, fullName) => {
  if (!process.env.SMTP_HOST) {
    console.log(`[OTP] Email code for ${email}: ${otp}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({
    from: `"Chafadia Noor" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your Chafadia Noor Verification Code',
    html: `
      <div style="font-family:Arial,sans-serif;background:#063B28;padding:40px;text-align:center;">
        <h1 style="color:#D4A017;letter-spacing:2px;margin:0 0 6px;">CHAFADIA NOOR</h1>
        <p style="color:#CFE8DD;font-size:13px;margin:0 0 28px;">Guided by Faith • Inspired by Love</p>
        <div style="background:#fff;border-radius:16px;padding:32px;margin:0 auto;max-width:380px;">
          <p style="color:#063B28;font-size:16px;margin:0 0 4px;">As-salamu alaykum, <strong>${fullName}</strong></p>
          <p style="color:#6b7280;font-size:14px;margin:0 0 22px;">Your verification code is:</p>
          <div style="background:#F7F5EE;border-radius:12px;padding:18px;margin:0 0 22px;">
            <h2 style="color:#063B28;font-size:46px;letter-spacing:14px;margin:0;font-family:monospace;">${otp}</h2>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin:0;">Valid for <strong>10 minutes</strong>. Do not share this code.</p>
        </div>
        <p style="color:#D4A017;font-size:11px;margin:22px 0 0;">Built by Sadiyatou Chafiou</p>
      </div>
    `,
  });
};

const sendPhoneOTP = async (phone, otp) => {
  console.log(`[OTP] Phone code for ${phone}: ${otp}`);
  if (process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const twilio = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
      await twilio.messages.create({
        body: `Your Chafadia Noor code is: ${otp}. Valid for 10 minutes.`,
        from: process.env.TWILIO_PHONE,
        to: phone,
      });
    } catch (e) {
      console.error('[OTP] SMS error:', e.message);
    }
  }
};

const storeOTP = async (contact, contactType, otp, userId) => {
  await query('DELETE FROM otp_verifications WHERE contact = $1 AND used = false', [contact]);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await query(
    `INSERT INTO otp_verifications (contact, contact_type, otp, user_id, expires_at)
     VALUES ($1, $2, $3, $4, $5)`,
    [contact, contactType, otp, userId, expiresAt]
  );
};

const consumeOTP = async (contact, otp) => {
  const result = await query(
    `SELECT * FROM otp_verifications
     WHERE contact = $1 AND otp = $2 AND used = false AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [contact, otp]
  );
  if (result.rows.length === 0) return null;
  await query('UPDATE otp_verifications SET used = true WHERE id = $1', [result.rows[0].id]);
  return result.rows[0];
};

module.exports = { generateOTP, sendEmailOTP, sendPhoneOTP, storeOTP, consumeOTP };
