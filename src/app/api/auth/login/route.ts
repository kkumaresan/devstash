import { NextResponse } from "next/server";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { loginLimiter, getClientIp, checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const ip = getClientIp(request);
  const key = `${ip}:${email.toLowerCase()}`;
  const { success, reset } = await checkRateLimit(loginLimiter, key);
  if (!success) return rateLimitResponse(reset);

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // NextAuth v5 server-side signIn always throws a redirect on success.
    // The session cookie is already set — return success JSON instead of re-throwing.
    if (isRedirectError(error)) {
      return NextResponse.json({ success: true });
    }

    if (error instanceof AuthError) {
      if (error.message === "EMAIL_NOT_VERIFIED" || error.cause?.err?.message === "EMAIL_NOT_VERIFIED") {
        return NextResponse.json(
          { error: "Please verify your email before signing in. Check your inbox.", code: "EMAIL_NOT_VERIFIED" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: "Invalid email or password" },
      { status: 401 }
    );
  }
}
