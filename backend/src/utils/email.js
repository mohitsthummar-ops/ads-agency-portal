const nodemailer = require('nodemailer');

/**
 * Create and return a configured Nodemailer transporter.
 * Throws if SMTP credentials are missing.
 */
const createTransporter = () => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        throw new Error('SMTP configuration is missing. Check your .env file.');
    }
    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: parseInt(SMTP_PORT || 587),
        secure: parseInt(SMTP_PORT) === 465, // true for 465, false for other ports
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS.replace(/\s/g, ''), // Strip spaces from Gmail app passwords
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

/**
 * Send a password-reset email to a user.
 * @param {string} toEmail
 * @param {string} userName
 * @param {string} resetUrl  - Full URL the user clicks to reset their password
 */
const sendPasswordResetEmail = async (toEmail, userName, resetUrl) => {
    const transporter = createTransporter();
    await transporter.sendMail({
        from: `"AdAgency" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: 'Reset Your Password — AdAgency Portal',
        html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0d1117; color: #e2e8f0; border-radius: 12px;">
        <h2 style="color: #818cf8;">Password Reset Request</h2>
        <p>Hi ${userName},</p>
        <p>Click the button below to reset your password. This link expires in <strong>10 minutes</strong>.</p>
        <a href="${resetUrl}" style="display: inline-block; margin: 16px 0; padding: 12px 24px; background: #6366f1; color: white; border-radius: 8px; text-decoration: none; font-weight: 600;">Reset Password</a>
        <p style="color: #64748b; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
    });
};

const sendWelcomeEmail = async (toEmail, userName) => {
    const transporter = createTransporter();
    await transporter.sendMail({
        from: `"AdAgency" <${process.env.SMTP_USER}>`,
        to: toEmail,
        subject: 'Welcome to AdAgency Portal! 🎉',
        html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #0d1117; color: #e2e8f0; border-radius: 12px; border: 1px solid #1e293b;">
        <h2 style="color: #60a5fa; text-align: center;">Welcome to AdAgency, ${userName}!</h2>
        <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">We're thrilled to have you here. You can now explore campaign templates, request custom AI-generated ads, and manage your advertising seamlessly.</p>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; border-radius: 8px; text-decoration: none; font-weight: bold;">Go to Dashboard</a>
        </div>
        <hr style="border: none; border-top: 1px solid #334155; margin: 24px 0;" />
        <p style="color: #64748b; font-size: 13px; text-align: center;">If you have any questions, feel free to contact our support team.</p>
      </div>
    `,
    });
};

module.exports = { sendPasswordResetEmail, sendWelcomeEmail };
