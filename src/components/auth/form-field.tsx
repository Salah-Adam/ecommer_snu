"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function FormField({ id, label, error, hint, action, ...props }: React.ComponentProps<typeof Input> & {
  id: string; label: string; error?: string; hint?: string; action?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const isPassword = props.type === "password";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {action}
      </div>
      <div className="relative">
        <Input id={id} name={id} aria-invalid={!!error} {...props} type={isPassword && show ? "text" : props.type} className="h-11" />
        {isPassword && (
          <button type="button" onClick={() => setShow((s) => !s)} className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
