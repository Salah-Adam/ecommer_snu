"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile, type ProfileState } from "./actions";

export function ProfileForm({ name, email, phone }: { name: string; email: string; phone: string }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(updateProfile, {});
  useEffect(() => {
    if (state.ok) toast.success("Profile updated");
    if (state.error) toast.error(state.error);
  }, [state]);

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-1.5"><Label htmlFor="name">Full name</Label><Input id="name" name="name" defaultValue={name} /></div>
      <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" value={email} disabled /></div>
      <div className="space-y-1.5"><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" defaultValue={phone} placeholder="61 234 5678" /></div>
      <div className="flex items-end"><Button type="submit" disabled={pending}>{pending && <Loader2 className="size-4 animate-spin" />} Save changes</Button></div>
    </form>
  );
}
