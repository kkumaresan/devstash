import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth({
  ...authConfig,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isOnDashboard && !isLoggedIn) {
        return false; // redirects to sign-in
      }

      return true;
    },
  },
});

export const proxy = auth;
