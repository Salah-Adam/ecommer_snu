import { cn } from "@/lib/utils";
import { discountPercent, formatPrice } from "@/lib/format";

export function Price({ price, comparePrice, size = "md", className }: {
  price: number; comparePrice?: number | null; size?: "md" | "lg"; className?: string;
}) {
  const off = discountPercent(price, comparePrice);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2", className)}>
      <span className={cn("font-bold tracking-tight", size === "lg" ? "text-3xl" : "text-lg")}>{formatPrice(price)}</span>
      {off > 0 && (
        <>
          <span className={cn("text-muted-foreground line-through", size === "lg" ? "text-lg" : "text-sm")}>{formatPrice(comparePrice!)}</span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Save {off}%</span>
        </>
      )}
    </div>
  );
}
