"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sendContactMessage, type ContactState } from "./actions";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(sendContactMessage, { ok: false });

  if (state.ok) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center">
        <CheckCircle2 className="size-12 text-emerald-500" />
        <p className="text-lg font-semibold">Message sent</p>
        <p className="text-sm text-muted-foreground">{state.message}</p>
      </div>
    );
  }

  const err = (k: string) => state.errors?.[k]?.[0];

  return (
    <form action={action} className="space-y-4 rounded-2xl border bg-card p-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="name" label="Full name" error={err("name")}><Input id="name" name="name" autoComplete="name" required /></Field>
        <Field id="email" label="Email" error={err("email")}><Input id="email" name="email" type="email" autoComplete="email" required /></Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="phone" label="Phone (optional)" error={err("phone")}><Input id="phone" name="phone" type="tel" placeholder="61 234 5678" /></Field>
        <Field id="subject" label="Subject" error={err("subject")}><Input id="subject" name="subject" placeholder="e.g. Laptop for university" required /></Field>
      </div>
      <Field id="message" label="Message" error={err("message")}><Textarea id="message" name="message" rows={5} required /></Field>
      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Send message
      </Button>
    </form>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
