import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config";

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    // Keep non-Credentials providers from authConfig (GitHub, etc.)
    ...authConfig.providers.filter(
      (p) => (p as { type?: string }).type !== "credentials"
    ),
    // Override Credentials with real authorize logic
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.hashedPassword) return null;

        const isValid = await bcrypt.compare(password, user.hashedPassword);
        if (!isValid) return null;

        if (
          process.env.EMAIL_VERIFICATION_ENABLED === "true" &&
          !user.emailVerified
        ) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          tokenVersion: (user as { tokenVersion?: number }).tokenVersion ?? 0,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Auto-link GitHub OAuth to existing user with same verified email.
      // Safe because GitHub only exposes verified email addresses.
      if (account?.provider === "github" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          include: { accounts: { where: { provider: "github" } } },
        });

        if (existingUser && existingUser.accounts.length === 0) {
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              token_type: account.token_type,
              scope: account.scope,
            },
          });

          // Update profile picture and mark email as verified if not already
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              image: user.image ?? existingUser.image,
              ...(!existingUser.emailVerified && { emailVerified: new Date() }),
            },
          });

          // Point the OAuth user object to the existing user so JWT gets the right ID
          user.id = existingUser.id;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tokenVersion =
          (user as { tokenVersion?: number }).tokenVersion ?? 0;
      }

      // On subsequent requests, verify tokenVersion hasn't changed
      if (token.id && !user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { tokenVersion: true },
        });
        if (!dbUser || dbUser.tokenVersion !== token.tokenVersion) {
          // Token version mismatch — force re-authentication
          return { ...token, id: undefined };
        }
      }

      return token;
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
