"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Package, User, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "@/lib/auth-client";

export function UserMenu() {
  const { data, isPending } = useSession();
  const router = useRouter();

  if (isPending || !data) {
    return (
      <Button variant="ghost" size="sm" asChild className="gap-1.5">
        <Link href="/login" aria-label="Sign in">
          <User className="size-5" />
          <span className="hidden sm:inline">Sign in</span>
        </Link>
      </Button>
    );
  }

  const initials = data.user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Account menu">
          <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{initials}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <p className="truncate font-medium">{data.user.name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">{data.user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {data.user.role === "ADMIN" && (
          <DropdownMenuItem asChild><Link href="/admin"><LayoutDashboard /> Admin dashboard</Link></DropdownMenuItem>
        )}
        <DropdownMenuItem asChild><Link href="/account"><UserCircle /> My account</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link href="/account/orders"><Package /> My orders</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
            router.push("/");
            router.refresh();
          }}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
