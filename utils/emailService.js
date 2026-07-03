const { Resend } = require("resend");

// Initialize Resend with your API key
// It will fall back to a placeholder if the key is missing to prevent app crashes
const resend = new Resend(process.env.RESEND_API_KEY || "re_123456789");

const sendEmail = async (to, subject, text) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.log("No RESEND_API_KEY found. Skipping real email send.");
      console.log(`[Mock Email] To: ${to} | Subject: ${subject}`);
      return;
    }

    const { data, error } = await resend.emails.send({
      from: "To-Do App <onboarding@resend.dev>", // Resend's default testing domain
      to: [to],
      subject: subject,
      text: text,
    });

    if (error) {
      console.error("Failed to send email via Resend:", error);
      return;
    }

    console.log("Email sent successfully via Resend. ID:", data.id);
  } catch (error) {
    console.error("Unexpected error sending email:", error);
  }
};

module.exports = { sendEmail };
