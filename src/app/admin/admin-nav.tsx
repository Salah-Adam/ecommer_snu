"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FolderTree, LayoutDashboard, Mail, Menu, Package, ShoppingCart, Store, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, badge: "orders" },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories & brands", icon: FolderTree },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/messages", label: "Messages", icon: Mail, badge: "messages" },
] as const;

type Counts = { orders: number; messages: number };

function NavList({ counts, onNavigate }: { counts: Counts; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {LINKS.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        const n = "badge" in l ? counts[l.badge] : 0;
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <l.icon className="size-4" />
            <span className="flex-1">{l.label}</span>
            {n > 0 && (
              <span className={cn("grid min-w-5 place-items-center rounded-full px-1.5 text-[11px] font-semibold", active ? "bg-white/20" : "bg-primary text-primary-foreground")}>
                {n}
              </span>
            )}
          </Link>
        );
      })}
      <Link href="/" onClick={onNavigate} className="mt-4 flex items-center gap-3 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
        <Store className="size-4" /> View store
      </Link>
    </nav>
  );
}

export function AdminSidebar({ counts }: { counts: Counts }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-6 border-r bg-card p-4 lg:flex">
      <div className="flex items-center gap-2 px-2 pt-1">
        <Logo />
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Admin</span>
      </div>
      <NavList counts={counts} />
    </aside>
  );
}

export function AdminMobileNav({ counts }: { counts: Counts }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open admin menu"><Menu className="size-5" /></Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-4">
        <SheetHeader className="px-0"><SheetTitle asChild><div><Logo /></div></SheetTitle><SheetDescription className="sr-only">Admin navigation</SheetDescription></SheetHeader>
        <NavList counts={counts} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
