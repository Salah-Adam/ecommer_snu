"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Filter = { param: string; label: string; options: { value: string; label: string }[] };

/** Search box + dropdown filters that sync to the URL query string. */
export function ListToolbar({ placeholder, filters = [] }: { placeholder: string; filters?: Filter[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  const push = (changes: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) (v ? next.set(k, v) : next.delete(k));
    next.delete("page");
    router.replace(`${pathname}?${next.toString()}`);
  };

  useEffect(() => {
    const t = setTimeout(() => { if (q !== (params.get("q") ?? "")) push({ q: q || null }); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      <div className="relative min-w-56 flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className="bg-card pl-9" aria-label="Search" />
      </div>
      {filters.map((f) => {
        const value = params.get(f.param) ?? "all";
        return (
          <Select key={f.param} value={value} onValueChange={(v) => push({ [f.param]: v === "all" ? null : v })}>
            <SelectTrigger className="w-44 bg-card" aria-label={f.label}>
              <SelectValue>{value === "all" ? `All ${f.label.toLowerCase()}` : f.options.find((o) => o.value === value)?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {f.label.toLowerCase()}</SelectItem>
              {f.options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        );
      })}
    </div>
  );
}
