# Authentication Security Review

**Last Audit:** 2026-03-21
**Auditor:** auth-auditor agent
**Scope:** All authentication-related code in DevStash

---

## Findings

### 🔴 CRITICAL

**Dashboard Has No Authentication — Hardcoded DEMO_USER_ID**

- **File:** `src/app/dashboard/layout.tsx` (lines 10, 18–19) and `src/app/dashboard/page.tsx` (lines 14, 20–26)
- **Issue:** The dashboard layout and main dashboard page both use a hardcoded `DEMO_USER_ID = "user_demo"` constant instead of fetching the session. There is no `auth()` call, no redirect to `/sign-in` for unauthenticated users, and all data queries run with this hardcoded user ID. Anyone who navigates to `/dashboard` directly — authenticated or not — will be served the demo user's data.
- **Impact:** Complete authentication bypass of the main dashboard. An unauthenticated attacker can access `/dashboard` and view all data belonging to the `user_demo` account. When real user data is later stored, this constant also means every authenticated user sees the same demo data rather than their own, and no real data is protected.
- **Fix:** Add session checks and replace `DEMO_USER_ID` with the real user ID from the session in both files:

  ```typescript
  // src/app/dashboard/layout.tsx
  import { auth } from "@/auth";
  import { redirect } from "next/navigation";

  export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const session = await auth();
    if (!session?.user?.id) redirect("/sign-in");

    const [itemTypes, sidebarCollections] = await Promise.all([
      getItemTypesWithCounts(session.user.id),
      getSidebarCollections(session.user.id),
    ]);
    // ...
  }
  ```

  Apply the same pattern in `src/app/dashboard/page.tsx`.

---

**No Route Protection Middleware — All Dashboard Routes Are Unauthenticated**

- **File:** No `middleware.ts` exists at the project root
- **Issue:** There is no Next.js middleware protecting the `/dashboard` route tree. Combined with the missing `auth()` call in the dashboard layout, there is zero server-side authentication enforcement at the routing level. Any route under `/dashboard` that does not independently call `auth()` is publicly accessible.
- **Impact:** Entire dashboard surface area is accessible without a valid session. This is an architectural gap that will compound as more dashboard routes are added.
- **Fix:** Create `middleware.ts` at the project root using NextAuth's built-in middleware to protect all `/dashboard` routes:

  ```typescript
  // middleware.ts (project root)
  export { auth as middleware } from "@/auth";

  export const config = {
    matcher: ["/dashboard/:path*"],
  };
  ```

  This ensures unauthenticated requests are redirected to `/sign-in` before any Server Component or layout even runs.

---

### 🟠 HIGH

**Password Reset Does Not Invalidate Existing Sessions**

- **File:** `src/app/api/auth/reset-password/route.ts` (lines 46–54)
- **Issue:** After a successful password reset, the route updates the `hashedPassword` field and deletes the reset token, but does not invalidate any active sessions for that user. Since sessions are JWT-based (stateless), existing sessions remain valid indefinitely after the password has been reset.
- **Impact:** If an attacker obtained a valid session token (e.g., via session fixation or token theft), resetting the account password would not revoke their access. Conversely, if the legitimate user resets their password after suspecting compromise, the attacker's session lives on.
- **Fix:** After updating the password, delete all database sessions for that user. With JWT sessions and the Prisma adapter's `Session` table, you can clear them:

  ```typescript
  // After bcrypt.hash and prisma.user.update in reset-password/route.ts
  await prisma.session.deleteMany({ where: { userId: user.id } });
  ```

  You will need to look up the user by email first to get their `id`. Note: because this app uses `strategy: "jwt"`, JWTs are not stored server-side, so session table deletion only affects any database-backed sessions. For full coverage with stateless JWTs, a token version/counter pattern on the `User` model is the robust long-term solution.

---

**No Maximum Password Length — bcrypt DoS Vector**

- **File:** `src/app/api/auth/register/route.ts` (line 38), `src/app/api/auth/reset-password/route.ts` (line 46), `src/app/api/auth/change-password/route.ts` (line 60)
- **Issue:** None of the three password hashing call sites enforce a maximum password length before calling `bcrypt.hash()`. bcrypt silently truncates input at 72 bytes, but the hashing operation itself is CPU-intensive. Sending a very long password (e.g., 1 MB) causes bcrypt to consume significant CPU time before truncating, creating a denial-of-service vector.
- **Impact:** An unauthenticated attacker can send repeated requests to `/api/auth/register` or `/api/auth/reset-password` with multi-megabyte passwords, potentially exhausting CPU resources on the server.
- **Fix:** Add a maximum length check (72 characters is the effective limit; 128 is a common safe choice) before hashing in all three routes:

  ```typescript
  if (password.length > 128) {
    return NextResponse.json(
      { error: "Password must be 128 characters or fewer" },
      { status: 400 }
    );
  }
  ```

---

**No Rate Limiting on Any Auth Endpoint**

- **File:** `src/app/api/auth/register/route.ts`, `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/reset-password/route.ts`, `src/app/api/auth/change-password/route.ts`, `src/app/api/auth/delete-account/route.ts`
- **Issue:** None of the custom auth API routes implement any rate limiting. The login endpoint handled by NextAuth is also not rate-limited via middleware.
- **Impact:**
  - **Login brute-force:** An attacker can make unlimited attempts to guess passwords at the NextAuth credentials endpoint.
  - **Password reset abuse:** An attacker can flood the forgot-password endpoint to trigger bulk email sending (using your Resend quota and potentially spamming victims).
  - **Registration abuse:** Bulk account creation is unconstrained.
  - **Change/delete abuse:** Authenticated users can spam these endpoints.
- **Fix:** Add rate limiting to all auth routes. The simplest approach for a Next.js/Vercel app is to use the `@upstash/ratelimit` package with Redis, or `rate-limiter-flexible` with an in-memory or Redis store. Apply it as middleware or at the top of each route handler. Example using upstash:

  ```typescript
  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, "15 m"),
  });

  const { success } = await ratelimit.limit(ip);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  ```

  Suggested limits: login — 10 attempts per 15 min per IP; forgot-password — 5 per hour per IP; register — 5 per hour per IP.

---

### 🟡 MEDIUM

**Email Enumeration on Registration**

- **File:** `src/app/api/auth/register/route.ts` (lines 31–35)
- **Issue:** When a user attempts to register with an email that is already in use, the API returns a `409 Conflict` with the message `"Email already in use"`. This allows an unauthenticated attacker to enumerate which email addresses have accounts by submitting registration requests.
- **Impact:** An attacker can discover whether a specific email address has a DevStash account. This can be used to target phishing attacks or reveal that a person uses this service.
- **Fix:** Return the same generic success-style response regardless of whether the email exists, and silently send a "someone tried to register with your email" notification to the existing user:

  ```typescript
  if (existingUser) {
    // Optionally: send a "someone tried to register" email to existingUser.email
    return NextResponse.json(
      { message: "If this email is not registered, a verification link has been sent." },
      { status: 201 }
    );
  }
  ```

  This makes the registration endpoint behave identically whether or not the email is taken.

---

**Password Complexity Not Enforced on Register or Reset — Only Minimum Length**

- **File:** `src/app/api/auth/register/route.ts` (no complexity check), `src/app/api/auth/reset-password/route.ts` (no complexity check); compare with `src/app/api/auth/change-password/route.ts` (line 33, only checks `>= 8`)
- **Issue:** The register and reset-password routes have no minimum password length check at all on the server side (the `minLength={8}` on the register form is client-side only and easily bypassed by direct API calls). The change-password route has an 8-character minimum but no complexity requirements. There are no consistent password rules across all three entry points.
- **Impact:** Users can set trivially weak passwords (e.g., `password`, `12345678`) via API calls that bypass the client-side form. Weak passwords make credential stuffing and brute-force attacks more effective.
- **Fix:** Add a server-side minimum length check (at least 8 characters) to all three password-handling routes. Optionally enforce complexity (uppercase, lowercase, number, or symbol). Ensure this is consistent across register, reset-password, and change-password:

  ```typescript
  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }
  ```

---

**Verify-Email Token Not Scoped — Cross-Token Namespace Collision Possible**

- **File:** `src/lib/tokens.ts` (lines 26–30 vs lines 52–56)
- **Issue:** Both `getVerificationTokenByToken` and `getPasswordResetTokenByToken` perform identical queries — `prisma.verificationToken.findUnique({ where: { token } })`. The only disambiguation is a check in `reset-password/route.ts` (line 29) that verifies `identifier.startsWith("reset:")`. However, the `verify-email` page (line 31) updates the user based on `verificationToken.identifier` used as an email — it does not check that the identifier does NOT start with `"reset:"`.
- **Impact:** If a user submits a password reset token to the `/verify-email?token=<reset_token>` endpoint, the server will attempt to call `prisma.user.update({ where: { email: "reset:user@example.com" } })`. This will likely fail silently (no user with that email), but it also means the reset token gets deleted without being used, burning the user's reset link. More importantly, the token namespace is not formally isolated. A verification token submitted to the reset-password endpoint would be rejected by the `startsWith("reset:")` check, but a reset token submitted to verify-email would silently consume it.
- **Fix:** In `verify-email/page.tsx`, add an explicit check that the token's identifier does NOT start with `"reset:"`:

  ```typescript
  if (!verificationToken || verificationToken.identifier.startsWith("reset:")) {
    return <VerifyResultClient status="error" message="Invalid or expired verification link." />;
  }
  ```

---

**No Server-Side Email Format Validation**

- **File:** `src/app/api/auth/register/route.ts` (line 16 — only checks truthiness), `src/app/api/auth/forgot-password/route.ts` (line 9 — only checks truthiness)
- **Issue:** The register and forgot-password routes check that `email` is truthy but do not validate that it is a properly formatted email address. An attacker can pass arbitrary strings as the email field.
- **Impact:** Malformed email values could cause unexpected Prisma query behaviour or downstream issues (e.g., passing a non-email string to Resend). While unlikely to be exploitable for direct data exfiltration, it represents missing input sanitisation at the server boundary.
- **Fix:** Add server-side email format validation using a simple regex or the `zod` library (which is commonly used with Next.js):

  ```typescript
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }
  ```

---

### 🔵 LOW

**Resend is Using `onboarding@resend.dev` Sender — Production Risk**

- **File:** `src/lib/email.ts` (lines 9, 33)
- **Issue:** Both email functions use `from: "onboarding@resend.dev"` as the sender address. This is Resend's sandbox/demo domain, intended for testing only. In production, emails from this domain may be blocked by spam filters, have low deliverability, or stop working entirely if Resend changes sandbox policies.
- **Impact:** Password reset and verification emails may not be delivered in production, preventing users from completing authentication flows. This is not a security vulnerability per se, but it creates a denial-of-service on the email verification flow.
- **Fix:** Configure a verified custom domain sender in Resend and update the `from` address to something like `noreply@yourdomain.com`.

---

**Expired Verification Tokens Not Cleaned Up Proactively**

- **File:** `src/lib/tokens.ts` (lines 6–23)
- **Issue:** Expired verification tokens are only deleted when a user visits the verify-email page with an expired token. There is no background cleanup job. Over time, the `VerificationToken` table will accumulate stale records.
- **Impact:** This is a data hygiene issue rather than a direct security vulnerability. Table bloat could marginally slow down token lookups over time. Stale tokens do not grant access (the expiry check prevents that), but they occupy database space.
- **Fix:** When generating a new token for an email (`generateVerificationToken` already does this via `deleteMany`), the old tokens are cleaned up, so the main risk is tokens for users who never complete registration. Consider adding a scheduled cleanup job (e.g., a Vercel Cron job) to delete all tokens past their `expires` date:

  ```typescript
  await prisma.verificationToken.deleteMany({
    where: { expires: { lt: new Date() } },
  });
  ```

---

**`auth()` Called on Every Request in Dashboard Profile Page Without Caching**

- **File:** `src/app/dashboard/profile/page.tsx` (line 13)
- **Issue:** The profile page calls `auth()` synchronously and then calls `getUserProfile(session.user.id)` which does a separate database query. This is a minor performance concern, not a security issue. The `auth()` call is correct and necessary. However, the note is included for completeness.
- **Impact:** Negligible security impact. Mentioned for awareness only.
- **Fix:** No action required from a security perspective.

---

## Passed Checks

- **bcrypt cost factor** — `bcrypt.hash(password, 12)` is used in all three hashing sites (register, reset-password, change-password). Cost factor 12 exceeds the recommended minimum of 10.

- **CSPRNG token generation** — `crypto.randomUUID()` (Node.js built-in, backed by OS CSPRNG) is used in `src/lib/tokens.ts`. `Math.random()` is not used anywhere in the auth flow.

- **Token expiry enforcement** — All tokens expire in 1 hour (`TOKEN_EXPIRY_MS = 60 * 60 * 1000`). Both the verify-email page and reset-password route check `new Date() > token.expires` before acting.

- **Single-use token enforcement (verify-email)** — `src/app/(auth)/verify-email/page.tsx` (line 36–38) deletes the token after successful verification.

- **Single-use token enforcement (reset-password)** — `src/app/api/auth/reset-password/route.ts` (line 54) deletes the token after successful password reset. Expired tokens are also deleted (line 37).

- **Token type isolation (reset → verify)** — `src/app/api/auth/reset-password/route.ts` (line 29) rejects any token whose identifier does not start with `"reset:"`, preventing a verification token from being used as a reset token.

- **Password reset email enumeration** — `src/app/api/auth/forgot-password/route.ts` (lines 16–27) always returns the same success-like message regardless of whether the email exists or has a password, correctly preventing email enumeration on this endpoint.

- **Current password required for change** — `src/app/api/auth/change-password/route.ts` (lines 52–57) validates the current password via `bcrypt.compare` before allowing a password change.

- **Authorization scoped to session user** — All protected routes (`change-password`, `delete-account`, `profile/page.tsx`) fetch `session.user.id` from the server-side `auth()` call and use it to scope database queries. No user-supplied ID is trusted.

- **Account deletion cascade** — The Prisma schema (`prisma/schema.prisma`, lines 55, 67, 131, 163, 194) has `onDelete: Cascade` on all User relations (`Account`, `Session`, `Item`, `Collection`, `Tag`, `ItemType`). Deleting a user automatically removes all associated records.

- **OAuth accounts cannot change password** — `src/app/api/auth/change-password/route.ts` (lines 45–49) explicitly rejects password change requests for accounts without a `hashedPassword`, preventing the endpoint from being misused against OAuth-only accounts.

- **JWT session token signing/verification** — Handled automatically by NextAuth v5 with a server-side `AUTH_SECRET`. Not flagged.

- **CSRF protection** — NextAuth v5 provides built-in CSRF protection for its own endpoints. Custom POST routes rely on standard Next.js App Router behaviour. Not flagged.

- **Unverified users blocked from login** — `src/auth.ts` (lines 35–40) throws `EMAIL_NOT_VERIFIED` if `EMAIL_VERIFICATION_ENABLED=true` and `emailVerified` is null, correctly blocking unverified credentials users from signing in.

- **hashedPassword not exposed to client** — `src/lib/db/profile.ts` (lines 29–51) returns `hashedPassword` as a boolean (`!!user.hashedPassword`), never exposing the hash to the client.

- **Token generation for new request clears old tokens** — `generateVerificationToken` and `generatePasswordResetToken` both call `deleteMany` for the existing email before creating a new token, preventing token accumulation and ensuring only the latest token is valid.

- **Session validated on every protected API route** — `change-password` and `delete-account` both call `auth()` and check `session?.user?.id` at the very top of the handler, returning 401 before any further processing.

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 2 |
| 🟠 High | 3 |
| 🟡 Medium | 4 |
| 🔵 Low | 3 |

**Top Priority Actions:**

1. **[CRITICAL] Fix dashboard authentication immediately** — Add `auth()` session checks and replace `DEMO_USER_ID` in `src/app/dashboard/layout.tsx` and `src/app/dashboard/page.tsx`. This is the highest severity issue as it bypasses all authentication for the entire dashboard.
2. **[CRITICAL] Add Next.js middleware** — Create `middleware.ts` at the project root to enforce authentication across all `/dashboard` routes at the edge, providing a defence-in-depth layer on top of per-page checks.
3. **[HIGH] Add maximum password length (128 chars)** — Apply to register, reset-password, and change-password routes before the `bcrypt.hash()` call to prevent CPU exhaustion attacks.
4. **[HIGH] Implement rate limiting** — Add rate limits to all custom auth API routes (login, register, forgot-password, reset-password, change-password). Use `@upstash/ratelimit` or equivalent.
5. **[HIGH] Invalidate sessions on password reset** — After a successful password reset, clear active sessions for the affected user to prevent continued access with a stolen session.
