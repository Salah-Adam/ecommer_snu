"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { CITIES, PAYMENT_METHODS, deliveryFeeFor } from "@/lib/constants";
import { db } from "@/lib/db";
import { normalizeSomaliPhone, phonePrefix } from "@/lib/phone";
import { sendOrderConfirmation } from "@/lib/orders";

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Enter the receiver's full name").max(80),
  phone: z.string().refine((v) => normalizeSomaliPhone(v), "Enter a valid Somali phone number"),
  city: z.enum(CITIES.map((c) => c.name) as [string, ...string[]], { message: "Choose a city" }),
  district: z.string().trim().min(2, "Enter your district").max(60),
  landmark: z.string().trim().min(3, "Enter a street or nearby landmark").max(140),
  notes: z.string().trim().max(300).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS.map((m) => m.id) as [string, ...string[]]),
  items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(20) })).min(1, "Your cart is empty").max(50),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type PlaceOrderResult =
  | { ok: true; orderId: string; orderNumber: string; total: number }
  | { ok: false; error: string; fieldErrors?: Record<string, string | undefined> };

function orderNumber() {
  const d = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const r = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `SS-${d}-${r}`;
}

export async function placeOrder(input: CheckoutInput): Promise<PlaceOrderResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in to place your order." };

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const fe = z.flattenError(parsed.error).fieldErrors;
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors: Object.fromEntries(Object.entries(fe).map(([k, v]) => [k, v?.[0]])) };
  }
  const data = parsed.data;

  // merge duplicate lines
  const qty = new Map<string, number>();
  for (const it of data.items) qty.set(it.productId, (qty.get(it.productId) ?? 0) + it.quantity);

  try {
    const order = await db.$transaction(async (tx) => {
      const products = await tx.product.findMany({ where: { id: { in: [...qty.keys()] }, published: true } });
      if (products.length !== qty.size) throw new Error("Some items in your cart are no longer available.");

      for (const p of products) {
        const q = qty.get(p.id)!;
        // atomic stock check + decrement
        const res = await tx.product.updateMany({
          where: { id: p.id, stock: { gte: q } },
          data: { stock: { decrement: q }, soldCount: { increment: q } },
        });
        if (res.count === 0) throw new Error(`Sorry, only ${p.stock} × ${p.name} left in stock.`);
      }

      const subtotal = products.reduce((s, p) => s + Number(p.price) * qty.get(p.id)!, 0);
      const deliveryFee = deliveryFeeFor(data.city, subtotal);

      return tx.order.create({
        data: {
          orderNumber: orderNumber(),
          userId: session.user.id,
          paymentMethod: data.paymentMethod as never,
          subtotal, deliveryFee, total: subtotal + deliveryFee,
          fullName: data.fullName, phone: normalizeSomaliPhone(data.phone)!,
          city: data.city, district: data.district, landmark: data.landmark, notes: data.notes || null,
          items: {
            create: products.map((p) => ({
              productId: p.id, name: p.name, image: p.images[0] ?? null, unitPrice: p.price, quantity: qty.get(p.id)!,
            })),
          },
        },
      });
    });

    if (data.paymentMethod === "CASH_ON_DELIVERY") await sendOrderConfirmation(order.id);
    revalidatePath("/account");
    return { ok: true, orderId: order.id, orderNumber: order.orderNumber, total: Number(order.total) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Could not place order. Please try again." };
  }
}

export type PayResult = { ok: true; transactionRef: string } | { ok: false; error: string };

/** Simulated mobile-money payment. Numbers ending in 0000 fail (insufficient balance). */
export async function payOrder(orderId: string, rawPhone: string): Promise<PayResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: "Please sign in." };

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || order.userId !== session.user.id) return { ok: false, error: "Order not found." };
  if (order.paymentStatus === "PAID") return { ok: true, transactionRef: order.transactionRef ?? "" };
  if (order.status === "CANCELLED") return { ok: false, error: "This order was cancelled." };

  const method = PAYMENT_METHODS.find((m) => m.id === order.paymentMethod);
  if (!method || method.id === "CASH_ON_DELIVERY") return { ok: false, error: "This order is cash on delivery." };

  const phone = normalizeSomaliPhone(rawPhone);
  if (!phone) return { ok: false, error: "Enter a valid Somali mobile number." };
  if (!(method.prefixes as readonly string[]).includes(phonePrefix(phone)))
    return { ok: false, error: `${method.name} numbers start with ${method.prefixes.join(", ")}.` };

  await new Promise((r) => setTimeout(r, 1200)); // simulate network/operator latency

  if (phone.endsWith("0000")) {
    await db.order.update({ where: { id: orderId }, data: { paymentStatus: "FAILED", payerPhone: phone } });
    return { ok: false, error: `Payment declined by ${method.name}: insufficient balance.` };
  }

  const transactionRef = `TXN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  await db.order.update({
    where: { id: orderId },
    data: { paymentStatus: "PAID", status: "PAID", payerPhone: phone, transactionRef },
  });
  await sendOrderConfirmation(orderId);
  revalidatePath(`/orders/${orderId}`);
  return { ok: true, transactionRef };
}
