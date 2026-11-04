"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Package, UserCircle } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function AccountNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const links = [
    { href: "/account", label: "Overview", icon: UserCircle },
    { href: "/account/orders", label: "My orders", icon: Package },
    ...(isAdmin ? [{ href: "/admin", label: "Admin dashboard", icon: LayoutDashboard }] : []),
  ];
  const cls = "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors";
  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={cn(cls, pathname === l.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
          <l.icon className="size-4" /> {l.label}
        </Link>
      ))}
      <button
        className={cn(cls, "text-muted-foreground hover:bg-muted hover:text-foreground")}
        onClick={async () => { await signOut(); router.push("/"); router.refresh(); }}
      >
        <LogOut className="size-4" /> Sign out
      </button>
    </nav>
  );
}
