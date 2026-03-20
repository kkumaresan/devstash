import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Verify your DevStash email",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>Welcome to DevStash!</h2>
        <p>Click the link below to verify your email address:</p>
        <p>
          <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background: #171717; color: #fff; text-decoration: none; border-radius: 6px;">
            Verify Email
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
        <p style="color: #666; font-size: 14px;">If you didn't create an account, you can ignore this email.</p>
      </div>
    `,
  });
}
