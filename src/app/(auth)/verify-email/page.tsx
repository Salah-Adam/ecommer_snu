"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

function VerifyEmail() {
  const email = useSearchParams().get("email") ?? "";
  const [pending, setPending] = useState(false);

  return (
    <div className="space-y-6 text-center">
      <span className="mx-auto grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
        <MailCheck className="size-8" />
      </span>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          We sent a verification link to {email ? <b className="text-foreground">{email}</b> : "your email"}. Click the link to activate your account — you’ll be signed in automatically.
        </p>
        <p className="text-xs text-muted-foreground">Can’t find it? Check your spam or promotions folder.</p>
      </div>
      <Button
        variant="outline"
        className="w-full"
        disabled={!email || pending}
        onClick={async () => {
          setPending(true);
          const { error } = await authClient.sendVerificationEmail({ email, callbackURL: "/account" });
          setPending(false);
          if (error) toast.error(error.message ?? "Could not resend email");
          else toast.success("Verification email sent again");
        }}
      >
        {pending && <Loader2 className="size-4 animate-spin" />} Resend email
      </Button>
      <p className="text-sm text-muted-foreground">
        Already verified? <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}

export default function Page() {
  return <Suspense><VerifyEmail /></Suspense>;
}
