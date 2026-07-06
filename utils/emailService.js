const sendEmail = async (to, subject, text) => {
  console.log("==============================");
  console.log("[EmailService] sendEmail() called");
  console.log(`[EmailService] Recipient : ${to}`);
  console.log(`[EmailService] Subject   : ${subject}`);
  console.log(`[EmailService] Message   : ${text}`);
  console.log("------------------------------");

  // Log which env vars are loaded (without exposing full values)
  console.log("[EmailService] ENV CHECK:");
  console.log(`  EMAILJS_SERVICE_ID  : ${process.env.EMAILJS_SERVICE_ID  ? "✅ SET (" + process.env.EMAILJS_SERVICE_ID  + ")" : "❌ MISSING"}`);
  console.log(`  EMAILJS_TEMPLATE_ID : ${process.env.EMAILJS_TEMPLATE_ID ? "✅ SET (" + process.env.EMAILJS_TEMPLATE_ID + ")" : "❌ MISSING"}`);
  console.log(`  EMAILJS_PUBLIC_KEY  : ${process.env.EMAILJS_PUBLIC_KEY  ? "✅ SET"                                         : "❌ MISSING"}`);
  console.log(`  EMAILJS_PRIVATE_KEY : ${process.env.EMAILJS_PRIVATE_KEY ? "✅ SET"                                         : "⚠️  NOT SET (optional)"}`);

  // Bail out early if credentials are missing
  if (
    !process.env.EMAILJS_SERVICE_ID ||
    !process.env.EMAILJS_TEMPLATE_ID ||
    !process.env.EMAILJS_PUBLIC_KEY
  ) {
    console.error("[EmailService] ❌ Cannot send email — one or more required EmailJS env vars are missing.");
    return { success: false, message: "Missing EmailJS Credentials" };
  }

  const emailData = {
    service_id:   process.env.EMAILJS_SERVICE_ID,
    template_id:  process.env.EMAILJS_TEMPLATE_ID,
    user_id:      process.env.EMAILJS_PUBLIC_KEY,
    accessToken:  process.env.EMAILJS_PRIVATE_KEY || undefined,
    template_params: {
      to_email: to,
      subject:  subject,
      message:  text,
    },
  };

  console.log("[EmailService] Sending payload to EmailJS API...");
  console.log("[EmailService] Payload:", JSON.stringify(emailData, null, 2));

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailData),
    });

    const responseText = await response.text();

    console.log(`[EmailService] EmailJS HTTP Status : ${response.status}`);
    console.log(`[EmailService] EmailJS Response    : ${responseText}`);

    if (!response.ok) {
      console.error(`[EmailService] ❌ EmailJS rejected the request. Status: ${response.status} | Body: ${responseText}`);
      return { success: false, error: responseText };
    }

    console.log("[EmailService] ✅ Email sent successfully!");
    console.log("==============================");
    return { success: true };
  } catch (error) {
    console.error("[EmailService] 🚨 Network/fetch error while calling EmailJS:");
    console.error(`  Message : ${error.message}`);
    console.error(`  Stack   : ${error.stack}`);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
