"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const slugify = (s: string) =>
  s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const nameSchema = z.string().trim().min(2, "Name is too short").max(60);

export type Result = { ok: true } | { ok: false; error: string };

function done(): Result {
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveCategory(id: string | null, name: string, description: string): Promise<Result> {
  await requireAdmin();
  const n = nameSchema.safeParse(name);
  if (!n.success) return { ok: false, error: n.error.issues[0].message };
  const data = { name: n.data, slug: slugify(n.data), description: description.trim() || null };
  try {
    if (id) await db.category.update({ where: { id }, data });
    else {
      const max = await db.category.aggregate({ _max: { sortOrder: true } });
      await db.category.create({ data: { ...data, image: "laptop", sortOrder: (max._max.sortOrder ?? 0) + 1 } });
    }
  } catch {
    return { ok: false, error: "A category with this name already exists." };
  }
  return done();
}

export async function deleteCategory(id: string): Promise<Result> {
  await requireAdmin();
  const count = await db.product.count({ where: { categoryId: id } });
  if (count) return { ok: false, error: `Move or delete its ${count} products first.` };
  await db.category.delete({ where: { id } });
  return done();
}

export async function saveBrand(id: string | null, name: string): Promise<Result> {
  await requireAdmin();
  const n = nameSchema.safeParse(name);
  if (!n.success) return { ok: false, error: n.error.issues[0].message };
  try {
    if (id) await db.brand.update({ where: { id }, data: { name: n.data, slug: slugify(n.data) } });
    else await db.brand.create({ data: { name: n.data, slug: slugify(n.data) } });
  } catch {
    return { ok: false, error: "A brand with this name already exists." };
  }
  return done();
}

export async function deleteBrand(id: string): Promise<Result> {
  await requireAdmin();
  const count = await db.product.count({ where: { brandId: id } });
  if (count) return { ok: false, error: `Move or delete its ${count} products first.` };
  await db.brand.delete({ where: { id } });
  return done();
}
