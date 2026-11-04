"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/auth/form-field";
import { signUp } from "@/lib/auth-client";
import { normalizeSomaliPhone } from "@/lib/phone";

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name"),
    email: z.email("Enter a valid email"),
    phone: z.string().refine((v) => normalizeSomaliPhone(v), "Enter a valid Somali number, e.g. 61 234 5678"),
    password: z.string().min(8, "At least 8 characters"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackURL = params.get("callbackURL") || "/account";
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string>();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parsed = schema.safeParse(Object.fromEntries(new FormData(e.currentTarget)));
    if (!parsed.success) {
      const fe = z.flattenError(parsed.error).fieldErrors;
      setErrors(Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v?.[0]])));
      return;
    }
    setErrors({});
    setFormError(undefined);
    setPending(true);
    const { name, email, phone, password } = parsed.data;
    const { error } = await signUp.email({ name, email, password, phone: normalizeSomaliPhone(phone)!, callbackURL });
    setPending(false);
    if (error) {
      setFormError(error.message ?? "Could not create account");
      return;
    }
    router.push(`/verify-email?email=${encodeURIComponent(email)}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormField id="name" label="Full name" autoComplete="name" error={errors.name} placeholder="Amina Hassan" />
      <FormField id="email" label="Email" type="email" autoComplete="email" error={errors.email} placeholder="you@example.com" />
      <FormField id="phone" label="Phone number" type="tel" autoComplete="tel" error={errors.phone} placeholder="61 234 5678" hint="Somali number (+252)" />
      <FormField id="password" label="Password" type="password" autoComplete="new-password" error={errors.password} hint="At least 8 characters" />
      <FormField id="confirm" label="Confirm password" type="password" autoComplete="new-password" error={errors.confirm} />
      {formError && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{formError}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />} Create account
      </Button>
    </form>
  );
}
