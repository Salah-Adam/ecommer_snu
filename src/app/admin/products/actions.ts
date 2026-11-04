"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadToR2 } from "@/lib/storage";

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const productSchema = z
  .object({
    name: z.string().trim().min(3, "Name is too short").max(120),
    description: z.string().trim().min(20, "Write at least a short description (20+ characters)"),
    highlights: z.array(z.string().trim().min(1)).max(6),
    price: z.number({ message: "Enter a price" }).positive("Price must be above 0").max(100000),
    comparePrice: z.number().positive().max(100000).nullable(),
    stock: z.number().int().min(0).max(100000),
    categoryId: z.string().min(1, "Choose a category"),
    brandId: z.string().min(1, "Choose a brand"),
    images: z.array(z.url()).min(1, "Add at least one image").max(8),
    specs: z.array(z.object({ key: z.string().trim().min(1), value: z.string().trim().min(1) })).max(20),
    featured: z.boolean(),
    published: z.boolean(),
  })
  .refine((d) => d.comparePrice == null || d.comparePrice > d.price, {
    message: "Compare-at price must be higher than the price", path: ["comparePrice"],
  });

export type ProductInput = z.infer<typeof productSchema>;
export type SaveResult = { ok: true; id: string } | { ok: false; error: string; fieldErrors?: Record<string, string | undefined> };

function revalidateStore(slug?: string) {
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/products/${slug}`);
}

export async function saveProduct(id: string | null, input: ProductInput): Promise<SaveResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    const fe = z.flattenError(parsed.error).fieldErrors;
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v?.[0]])) };
  }
  const d = parsed.data;
  const data = {
    name: d.name, description: d.description, highlights: d.highlights, price: d.price, comparePrice: d.comparePrice,
    stock: d.stock, categoryId: d.categoryId, brandId: d.brandId, images: d.images,
    specs: Object.fromEntries(d.specs.map((s) => [s.key, s.value])), featured: d.featured, published: d.published,
  };

  if (id) {
    const p = await db.product.update({ where: { id }, data });
    revalidateStore(p.slug);
    return { ok: true, id: p.id };
  }

  let slug = slugify(d.name);
  if (await db.product.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  const p = await db.product.create({ data: { ...data, slug } });
  revalidateStore(p.slug);
  return { ok: true, id: p.id };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const p = await db.product.delete({ where: { id } });
  revalidateStore(p.slug);
  revalidatePath("/admin/products");
}

export async function setPublished(id: string, published: boolean) {
  await requireAdmin();
  const p = await db.product.update({ where: { id }, data: { published } });
  revalidateStore(p.slug);
  revalidatePath("/admin/products");
}

export async function updateStock(id: string, stock: number) {
  await requireAdmin();
  if (!Number.isInteger(stock) || stock < 0) return;
  const p = await db.product.update({ where: { id }, data: { stock } });
  revalidateStore(p.slug);
  revalidatePath("/admin/products");
}

/** Uploads a product image to Cloudflare R2. */
export async function uploadImage(fd: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return { error: "No file selected" };
  if (!file.type.startsWith("image/")) return { error: "Only image files are allowed" };
  if (file.size > 3.5 * 1024 * 1024) return { error: "Image must be under 3.5 MB" };
  try {
    return { url: await uploadToR2(file) };
  } catch (e) {
    console.error("[upload]", e);
    return { error: e instanceof Error ? e.message : "Upload failed" };
  }
}
