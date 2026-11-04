"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag, Zap } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

type Item = Omit<CartItem, "quantity">;

export function AddToCartButton({ item, quantity = 1, className, size = "default", compact = false }: {
  item: Item; quantity?: number; className?: string; size?: "default" | "sm" | "lg"; compact?: boolean;
}) {
  const add = useCart((s) => s.add);
  const open = useCart((s) => s.open);
  const out = item.stock <= 0;

  return (
    <Button
      size={size}
      className={cn(className)}
      disabled={out}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        add(item, quantity);
        toast.success("Added to cart", { description: item.name });
        open();
      }}
    >
      <ShoppingBag className="size-4" />
      {out ? "Out of stock" : compact ? "Add" : "Add to cart"}
    </Button>
  );
}

export function BuyNowButton({ item, quantity = 1, className }: { item: Item; quantity?: number; className?: string }) {
  const add = useCart((s) => s.add);
  const router = useRouter();
  return (
    <Button
      size="lg"
      variant="outline"
      className={className}
      disabled={item.stock <= 0}
      onClick={() => {
        add(item, quantity);
        router.push("/checkout");
      }}
    >
      <Zap className="size-4" /> Buy now
    </Button>
  );
}
