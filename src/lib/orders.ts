import "server-only";
import { PAYMENT_METHODS } from "@/lib/constants";
import { db } from "@/lib/db";
import { emails, sendEmail } from "@/lib/email";

export const paymentLabel = (id: string) => PAYMENT_METHODS.find((m) => m.id === id)?.name ?? id;

export function siteUrl() {
  return process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
}

export async function sendOrderConfirmation(orderId: string) {
  const o = await db.order.findUnique({ where: { id: orderId }, include: { items: true, user: true } });
  if (!o) return;
  await sendEmail({
    to: o.user.email,
    name: o.fullName,
    subject: `somStore order ${o.orderNumber} confirmed`,
    html: emails.order({
      name: o.fullName, orderNumber: o.orderNumber, url: `${siteUrl()}/orders/${o.id}`,
      paymentLabel: paymentLabel(o.paymentMethod) + (o.transactionRef ? ` (ref ${o.transactionRef})` : ""),
      paid: o.paymentStatus === "PAID",
      items: o.items.map((i) => ({ name: i.name, quantity: i.quantity, unitPrice: Number(i.unitPrice) })),
      subtotal: Number(o.subtotal), deliveryFee: Number(o.deliveryFee), total: Number(o.total),
      address: `${o.landmark}, ${o.district}, ${o.city} · ${o.phone}`,
    }),
  });
}
