import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone, Receipt, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { OrderTimeline, StatusBadge } from "@/components/orders/order-status";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { formatSomaliPhone } from "@/lib/phone";
import { paymentLabel } from "@/lib/orders";
import { OrderControls } from "./order-controls";

export const metadata = { title: "Order details" };

export default async function AdminOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({ where: { id }, include: { items: true, user: { include: { _count: { select: { orders: true } } } } } });
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon" asChild><Link href="/admin/orders" aria-label="Back to orders"><ArrowLeft className="size-4" /></Link></Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h1>
          <p className="text-sm text-muted-foreground">{order.createdAt.toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })}</p>
        </div>
        <StatusBadge status={order.status} />
        <StatusBadge status={order.paymentStatus} kind="payment" />
      </div>

      <div className="rounded-2xl border bg-card p-6"><OrderTimeline status={order.status} /></div>

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border bg-card">
          <h2 className="border-b px-5 py-4 font-semibold">Items ({order.items.length})</h2>
          <ul className="divide-y">
            {order.items.map((i) => (
              <li key={i.id} className="flex items-center gap-4 px-5 py-3">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border bg-white">{i.image && <Image src={i.image} alt="" fill sizes="56px" className="object-contain p-1" />}</div>
                <div className="flex-1">
                  {i.productId ? <Link href={`/admin/products/${i.productId}`} className="font-medium hover:underline">{i.name}</Link> : <p className="font-medium">{i.name}</p>}
                  <p className="text-sm text-muted-foreground">{formatPrice(Number(i.unitPrice))} × {i.quantity}</p>
                </div>
                <p className="font-semibold">{formatPrice(Number(i.unitPrice) * i.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="space-y-2 border-t px-5 py-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(Number(order.subtotal))}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery ({order.city})</span><span>{Number(order.deliveryFee) ? formatPrice(Number(order.deliveryFee)) : "Free"}</span></div>
            <Separator />
            <div className="flex justify-between text-base font-bold"><span>Total</span><span>{formatPrice(Number(order.total))}</span></div>
          </div>
        </section>

        <div className="space-y-4">
          <section className="rounded-2xl border bg-card p-5">
            <h2 className="mb-4 font-semibold">Update order</h2>
            <OrderControls id={order.id} status={order.status} paymentStatus={order.paymentStatus} isCod={order.paymentMethod === "CASH_ON_DELIVERY"} />
          </section>
          <section className="space-y-2 rounded-2xl border bg-card p-5 text-sm">
            <h2 className="mb-2 font-semibold">Customer</h2>
            <p className="flex items-center gap-2"><User className="size-4 text-muted-foreground" /> {order.user.name} <span className="text-xs text-muted-foreground">({order.user._count.orders} orders)</span></p>
            <p className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" /> <a href={`mailto:${order.user.email}`} className="hover:underline">{order.user.email}</a></p>
          </section>
          <section className="space-y-2 rounded-2xl border bg-card p-5 text-sm">
            <h2 className="mb-2 font-semibold">Delivery</h2>
            <p className="font-medium">{order.fullName}</p>
            <p className="flex gap-2 text-muted-foreground"><MapPin className="mt-0.5 size-4 shrink-0" /> {order.landmark}, {order.district}, {order.city}</p>
            <p className="flex gap-2"><Phone className="mt-0.5 size-4 shrink-0 text-muted-foreground" /> <a href={`tel:${order.phone}`} className="hover:underline">{formatSomaliPhone(order.phone)}</a></p>
            {order.notes && <p className="rounded-md bg-muted/60 p-2 text-xs">“{order.notes}”</p>}
          </section>
          <section className="space-y-1.5 rounded-2xl border bg-card p-5 text-sm">
            <h2 className="mb-2 font-semibold">Payment</h2>
            <p className="flex items-center gap-2"><Receipt className="size-4 text-muted-foreground" /> {paymentLabel(order.paymentMethod)}</p>
            {order.transactionRef && <p className="font-mono text-xs">Ref: {order.transactionRef}</p>}
            {order.payerPhone && <p className="text-xs text-muted-foreground">Payer: {formatSomaliPhone(order.payerPhone)}</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
