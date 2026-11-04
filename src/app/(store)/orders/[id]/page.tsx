import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, CircleAlert, MapPin, Phone, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderTimeline, StatusBadge } from "@/components/orders/order-status";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { formatSomaliPhone } from "@/lib/phone";
import { paymentLabel } from "@/lib/orders";
import { ClearCartOnMount } from "./clear-cart";
import { PayNow } from "./pay-now";

export const metadata: Metadata = { title: "Order details" };

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ placed?: string }> }) {
  const { id } = await params;
  const { placed } = await searchParams;
  const { user } = await requireUser(`/orders/${id}`);
  const order = await db.order.findUnique({ where: { id }, include: { items: { include: { product: { select: { slug: true } } } } } });
  if (!order || (order.userId !== user.id && user.role !== "ADMIN")) notFound();

  const total = Number(order.total);
  const isMobile = order.paymentMethod !== "CASH_ON_DELIVERY";
  const needsPayment = isMobile && order.paymentStatus !== "PAID" && order.status !== "CANCELLED";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {placed && <ClearCartOnMount />}
      {placed && !needsPayment && (
        <div className="mb-8 flex flex-col items-center gap-2 rounded-3xl border bg-gradient-to-b from-emerald-500/10 to-transparent p-8 text-center">
          <CheckCircle2 className="size-14 text-emerald-500" />
          <h1 className="text-2xl font-bold">Thank you for your order!</h1>
          <p className="text-muted-foreground">
            {order.paymentStatus === "PAID" ? "Your payment was received." : "Please have the cash ready when your order arrives."} A confirmation was sent to {user.email}.
          </p>
        </div>
      )}
      {needsPayment && (
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 sm:flex-row sm:items-center">
          <CircleAlert className="size-8 shrink-0 text-amber-600" />
          <div className="flex-1">
            <p className="font-semibold">Payment {order.paymentStatus === "FAILED" ? "failed" : "pending"}</p>
            <p className="text-sm text-muted-foreground">Your order is reserved. Complete the payment to confirm it.</p>
          </div>
          <PayNow orderId={order.id} methodId={order.paymentMethod} amount={total} phone={order.payerPhone ?? order.phone} />
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Order</p>
          <h2 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h2>
          <p className="text-sm text-muted-foreground">Placed on {order.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={order.status} />
          <StatusBadge status={order.paymentStatus} kind="payment" />
        </div>
      </div>

      <div className="mb-6 rounded-2xl border bg-card p-6"><OrderTimeline status={order.status} /></div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <section className="rounded-2xl border bg-card">
          <h3 className="border-b px-5 py-4 font-semibold">Items</h3>
          <ul className="divide-y">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-center gap-4 px-5 py-4">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border bg-white">
                  {i.image && <Image src={i.image} alt={i.name} fill sizes="64px" className="object-contain p-1" />}
                </div>
                <div className="flex-1">
                  {i.product ? <Link href={`/products/${i.product.slug}`} className="font-medium hover:underline">{i.name}</Link> : <p className="font-medium">{i.name}</p>}
                  <p className="text-sm text-muted-foreground">{formatPrice(Number(i.unitPrice))} × {i.quantity}</p>
                </div>
                <p className="font-semibold">{formatPrice(Number(i.unitPrice) * i.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t px-5 py-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(Number(order.subtotal))}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{Number(order.deliveryFee) === 0 ? "Free" : formatPrice(Number(order.deliveryFee))}</span></div>
            <Separator />
            <div className="flex justify-between text-base font-bold"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
        </section>

        <div className="space-y-4">
          <section className="space-y-2 rounded-2xl border bg-card p-5 text-sm">
            <h3 className="mb-2 font-semibold">Delivery</h3>
            <p className="font-medium">{order.fullName}</p>
            <p className="flex gap-2 text-muted-foreground"><MapPin className="mt-0.5 size-4 shrink-0" /> {order.landmark}, {order.district}, {order.city}</p>
            <p className="flex gap-2 text-muted-foreground"><Phone className="mt-0.5 size-4 shrink-0" /> {formatSomaliPhone(order.phone)}</p>
            {order.notes && <p className="rounded-md bg-muted/50 p-2 text-xs">{order.notes}</p>}
          </section>
          <section className="space-y-2 rounded-2xl border bg-card p-5 text-sm">
            <h3 className="mb-2 font-semibold">Payment</h3>
            <p className="flex items-center gap-2"><Receipt className="size-4 text-muted-foreground" /> {paymentLabel(order.paymentMethod)}</p>
            {order.transactionRef && <p className="font-mono text-xs text-muted-foreground">Ref: {order.transactionRef}</p>}
            {order.payerPhone && <p className="text-xs text-muted-foreground">Paid from {formatSomaliPhone(order.payerPhone)}</p>}
          </section>
          <Button asChild variant="outline" className="w-full"><Link href="/account/orders">All my orders</Link></Button>
        </div>
      </div>
    </div>
  );
}
