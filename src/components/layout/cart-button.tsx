"use client";

import { useSyncExternalStore } from "react";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cartCount, useCart } from "@/lib/cart-store";

const subscribe = () => () => {};

export function CartButton() {
  const items = useCart((s) => s.items);
  const open = useCart((s) => s.open);
  // avoid hydration mismatch: only show count on the client
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const count = mounted ? cartCount(items) : 0;

  return (
    <Button variant="ghost" size="icon" className="relative" aria-label={`Cart, ${count} items`} onClick={open}>
      <ShoppingBag className="size-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 grid min-w-5 h-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
          {count}
        </span>
      )}
    </Button>
  );
}
