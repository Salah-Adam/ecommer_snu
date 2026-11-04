import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export const PAGE_SIZE = 12;

const cardSelect = {
  id: true, name: true, slug: true, price: true, comparePrice: true, images: true, stock: true, featured: true,
  brand: { select: { name: true } },
  category: { select: { name: true, slug: true } },
} satisfies Prisma.ProductSelect;

type CardRow = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

export type ProductCardData = {
  id: string; name: string; slug: string; price: number; comparePrice: number | null;
  image: string; stock: number; featured: boolean; brand: string; category: string; categorySlug: string;
};

export function toCard(p: CardRow): ProductCardData {
  return {
    id: p.id, name: p.name, slug: p.slug, price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    image: p.images[0] ?? "", stock: p.stock, featured: p.featured,
    brand: p.brand.name, category: p.category.name, categorySlug: p.category.slug,
  };
}

export async function getHomeSections() {
  const base = { published: true } satisfies Prisma.ProductWhereInput;
  const [featured, bestSellers, newArrivals, deals] = await Promise.all([
    db.product.findMany({ where: { ...base, featured: true }, select: cardSelect, take: 8, orderBy: { soldCount: "desc" } }),
    db.product.findMany({ where: base, select: cardSelect, take: 8, orderBy: { soldCount: "desc" } }),
    db.product.findMany({ where: base, select: cardSelect, take: 8, orderBy: { createdAt: "desc" } }),
    db.product.findMany({ where: { ...base, comparePrice: { not: null } }, select: cardSelect, take: 4, orderBy: { soldCount: "desc" } }),
  ]);
  return {
    featured: featured.map(toCard), bestSellers: bestSellers.map(toCard),
    newArrivals: newArrivals.map(toCard), deals: deals.map(toCard),
  };
}

export type ProductFilters = {
  q?: string; category?: string; brands?: string[]; min?: number; max?: number;
  inStock?: boolean; deals?: boolean; sort?: string; page?: number;
};

const SORTS: Record<string, Prisma.ProductOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  "price-asc": { price: "asc" },
  "price-desc": { price: "desc" },
  popular: { soldCount: "desc" },
};

export async function searchProducts(f: ProductFilters) {
  const where: Prisma.ProductWhereInput = { published: true };
  if (f.category) where.category = { slug: f.category };
  if (f.brands?.length) where.brand = { slug: { in: f.brands } };
  if (f.inStock) where.stock = { gt: 0 };
  if (f.deals) where.comparePrice = { not: null };
  if (f.min != null || f.max != null) where.price = { gte: f.min, lte: f.max };
  if (f.q) {
    const terms = f.q.split(/\s+/).filter(Boolean).slice(0, 5);
    where.AND = terms.map((t) => ({
      OR: [
        { name: { contains: t, mode: "insensitive" } },
        { description: { contains: t, mode: "insensitive" } },
        { brand: { name: { contains: t, mode: "insensitive" } } },
        { category: { name: { contains: t, mode: "insensitive" } } },
      ],
    }));
  }
  const page = Math.max(1, f.page ?? 1);
  const [total, rows] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({
      where, select: cardSelect,
      orderBy: [SORTS[f.sort ?? ""] ?? SORTS.popular, { id: "asc" }],
      skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE,
    }),
  ]);
  return { total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)), products: rows.map(toCard) };
}

export async function getFilterOptions() {
  const [categories, brands, priceAgg] = await Promise.all([
    db.category.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true, slug: true, _count: { select: { products: { where: { published: true } } } } } }),
    db.brand.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true, _count: { select: { products: { where: { published: true } } } } } }),
    db.product.aggregate({ where: { published: true }, _max: { price: true } }),
  ]);
  return {
    categories: categories.map((c) => ({ name: c.name, slug: c.slug, count: c._count.products })),
    brands: brands.filter((b) => b._count.products > 0).map((b) => ({ name: b.name, slug: b.slug, count: b._count.products })),
    maxPrice: Math.ceil(Number(priceAgg._max.price ?? 2000)),
  };
}

export async function getProductBySlug(slug: string) {
  const p = await db.product.findUnique({
    where: { slug },
    include: { brand: true, category: true },
  });
  if (!p || !p.published) return null;
  return {
    id: p.id, name: p.name, slug: p.slug, description: p.description, highlights: p.highlights,
    price: Number(p.price), comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    stock: p.stock, images: p.images, specs: (p.specs ?? {}) as Record<string, string>,
    soldCount: p.soldCount, brand: { name: p.brand.name, slug: p.brand.slug },
    category: { name: p.category.name, slug: p.category.slug, id: p.categoryId },
  };
}

/** Rule-based recommendations: same category first (closest price), then same brand. */
export async function getRelatedProducts(product: { id: string; price: number; category: { id: string }; brand: { slug: string } }) {
  const rows = await db.product.findMany({
    where: {
      published: true, id: { not: product.id },
      OR: [{ categoryId: product.category.id }, { brand: { slug: product.brand.slug } }],
    },
    select: { ...cardSelect, categoryId: true },
    take: 30,
  });
  return rows
    .map((r) => ({
      r,
      score: (r.categoryId === product.category.id ? 0 : 1) * 10_000 + Math.abs(Number(r.price) - product.price),
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 4)
    .map(({ r }) => toCard(r));
}
