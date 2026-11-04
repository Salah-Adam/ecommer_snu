"use client";

import Image from "next/image";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ArrowLeft, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/constants";
import { cartCount, cartSubtotal, useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

const subscribe = () => () => {};

export default function CartPage() {
  const { items, setQuantity, remove, clear } = useCart();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const subtotal = cartSubtotal(items);

  if (!mounted) return <div className="mx-auto h-96 max-w-6xl animate-pulse px-4 py-8" />;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Shopping cart {items.length > 0 && <span className="text-lg font-normal text-muted-foreground">({cartCount(items)} items)</span>}</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed py-20 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-muted"><ShoppingBag className="size-7 text-muted-foreground" /></span>
          <div>
            <p className="font-semibold">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Browse our catalog and add something you like.</p>
          </div>
          <Button asChild><Link href="/products">Start shopping</Link></Button>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border bg-card">
            <ul className="divide-y">
              {items.map((it) => (
                <li key={it.productId} className="flex gap-4 p-4 sm:p-5">
                  <Link href={`/products/${it.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-xl border bg-white">
                    {it.image && <Image src={it.image} alt={it.name} fill sizes="96px" className="object-contain p-2" />}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <Link href={`/products/${it.slug}`} className="line-clamp-2 font-medium hover:underline">{it.name}</Link>
                      <p className="text-sm text-muted-foreground">{formatPrice(it.price)} each</p>
                      {it.quantity >= it.stock && <p className="text-xs text-amber-600">Maximum available quantity</p>}
                    </div>
                    <QuantityStepper value={it.quantity} max={it.stock} onChange={(v) => setQuantity(it.productId, v)} />
                    <p className="w-24 font-semibold sm:text-right">{formatPrice(it.price * it.quantity)}</p>
                    <Button variant="ghost" size="icon" className="self-start text-muted-foreground sm:self-center" aria-label={`Remove ${it.name}`} onClick={() => remove(it.productId)}>
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-between border-t p-4">
              <Button variant="ghost" asChild><Link href="/products"><ArrowLeft className="size-4" /> Continue shopping</Link></Button>
              <Button variant="ghost" className="text-muted-foreground" onClick={clear}>Clear cart</Button>
            </div>
          </div>

          <aside className="h-fit space-y-4 rounded-2xl border bg-card p-6">
            <h2 className="text-lg font-semibold">Summary</h2>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery</span><span className="text-muted-foreground">Calculated at checkout</span></div>
            <Separator />
            <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
            <Button size="lg" className="w-full" asChild><Link href="/checkout">Proceed to checkout</Link></Button>
            <div className="space-y-2 pt-2 text-xs text-muted-foreground">
              <p className="flex items-center gap-2"><Truck className="size-4 text-primary" />
                {subtotal >= FREE_DELIVERY_THRESHOLD ? "Free delivery in Mogadishu" : `Spend ${formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)} more for free delivery in Mogadishu`}
              </p>
              <p className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Warranty on every product</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
