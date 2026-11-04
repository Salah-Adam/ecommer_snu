import Link from "next/link";
import { Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "./logo";
import { SearchBox } from "./search-box";
import { CartButton } from "./cart-button";
import { ThemeToggle } from "./theme-toggle";

const NAV = [
  { href: "/products?category=laptops", label: "Laptops" },
  { href: "/products?category=smartphones", label: "Phones" },
  { href: "/products?category=tablets", label: "Tablets" },
  { href: "/products?category=audio", label: "Audio" },
  { href: "/products?category=storage", label: "Storage" },
  { href: "/products?category=memory-ram", label: "RAM" },
  { href: "/products?category=chargers-and-power", label: "Chargers" },
  { href: "/products", label: "All products" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/70">
      <div className="bg-foreground text-background">
        <p className="mx-auto max-w-7xl px-4 py-1.5 text-center text-xs">
          🚚 Free delivery in Mogadishu on orders over $300 · Pay with EVC Plus, ZAAD, Sahal or eDahab
        </p>
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col px-4">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="rounded-md px-2 py-2.5 text-sm font-medium hover:bg-muted">
                  {n.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <Logo />

        <SearchBox className="mx-auto hidden max-w-xl md:block" />

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <ThemeToggle />
          <Button variant="ghost" size="icon" asChild aria-label="Account">
            <Link href="/account">
              <User className="size-5" />
            </Link>
          </Button>
          <CartButton />
        </div>
      </div>
      <div className="mx-auto px-4 pb-3 md:hidden">
        <SearchBox />
      </div>
      <nav className="mx-auto hidden max-w-7xl items-center gap-1 px-4 pb-2 lg:flex">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
