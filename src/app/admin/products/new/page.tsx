import { db } from "@/lib/db";
import { PageHeader } from "../../page-header";
import { EMPTY_PRODUCT, ProductForm } from "../product-form";

export const metadata = { title: "Add product" };

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, name: true } }),
    db.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  return (
    <div>
      <PageHeader title="Add product" description="Create a new product for your store" />
      <ProductForm id={null} initial={EMPTY_PRODUCT} categories={categories} brands={brands} />
    </div>
  );
}
