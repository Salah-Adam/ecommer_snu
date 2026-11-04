"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/auth/form-field";
import { authClient } from "@/lib/auth-client";

function ResetPassword() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  if (!token || params.get("error")) {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-bold">Link expired</h1>
        <p className="text-sm text-muted-foreground">This reset link is invalid or has expired. Please request a new one.</p>
        <Button asChild className="w-full"><Link href="/forgot-password">Request new link</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Choose a new password</h1>
        <p className="text-sm text-muted-foreground">Use at least 8 characters.</p>
      </div>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const pw = String(fd.get("password"));
          if (pw.length < 8) return setError("At least 8 characters");
          if (pw !== fd.get("confirm")) return setError("Passwords do not match");
          setPending(true);
          const { error } = await authClient.resetPassword({ newPassword: pw, token });
          setPending(false);
          if (error) return setError(error.message ?? "Could not reset password");
          toast.success("Password updated. Please sign in.");
          router.push("/login");
        }}
      >
        <FormField id="password" label="New password" type="password" autoComplete="new-password" required />
        <FormField id="confirm" label="Confirm password" type="password" autoComplete="new-password" required error={error} />
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />} Update password
        </Button>
      </form>
    </div>
  );
}

export default function Page() {
  return <Suspense><ResetPassword /></Suspense>;
}
