const nodemailer = require('nodemailer');

const { env } = require('../config/env');

const createTransporter = () => {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) {
    const error = new Error('SMTP configuration is incomplete. Check SMTP_HOST, SMTP_USER, and SMTP_PASS.');
    error.statusCode = 500;
    throw error;
  }

  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
  });
};

const sendMail = async ({ to, subject, html, attachments }) => {
  const transporter = createTransporter();

  return transporter.sendMail({
    from: env.smtp.from,
    to,
    subject,
    html,
    attachments,
  });
};

const verifySmtpConnection = async () => {
  const transporter = createTransporter();
  await transporter.verify();
};

module.exports = {
  sendMail,
  verifySmtpConnection,
};
