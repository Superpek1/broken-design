// Log in / sign up — one email-first form at `/login`. UI only until core-api auth exists.
import type { Metadata } from "next";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Account — Lixyte" };

export default function LoginPage() {
  return (
    <main className="relative isolate grid min-h-dvh place-items-center px-4 py-16 md:px-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_50%_25%,rgba(143,211,255,0.12),transparent_60%),radial-gradient(ellipse_at_75%_75%,rgba(184,146,255,0.10),transparent_55%)]"
      />
      <AuthForm />
    </main>
  );
}
