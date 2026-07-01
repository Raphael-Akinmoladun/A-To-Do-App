const nodemailer = require("nodemailer");

// Setup Nodemailer transporter
// Using ethereal for dev if no real SMTP variables are present
const createTransporter = async () => {
  let transporter;

  console.log("[Email Service] Checking SMTP Variables:", {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    hasPassword: !!process.env.SMTP_PASS,
  });

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    const port = parseInt(process.env.SMTP_PORT) || 587;

    // Real SMTP
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST.trim(),
      port: port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER.trim(),
        pass: process.env.SMTP_PASS.trim(),
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  } else {
    // Fallback to Ethereal email for local testing
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log("No SMTP config found. Using Ethereal Email for testing.");
  }
  return transporter;
};

// We will initialize the transporter once
let transporterInstance = null;

const sendEmail = async (to, subject, text) => {
  try {
    if (!transporterInstance) {
      transporterInstance = await createTransporter();
    }

    const info = await transporterInstance.sendMail({
      from: '"To-Do App" <noreply@todoapp.com>',
      to,
      subject,
      text,
    });

    console.log("Email sent: %s", info.messageId);
    // If using Ethereal, log the preview URL
    if (!process.env.SMTP_HOST) {
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};

module.exports = { sendEmail };
