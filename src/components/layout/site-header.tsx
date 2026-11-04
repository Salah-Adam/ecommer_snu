import { Phone } from "lucide-react";
import { STORE } from "@/lib/constants";
import { Logo } from "./logo";
import { SearchBox } from "./search-box";
import { CartButton } from "./cart-button";
import { ThemeToggle } from "./theme-toggle";
import { MainNav } from "./main-nav";
import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-lg supports-[backdrop-filter]:bg-background/75">
      <div className="bg-foreground text-background">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-4 py-1.5 text-xs sm:justify-between">
          <p>🚚 Free delivery in Mogadishu on orders over $300</p>
          <p className="hidden items-center gap-1.5 sm:flex"><Phone className="size-3" /> {STORE.phone} · Sat–Thu, 8am–9pm</p>
        </div>
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <MobileNav />
        <Logo />
        <SearchBox className="mx-auto hidden max-w-xl md:block" />
        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <ThemeToggle />
          <UserMenu />
          <CartButton />
        </div>
      </div>
      <div className="mx-auto px-4 pb-3 md:hidden">
        <SearchBox />
      </div>
      <div className="mx-auto hidden max-w-7xl px-4 pb-2 lg:block">
        <MainNav />
      </div>
    </header>
  );
}
