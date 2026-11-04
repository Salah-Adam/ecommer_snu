"use client";

import Link from "next/link";
import { useState } from "react";
import { KeyRound, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/auth/form-field";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState("");

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10 text-primary"><MailCheck className="size-8" /></span>
        <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">If an account exists for <b className="text-foreground">{sent}</b>, you’ll receive a password reset link shortly.</p>
        <Button asChild variant="outline" className="w-full"><Link href="/login">Back to sign in</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <span className="mb-3 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"><KeyRound className="size-6" /></span>
        <h1 className="text-2xl font-bold tracking-tight">Forgot your password?</h1>
        <p className="text-sm text-muted-foreground">Enter your email and we’ll send you a reset link.</p>
      </div>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const email = String(new FormData(e.currentTarget).get("email")).trim();
          setPending(true);
          await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" });
          setPending(false);
          setSent(email);
        }}
      >
        <FormField id="email" label="Email" type="email" autoComplete="email" required />
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />} Send reset link
        </Button>
      </form>
      <p className="text-center text-sm"><Link href="/login" className="text-primary hover:underline">Back to sign in</Link></p>
    </div>
  );
}
