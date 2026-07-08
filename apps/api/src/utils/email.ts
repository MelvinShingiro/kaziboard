import { Resend } from "resend";

function buildVerificationUrl(token: string) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  return `${frontendUrl}/verify-email?token=${token}`;
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = buildVerificationUrl(token);
  const apiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM;

  if (!apiKey || !emailFrom) {
    console.log(
      `[email] RESEND_API_KEY or EMAIL_FROM missing. Verification link for ${email}: ${verificationUrl}`
    );
    return;
  }

  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: emailFrom,
    to: email,
    subject: "Verify your KaziBoard email",
    html: `
      <p>Welcome to KaziBoard.</p>
      <p>Click the link below to verify your email address:</p>
      <p><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link expires in 24 hours.</p>
    `,
  });
}
