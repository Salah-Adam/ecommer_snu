import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PackageSearch, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { ListToolbar } from "../list-toolbar";
import { PageHeader } from "../page-header";
import { ProductRowActions, PublishedSwitch, StockInput } from "./row-actions";

export const metadata = { title: "Products" };

type SP = Promise<{ q?: string; category?: string; stock?: string }>;

export default async function AdminProducts({ searchParams }: { searchParams: SP }) {
  const { q, category, stock } = await searchParams;
  const where: Prisma.ProductWhereInput = {};
  if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { brand: { name: { contains: q, mode: "insensitive" } } }];
  if (category) where.category = { slug: category };
  if (stock === "low") where.stock = { gt: 0, lte: 3 };
  if (stock === "out") where.stock = 0;
  if (stock === "hidden") where.published = false;

  const [products, categories, total] = await Promise.all([
    db.product.findMany({ where, orderBy: { createdAt: "desc" }, include: { category: true, brand: true } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" } }),
    db.product.count(),
  ]);

  return (
    <div>
      <PageHeader title="Products" description={`${total} products in your catalog`}>
        <Button asChild><Link href="/admin/products/new"><Plus className="size-4" /> Add product</Link></Button>
      </PageHeader>
      <Suspense>
        <ListToolbar
          placeholder="Search by name or brand…"
          filters={[
            { param: "category", label: "Categories", options: categories.map((c) => ({ value: c.slug, label: c.name })) },
            { param: "stock", label: "Stock", options: [{ value: "low", label: "Low stock (≤3)" }, { value: "out", label: "Out of stock" }, { value: "hidden", label: "Hidden" }] },
          ]}
        />
      </Suspense>
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-3 py-3 font-medium">Category</th>
              <th className="px-3 py-3 text-right font-medium">Price</th>
              <th className="px-3 py-3 text-center font-medium">Stock</th>
              <th className="px-3 py-3 text-right font-medium">Sold</th>
              <th className="px-3 py-3 text-center font-medium">Published</th>
              <th className="px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border bg-white">
                      {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="44px" className="object-contain p-1" unoptimized={!/dummyjson|wikimedia|r2\.dev/.test(p.images[0])} />}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/admin/products/${p.id}`} className="line-clamp-1 font-medium hover:underline">{p.name}</Link>
                      <p className="text-xs text-muted-foreground">{p.brand.name}{p.featured && " · ★ Featured"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{p.category.name}</td>
                <td className="px-3 py-3 text-right">
                  <p className="font-medium">{formatPrice(Number(p.price))}</p>
                  {p.comparePrice && <p className="text-xs text-muted-foreground line-through">{formatPrice(Number(p.comparePrice))}</p>}
                </td>
                <td className="px-3 py-3"><div className="flex justify-center"><StockInput id={p.id} stock={p.stock} /></div></td>
                <td className="px-3 py-3 text-right tabular-nums">{p.soldCount}</td>
                <td className="px-3 py-3"><div className="flex justify-center"><PublishedSwitch id={p.id} published={p.published} /></div></td>
                <td className="px-3 py-3 text-right"><ProductRowActions id={p.id} slug={p.slug} name={p.name} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-14 text-center text-muted-foreground"><PackageSearch className="size-8" /> No products match your filters.</div>
        )}
      </div>
    </div>
  );
}
