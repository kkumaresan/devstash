import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";
import { registerLimiter, getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { success, reset } = await checkRateLimit(registerLimiter, ip);
  if (!success) return rateLimitResponse(reset);

  const body = await request.json();
  const { name, email, password, confirmPassword } = body as {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  };

  if (!name || !email || !password || !confirmPassword) {
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

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json(
      { error: "Email already in use" },
      { status: 409 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const emailVerificationEnabled =
    process.env.EMAIL_VERIFICATION_ENABLED === "true";

  await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword,
      ...(!emailVerificationEnabled && { emailVerified: new Date() }),
    },
  });

  if (emailVerificationEnabled) {
    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(email, verificationToken.token);
  }

  return NextResponse.json(
    {
      message: emailVerificationEnabled
        ? "Verification email sent. Please check your inbox."
        : "Account created successfully!",
    },
    { status: 201 }
  );
}
