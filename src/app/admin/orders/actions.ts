"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { emails, sendEmail } from "@/lib/email";
import { siteUrl } from "@/lib/orders";
import { STATUS_META } from "@/components/orders/order-status";

const STATUSES = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
type Status = (typeof STATUSES)[number];

export async function updateOrderStatus(orderId: string, status: string): Promise<{ ok: boolean; error?: string }> {
  await requireAdmin();
  if (!STATUSES.includes(status as Status)) return { ok: false, error: "Invalid status" };
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true, user: true } });
  if (!order) return { ok: false, error: "Order not found" };
  if (order.status === status) return { ok: true };
  if (order.status === "CANCELLED") return { ok: false, error: "Cancelled orders can’t be reopened." };

  await db.$transaction(async (tx) => {
    if (status === "CANCELLED") {
      // put items back in stock
      for (const it of order.items) {
        if (it.productId) await tx.product.update({ where: { id: it.productId }, data: { stock: { increment: it.quantity }, soldCount: { decrement: it.quantity } } });
      }
    }
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: status as Status,
        // cash on delivery is collected on delivery
        ...(status === "DELIVERED" && order.paymentMethod === "CASH_ON_DELIVERY" ? { paymentStatus: "PAID" as const } : {}),
      },
    });
  });

  await sendEmail({
    to: order.user.email, name: order.fullName,
    subject: `Your somStore order ${order.orderNumber} is ${STATUS_META[status].label.toLowerCase()}`,
    html: emails.status(order.fullName, order.orderNumber, STATUS_META[status].label, `${siteUrl()}/orders/${order.id}`),
  });

  revalidatePath("/admin", "layout");
  revalidatePath(`/orders/${orderId}`);
  return { ok: true };
}

export async function markOrderPaid(orderId: string) {
  await requireAdmin();
  await db.order.update({ where: { id: orderId }, data: { paymentStatus: "PAID" } });
  revalidatePath("/admin", "layout");
}
