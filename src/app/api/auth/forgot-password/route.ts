import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  const { email } = (await request.json()) as { email?: string };

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  // Always return success to avoid revealing whether the email exists
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.hashedPassword) {
    const resetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(email, resetToken.token);
  }

  return NextResponse.json({
    message: "If an account exists with that email, a password reset link has been sent.",
  });
}
