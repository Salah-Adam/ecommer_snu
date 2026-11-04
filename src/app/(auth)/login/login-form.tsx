"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/auth/form-field";
import { signIn } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackURL = params.get("callbackURL") || "/account";
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email")).trim();
    setPending(true);
    setError(undefined);
    const { error } = await signIn.email({ email, password: String(fd.get("password")), callbackURL });
    setPending(false);
    if (error) {
      if (error.status === 403) {
        toast.info("Please verify your email first. We sent you a new link.");
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        return;
      }
      setError(error.message ?? "Invalid email or password");
      return;
    }
    toast.success("Welcome back!");
    router.push(callbackURL);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField id="email" label="Email" type="email" autoComplete="email" required placeholder="you@example.com" />
      <FormField
        id="password" label="Password" type="password" autoComplete="current-password" required
        action={<Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>}
      />
      {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} Sign in
      </Button>
    </form>
  );
}
