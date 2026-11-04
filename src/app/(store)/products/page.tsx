import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SlidersHorizontal, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProductGrid } from "@/components/product/product-card";
import { ProductFilters, SortSelect } from "@/components/product/product-filters";
import { getFilterOptions, searchProducts } from "@/lib/products";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Shop all products" };

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const num = (v: string | undefined) => (v && !Number.isNaN(Number(v)) ? Number(v) : undefined);

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const q = one(sp.q)?.trim() || undefined;
  const category = one(sp.category);
  const filters = {
    q, category,
    brands: one(sp.brand)?.split(",").filter(Boolean),
    min: num(one(sp.min)), max: num(one(sp.max)),
    inStock: one(sp.stock) === "1",
    deals: one(sp.deals) === "1",
    sort: one(sp.sort), page: num(one(sp.page)) ?? 1,
  };

  const [{ products, total, page, pages }, options] = await Promise.all([searchProducts(filters), getFilterOptions()]);
  const categoryName = options.categories.find((c) => c.slug === category)?.name;
  const title = q ? `Results for “${q}”` : categoryName ?? (filters.deals ? "Hot deals 🔥" : "All products");

  const pageHref = (p: number) => {
    const next = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) { const s = one(v); if (s) next.set(k, s); }
    next.set("page", String(p));
    return `/products?${next.toString()}`;
  };

  const filtersUI = (
    <Suspense>
      <ProductFilters categories={options.categories} brands={options.brands} />
    </Suspense>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link> / <span className="text-foreground">{categoryName ?? "Shop"}</span>
      </nav>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{total} {total === 1 ? "product" : "products"}</p>
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden"><SlidersHorizontal className="size-4" /> Filters</Button>
            </SheetTrigger>
            <SheetContent side="left" className="overflow-y-auto">
              <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
              <div className="px-4 pb-6">{filtersUI}</div>
            </SheetContent>
          </Sheet>
          <Suspense><SortSelect /></Suspense>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-36">{filtersUI}</div>
        </aside>
        <div>
          {products.length === 0 ? (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed py-20 text-center">
              <SearchX className="size-10 text-muted-foreground" />
              <div>
                <p className="font-semibold">No products found</p>
                <p className="text-sm text-muted-foreground">Try a different search or clear some filters.</p>
              </div>
              <Button asChild variant="outline"><Link href="/products">Clear filters</Link></Button>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}

          {pages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-1" aria-label="Pagination">
              <Button variant="outline" size="sm" asChild disabled={page <= 1} className={cn(page <= 1 && "pointer-events-none opacity-50")}>
                <Link href={pageHref(page - 1)}>Previous</Link>
              </Button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Button key={p} variant={p === page ? "default" : "ghost"} size="sm" asChild className="w-9">
                  <Link href={pageHref(p)} aria-current={p === page ? "page" : undefined}>{p}</Link>
                </Button>
              ))}
              <Button variant="outline" size="sm" asChild className={cn(page >= pages && "pointer-events-none opacity-50")}>
                <Link href={pageHref(page + 1)}>Next</Link>
              </Button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
