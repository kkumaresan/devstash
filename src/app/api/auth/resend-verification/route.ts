import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { resendVerificationLimiter, getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email?: string };

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const ip = getClientIp(request);
  const key = `${ip}:${email.toLowerCase()}`;
  const { success, reset } = await checkRateLimit(resendVerificationLimiter, key);
  if (!success) return rateLimitResponse(reset);

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && !user.emailVerified) {
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(email, verificationToken.token);
  }

  // Always return success to avoid revealing whether the email exists
  return NextResponse.json({
    message: "If an unverified account exists with that email, a verification link has been sent.",
  });
}
