import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { CheckoutForm } from "./checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const { user } = await requireUser("/checkout");
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-2 text-sm text-muted-foreground">
        <Link href="/cart" className="hover:text-foreground">Cart</Link> / <span className="text-foreground">Checkout</span>
      </nav>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Checkout</h1>
      <CheckoutForm user={{ name: user.name, phone: user.phone ?? null }} />
    </div>
  );
}
