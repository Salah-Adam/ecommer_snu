import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { PageHeader } from "../../page-header";
import { ProductForm, type ProductFormValues } from "../product-form";

export const metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [p, categories, brands] = await Promise.all([
    db.product.findUnique({ where: { id } }),
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    db.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!p) notFound();

  const initial: ProductFormValues = {
    name: p.name, description: p.description, highlights: p.highlights.length ? p.highlights : [""],
    price: String(Number(p.price)), comparePrice: p.comparePrice ? String(Number(p.comparePrice)) : "",
    stock: String(p.stock), categoryId: p.categoryId, brandId: p.brandId, images: p.images,
    specs: Object.entries((p.specs ?? {}) as Record<string, string>).map(([key, value]) => ({ key, value: String(value) })),
    featured: p.featured, published: p.published,
  };

  return (
    <div>
      <PageHeader title="Edit product" description={p.name}>
        <Button variant="outline" asChild><Link href={`/products/${p.slug}`} target="_blank"><ExternalLink className="size-4" /> View in store</Link></Button>
      </PageHeader>
      <ProductForm id={p.id} initial={initial} categories={categories} brands={brands} />
    </div>
  );
}
