"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Option = { name: string; slug: string; count: number };

function useParamUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const update = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v == null || v === "") next.delete(k);
      else next.set(k, v);
    }
    next.delete("page");
    start(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
  };
  return { params, update, pending };
}

export function ProductFilters({ categories, brands, className }: { categories: Option[]; brands: Option[]; className?: string }) {
  const { params, update, pending } = useParamUpdater();
  const category = params.get("category");
  const selectedBrands = params.get("brand")?.split(",").filter(Boolean) ?? [];
  const [min, setMin] = useState(params.get("min") ?? "");
  const [max, setMax] = useState(params.get("max") ?? "");

  return (
    <div className={cn("space-y-7 transition-opacity", pending && "opacity-60", className)}>
      <section>
        <h3 className="mb-2 text-sm font-semibold">Category</h3>
        <ul className="space-y-0.5">
          <li>
            <button onClick={() => update({ category: null })} className={cn("w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted", !category && "bg-muted font-medium")}>
              All categories
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <button
                onClick={() => update({ category: c.slug })}
                className={cn("flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted", category === c.slug && "bg-primary/10 font-medium text-primary")}
              >
                {c.name} <span className="text-xs text-muted-foreground">{c.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">Price (USD)</h3>
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            update({ min: min || null, max: max || null });
          }}
        >
          <Input type="number" min={0} inputMode="numeric" placeholder="Min" value={min} onChange={(e) => setMin(e.target.value)} aria-label="Minimum price" className="h-9" />
          <span className="text-muted-foreground">–</span>
          <Input type="number" min={0} inputMode="numeric" placeholder="Max" value={max} onChange={(e) => setMax(e.target.value)} aria-label="Maximum price" className="h-9" />
          <Button type="submit" size="sm" variant="secondary">Go</Button>
        </form>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[[0, 100], [100, 300], [300, 700], [700, null]].map(([lo, hi]) => (
            <button
              key={`${lo}-${hi}`}
              className="rounded-full border px-2.5 py-1 text-xs hover:border-primary hover:text-primary"
              onClick={() => {
                setMin(String(lo)); setMax(hi ? String(hi) : "");
                update({ min: String(lo), max: hi ? String(hi) : null });
              }}
            >
              {hi ? `$${lo}–$${hi}` : `$${lo}+`}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-semibold">Brand</h3>
        <ul className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {brands.map((b) => {
            const checked = selectedBrands.includes(b.slug);
            return (
              <li key={b.slug} className="flex items-center gap-2">
                <Checkbox
                  id={`brand-${b.slug}`}
                  checked={checked}
                  onCheckedChange={(v) => {
                    const next = v ? [...selectedBrands, b.slug] : selectedBrands.filter((s) => s !== b.slug);
                    update({ brand: next.join(",") || null });
                  }}
                />
                <Label htmlFor={`brand-${b.slug}`} className="flex-1 cursor-pointer font-normal">{b.name}</Label>
                <span className="text-xs text-muted-foreground">{b.count}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="flex items-center justify-between">
        <Label htmlFor="in-stock" className="text-sm font-semibold">In stock only</Label>
        <Switch id="in-stock" checked={params.get("stock") === "1"} onCheckedChange={(v) => update({ stock: v ? "1" : null })} />
      </section>

      <Button variant="outline" className="w-full" onClick={() => { setMin(""); setMax(""); update({ category: null, brand: null, min: null, max: null, stock: null, q: null, deals: null }); }}>
        Clear all filters
      </Button>
    </div>
  );
}

const SORT_LABELS: Record<string, string> = {
  popular: "Most popular", newest: "Newest", "price-asc": "Price: low to high", "price-desc": "Price: high to low",
};

export function SortSelect() {
  const { params, update } = useParamUpdater();
  const value = params.get("sort") ?? "popular";
  return (
    <Select value={value} onValueChange={(v) => update({ sort: v === "popular" ? null : v })}>
      <SelectTrigger className="w-48" aria-label="Sort products">
        <SelectValue>{SORT_LABELS[value] ?? "Most popular"}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(SORT_LABELS).map(([v, label]) => (
          <SelectItem key={v} value={v}>{label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
