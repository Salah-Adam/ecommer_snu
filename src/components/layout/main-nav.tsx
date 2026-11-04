"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Flame } from "lucide-react";
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink,
  NavigationMenuList, NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { MAIN_LINKS, SHOP_CATEGORIES } from "./nav-links";

const linkCls = "inline-flex h-9 items-center rounded-full px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

export function MainNav() {
  const pathname = usePathname();
  const [home, ...rest] = MAIN_LINKS;

  return (
    <NavigationMenu viewport={false} className="max-w-none justify-start">
      <NavigationMenuList className="gap-0.5">
        <NavigationMenuItem>
          <NavigationMenuLink asChild>
            <Link href={home.href} className={cn(linkCls, pathname === "/" && "bg-muted text-foreground")}>{home.label}</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger className={cn("h-9 rounded-full bg-transparent px-3.5 text-muted-foreground", pathname.startsWith("/products") && "bg-muted text-foreground")}>
            Shop
          </NavigationMenuTrigger>
          <NavigationMenuContent className="z-50">
            <div className="grid w-[760px] grid-cols-[1fr_220px] gap-3 p-3">
              <ul className="grid grid-cols-2 gap-1">
                {SHOP_CATEGORIES.map((c) => (
                  <li key={c.slug}>
                    <NavigationMenuLink asChild>
                      <Link href={`/products?category=${c.slug}`} className="flex flex-row items-center gap-3 rounded-lg p-2.5 hover:bg-muted">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                          <c.icon className="size-4.5" />
                        </span>
                        <span className="flex flex-col">
                          <span className="text-sm font-medium">{c.label}</span>
                          <span className="text-xs text-muted-foreground">{c.desc}</span>
                        </span>
                      </Link>
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
              <NavigationMenuLink asChild>
                <Link
                  href="/products?deals=1"
                  className="flex flex-col justify-end gap-1 rounded-xl bg-gradient-to-br from-primary to-violet-600 p-5 text-primary-foreground"
                >
                  <Flame className="mb-auto size-7" />
                  <span className="text-lg font-bold">Hot deals</span>
                  <span className="text-xs opacity-90">Save up to 20% on laptops, phones and tablets this week.</span>
                  <span className="mt-2 flex flex-row items-center gap-1 text-sm font-semibold">Shop deals <ArrowRight className="size-4 text-primary-foreground" /></span>
                </Link>
              </NavigationMenuLink>
            </div>
            <div className="border-t p-2">
              <NavigationMenuLink asChild>
                <Link href="/products" className="flex flex-row items-center justify-center gap-1 rounded-lg p-2 text-sm font-medium text-primary hover:bg-muted">
                  Browse all products <ArrowRight className="size-4 text-primary" />
                </Link>
              </NavigationMenuLink>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>

        {rest.map((l) => {
          const base = l.href.split("?")[0];
          const active = base !== "/products" && pathname.startsWith(base);
          return (
            <NavigationMenuItem key={l.href}>
              <NavigationMenuLink asChild>
                <Link href={l.href} className={cn(linkCls, active && "bg-muted text-foreground", l.label === "Deals" && "text-rose-600 dark:text-rose-400")}>
                  {l.label}
                </Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
