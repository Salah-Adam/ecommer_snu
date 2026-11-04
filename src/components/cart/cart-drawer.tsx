"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FREE_DELIVERY_THRESHOLD } from "@/lib/constants";
import { cartCount, cartSubtotal, useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { QuantityStepper } from "./quantity-stepper";

export function CartDrawer() {
  const { items, isOpen, setOpen, setQuantity, remove, close } = useCart();
  const subtotal = cartSubtotal(items);
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Your cart ({cartCount(items)})</SheetTitle>
          <SheetDescription className="sr-only">Items in your shopping cart</SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-muted">
              <ShoppingBag className="size-7 text-muted-foreground" />
            </span>
            <div>
              <p className="font-semibold">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">Find something you love in our store.</p>
            </div>
            <Button asChild onClick={close}>
              <Link href="/products">Start shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="border-b bg-muted/40 px-4 py-3 text-xs">
              <p className="flex items-center gap-2">
                <Truck className="size-4 text-primary" />
                {remaining > 0 ? (
                  <span>Add <b>{formatPrice(remaining)}</b> more for free delivery in Mogadishu</span>
                ) : (
                  <span>You qualify for <b>free delivery</b> in Mogadishu 🎉</span>
                )}
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY_THRESHOLD) * 100)}%` }} />
              </div>
            </div>
            <ScrollArea className="min-h-0 flex-1">
              <ul className="divide-y">
                {items.map((it) => (
                  <li key={it.productId} className="flex gap-3 p-4">
                    <Link href={`/products/${it.slug}`} onClick={close} className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-white">
                      {it.image && <Image src={it.image} alt={it.name} fill sizes="80px" className="object-contain p-1.5" />}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <Link href={`/products/${it.slug}`} onClick={close} className="line-clamp-2 text-sm font-medium hover:underline">{it.name}</Link>
                      <p className="text-sm text-muted-foreground">{formatPrice(it.price)}</p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <QuantityStepper value={it.quantity} max={it.stock} onChange={(v) => setQuantity(it.productId, v)} />
                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" aria-label={`Remove ${it.name}`} onClick={() => remove(it.productId)}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
            <SheetFooter className="border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-lg font-bold">{formatPrice(subtotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Delivery fee calculated at checkout.</p>
              <Separator className="my-1" />
              <Button size="lg" asChild onClick={close}>
                <Link href="/checkout">Checkout</Link>
              </Button>
              <Button size="lg" variant="outline" asChild onClick={close}>
                <Link href="/cart">View cart</Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
