import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getPasswordResetTokenByToken } from "@/lib/tokens";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = rateLimit(request, { maxRequests: 10, windowSeconds: 900 });
  if (limited) return limited;
  const { token, password, confirmPassword } = (await request.json()) as {
    token?: string;
    password?: string;
    confirmPassword?: string;
  };

  if (!token || !password || !confirmPassword) {
    return NextResponse.json(
      { error: "All fields are required" },
      { status: 400 }
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { error: "Passwords do not match" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  if (password.length > 128) {
    return NextResponse.json(
      { error: "Password must be 128 characters or fewer" },
      { status: 400 }
    );
  }

  const resetToken = await getPasswordResetTokenByToken(token);

  if (!resetToken || !resetToken.identifier.startsWith("reset:")) {
    return NextResponse.json(
      { error: "Invalid or expired reset link" },
      { status: 400 }
    );
  }

  if (new Date() > resetToken.expires) {
    await prisma.verificationToken.delete({ where: { token } });
    return NextResponse.json(
      { error: "Reset link has expired. Please request a new one." },
      { status: 400 }
    );
  }

  const email = resetToken.identifier.replace("reset:", "");

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { email },
    data: { hashedPassword, tokenVersion: { increment: 1 } },
  });

  // Delete the used token
  await prisma.verificationToken.delete({ where: { token } });

  return NextResponse.json({
    message: "Password reset successfully. You can now sign in.",
  });
}
