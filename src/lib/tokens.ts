import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export async function generateVerificationToken(email: string) {
  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: email },
  });

  const token = randomUUID();
  const expires = new Date(Date.now() + TOKEN_EXPIRY_MS);

  const verificationToken = await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires,
    },
  });

  return verificationToken;
}

export async function getVerificationTokenByToken(token: string) {
  return prisma.verificationToken.findUnique({
    where: { token },
  });
}

export async function generatePasswordResetToken(email: string) {
  // Delete any existing reset tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: `reset:${email}` },
  });

  const token = randomUUID();
  const expires = new Date(Date.now() + TOKEN_EXPIRY_MS);

  const resetToken = await prisma.verificationToken.create({
    data: {
      identifier: `reset:${email}`,
      token,
      expires,
    },
  });

  return resetToken;
}

export async function getPasswordResetTokenByToken(token: string) {
  return prisma.verificationToken.findUnique({
    where: { token },
  });
}
