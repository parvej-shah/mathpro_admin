"use client";

import { useEffect } from "react";
import { getFrontendLoginUrl } from "@/lib/auth";

/**
 * Admin auth is centralized on the student Frontend. This route has no form of
 * its own — it bounces to the Frontend login, which authenticates and redirects
 * back to the admin app with the token. The shared *.mathpro.academy cookie then
 * keeps the session valid across both apps.
 */
export default function LoginPage() {
  useEffect(() => {
    window.location.replace(getFrontendLoginUrl(`${window.location.origin}/`));
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-section-a text-foreground">
      <div className="flex items-center gap-3 text-muted-foreground">
        <span className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        Redirecting to sign in…
      </div>
    </main>
  );
}
