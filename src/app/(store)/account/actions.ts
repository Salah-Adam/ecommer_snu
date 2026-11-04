"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { normalizeSomaliPhone } from "@/lib/phone";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  phone: z.string().refine((v) => !v || normalizeSomaliPhone(v), "Enter a valid Somali number"),
});

export type ProfileState = { ok?: boolean; error?: string };

export async function updateProfile(_: ProfileState, fd: FormData): Promise<ProfileState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in." };
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  await db.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone ? normalizeSomaliPhone(parsed.data.phone) : null },
  });
  revalidatePath("/account", "layout");
  return { ok: true };
}
