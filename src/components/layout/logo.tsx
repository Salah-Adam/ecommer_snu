import Link from "next/link";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2 font-bold tracking-tight", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-violet-500 text-primary-foreground shadow-sm">
        <Zap className="size-4.5" fill="currentColor" />
      </span>
      <span className="text-lg">
        Online<span className="text-primary">Tech</span>
      </span>
    </Link>
  );
}
