import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { STORE, PAYMENT_METHODS } from "@/lib/constants";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">{STORE.tagline}. Genuine products, warranty on every item and fast delivery across Somalia.</p>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Shop</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link className="hover:text-foreground" href="/products?category=laptops">Laptops</Link></li>
            <li><Link className="hover:text-foreground" href="/products?category=smartphones">Smartphones</Link></li>
            <li><Link className="hover:text-foreground" href="/products?category=tablets">Tablets</Link></li>
            <li><Link className="hover:text-foreground" href="/products?sort=popular">Best sellers</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Company</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link className="hover:text-foreground" href="/about">About us</Link></li>
            <li><Link className="hover:text-foreground" href="/contact">Contact us</Link></li>
            <li><Link className="hover:text-foreground" href="/account/orders">Track your order</Link></li>
            <li><Link className="hover:text-foreground" href="/products?deals=1">Hot deals</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">Contact</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><Phone className="size-4 shrink-0" />{STORE.phone}</li>
            <li className="flex gap-2"><Mail className="size-4 shrink-0" />{STORE.email}</li>
            <li className="flex gap-2"><MapPin className="size-4 shrink-0" />{STORE.address}</li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-semibold">We accept</h3>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => (
              <span key={m.id} className="rounded-md border bg-background px-2 py-1 text-xs font-medium" style={{ color: m.color }}>
                {m.name}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {STORE.name}. All prices in USD. Payments on this site are simulated for demonstration.
        </p>
      </div>
    </footer>
  );
}
