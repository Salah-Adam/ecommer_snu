"use server";

import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.email("Please enter a valid email"),
  phone: z.string().trim().max(20).optional(),
  subject: z.string().trim().min(3, "Please add a subject").max(120),
  message: z.string().trim().min(10, "Message is too short").max(2000),
});

export type ContactState = { ok: boolean; message?: string; errors?: Record<string, string[] | undefined> };

export async function sendContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors };
  await db.contactMessage.create({ data: { ...parsed.data, phone: parsed.data.phone || null } });
  return { ok: true, message: "Thanks! Your message has been sent. We usually reply within a few hours." };
}
