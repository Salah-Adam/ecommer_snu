"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function QuantityStepper({ value, max, onChange, className, size = "sm" }: {
  value: number; max: number; onChange: (v: number) => void; className?: string; size?: "sm" | "md";
}) {
  const btn = size === "sm" ? "size-7" : "size-10";
  return (
    <div className={cn("inline-flex items-center rounded-full border", className)}>
      <Button type="button" variant="ghost" size="icon" className={cn("rounded-full", btn)} aria-label="Decrease quantity" onClick={() => onChange(value - 1)} disabled={value <= 1}>
        <Minus className="size-3.5" />
      </Button>
      <span className={cn("text-center text-sm font-medium tabular-nums", size === "sm" ? "w-7" : "w-10")} aria-live="polite">{value}</span>
      <Button type="button" variant="ghost" size="icon" className={cn("rounded-full", btn)} aria-label="Increase quantity" onClick={() => onChange(value + 1)} disabled={value >= max}>
        <Plus className="size-3.5" />
      </Button>
    </div>
  );
}
