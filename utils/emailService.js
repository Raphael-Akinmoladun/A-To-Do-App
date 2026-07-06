const sendEmail = async (to, subject, text) => {
  try {
    console.log(`[Email Service] Initiating EmailJS send to: ${to}`);

    // Check if the required EmailJS environment variables are set
    if (
      !process.env.EMAILJS_SERVICE_ID ||
      !process.env.EMAILJS_TEMPLATE_ID ||
      !process.env.EMAILJS_PUBLIC_KEY
    ) {
      console.log("⚠️ EmailJS environment variables are missing. Skipping real email send.");
      console.log(`[Mock Email] To: ${to} | Subject: ${subject}`);
      return { success: false, message: "Missing EmailJS Credentials" };
    }

    console.log(`[Email Service] Calling EmailJS API...`);
    
    const emailData = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      accessToken: process.env.EMAILJS_PRIVATE_KEY, // Optional but recommended for security
      template_params: {
        to_email: to,
        subject: subject,
        message: text,
      },
    };

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Failed to send email via EmailJS. Error details:", errorText);
      return { success: false, error: errorText };
    }

    console.log("✅ Email sent successfully via EmailJS!");
    return { success: true };
  } catch (error) {
    console.error("🚨 Unexpected error sending email:", error.message);
    console.error(error.stack);
    return { success: false, error };
  }
};

module.exports = { sendEmail };
