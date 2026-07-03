const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,  // Gmail App Password, not your actual Gmail password
    },
})

const sendEmail = async ({ to, subject, html }) => {
    const mailOptions = {
        from: `"Pizza App" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
    }

    await transporter.sendMail(mailOptions)
}

// Email templates
const emailTemplates = {
    verifyEmail: (name, verifyUrl) => ({
        subject: 'Verify your email — Pizza App',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hey ${name}, welcome to Pizza App!</h2>
        <p>Click the button below to verify your email address.</p>
        <a href="${verifyUrl}" 
           style="background:#e53e3e; color:white; padding:12px 24px; 
                  border-radius:6px; text-decoration:none; display:inline-block;">
          Verify Email
        </a>
        <p>This link expires in 24 hours.</p>
        <p>If you didn't create an account, ignore this email.</p>
      </div>
    `,
    }),

    resetPassword: (name, resetUrl) => ({
        subject: 'Reset your password — Pizza App',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${name},</h2>
        <p>You requested a password reset. Click below to set a new password.</p>
        <a href="${resetUrl}"
           style="background:#e53e3e; color:white; padding:12px 24px;
                  border-radius:6px; text-decoration:none; display:inline-block;">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, ignore this email.</p>
      </div>
    `,
    }),
}

module.exports = { sendEmail, emailTemplates }
