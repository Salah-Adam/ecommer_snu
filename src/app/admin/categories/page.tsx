import { db } from "@/lib/db";
import { PageHeader } from "../page-header";
import { TaxonomyManager } from "./taxonomy-manager";

export const metadata = { title: "Categories & brands" };

export default async function CategoriesPage() {
  const [categories, brands] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" }, include: { _count: { select: { products: true } } } }),
    db.brand.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { products: true } } } }),
  ]);
  return (
    <div>
      <PageHeader title="Categories & brands" description="Organise how products are grouped in your store" />
      <div className="grid gap-6 xl:grid-cols-2">
        <TaxonomyManager kind="category" items={categories.map((c) => ({ id: c.id, name: c.name, description: c.description, count: c._count.products }))} />
        <TaxonomyManager kind="brand" items={brands.map((b) => ({ id: b.id, name: b.name, count: b._count.products }))} />
      </div>
    </div>
  );
}
