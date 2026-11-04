"use client";

import { useState } from "react";
import { QuantityStepper } from "@/components/cart/quantity-stepper";
import type { CartItem } from "@/lib/cart-store";
import { AddToCartButton, BuyNowButton } from "./add-to-cart-button";

export function ProductPurchase({ item }: { item: Omit<CartItem, "quantity"> }) {
  const [qty, setQty] = useState(1);
  const out = item.stock <= 0;
  return (
    <div className="space-y-4">
      {!out && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Quantity</span>
          <QuantityStepper size="md" value={qty} max={item.stock} onChange={(v) => setQty(Math.max(1, Math.min(v, item.stock)))} />
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <AddToCartButton size="lg" item={item} quantity={qty} />
        <BuyNowButton item={item} quantity={qty} />
      </div>
    </div>
  );
}
