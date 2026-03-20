import { prisma } from "@/lib/prisma";
import { getVerificationTokenByToken } from "@/lib/tokens";
import { VerifyResultClient } from "./verify-result-client";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return <VerifyResultClient status="error" message="Missing verification token." />;
  }

  const verificationToken = await getVerificationTokenByToken(token);

  if (!verificationToken) {
    return <VerifyResultClient status="error" message="Invalid or expired verification link." />;
  }

  if (new Date() > verificationToken.expires) {
    // Clean up expired token
    await prisma.verificationToken.delete({
      where: { token },
    });
    return <VerifyResultClient status="error" message="Verification link has expired. Please register again." />;
  }

  // Mark user as verified
  await prisma.user.update({
    where: { email: verificationToken.identifier },
    data: { emailVerified: new Date() },
  });

  // Delete the used token
  await prisma.verificationToken.delete({
    where: { token },
  });

  return <VerifyResultClient status="success" message="Email verified successfully!" />;
}
