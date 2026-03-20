"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export function VerifyResultClient({ status, message }: { status: "success" | "error"; message: string }) {
  return (
    <div className="w-full max-w-sm space-y-6 text-center">
      <div>
        <h1 className="text-2xl font-bold">
          {status === "success" ? "Email Verified" : "Verification Failed"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
      {status === "success" && (
        <Link href="/sign-in" className={buttonVariants({ className: "w-full" })}>
          Sign in to DevStash
        </Link>
      )}
      {status === "error" && (
        <Link href="/register" className={buttonVariants({ variant: "outline", className: "w-full" })}>
          Back to Register
        </Link>
      )}
    </div>
  );
}
