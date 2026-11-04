import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, STATUS_META } from "@/components/orders/order-status";
import type { Prisma } from "@/generated/prisma/client";
import { PAYMENT_METHODS } from "@/lib/constants";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { paymentLabel } from "@/lib/orders";
import { ListToolbar } from "../list-toolbar";
import { PageHeader } from "../page-header";

export const metadata = { title: "Orders" };
const PER_PAGE = 20;

type SP = Promise<{ q?: string; status?: string; payment?: string; method?: string; page?: string }>;

export default async function AdminOrders({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where: Prisma.OrderWhereInput = {};
  if (sp.q) where.OR = [
    { orderNumber: { contains: sp.q, mode: "insensitive" } },
    { fullName: { contains: sp.q, mode: "insensitive" } },
    { phone: { contains: sp.q } },
    { user: { email: { contains: sp.q, mode: "insensitive" } } },
  ];
  if (sp.status) where.status = sp.status as never;
  if (sp.payment) where.paymentStatus = sp.payment as never;
  if (sp.method) where.paymentMethod = sp.method as never;

  const [orders, total, revenue] = await Promise.all([
    db.order.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PER_PAGE, take: PER_PAGE, include: { user: { select: { name: true, email: true } }, _count: { select: { items: true } } } }),
    db.order.count({ where }),
    db.order.aggregate({ where: { ...where, paymentStatus: "PAID" }, _sum: { total: true } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const href = (p: number) => {
    const n = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]);
    n.set("page", String(p));
    return `/admin/orders?${n}`;
  };

  return (
    <div>
      <PageHeader title="Orders" description={`${total} orders · ${formatPrice(Number(revenue._sum.total ?? 0))} paid`} />
      <Suspense>
        <ListToolbar
          placeholder="Search order #, name, phone or email…"
          filters={[
            { param: "status", label: "Statuses", options: Object.entries(STATUS_META).map(([value, m]) => ({ value, label: m.label })) },
            { param: "payment", label: "Payments", options: [{ value: "PAID", label: "Paid" }, { value: "UNPAID", label: "Unpaid" }, { value: "FAILED", label: "Failed" }] },
            { param: "method", label: "Methods", options: PAYMENT_METHODS.map((m) => ({ value: m.id, label: m.name })) },
          ]}
        />
      </Suspense>
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-3 py-3 font-medium">Customer</th>
              <th className="px-3 py-3 font-medium">City</th>
              <th className="px-3 py-3 font-medium">Payment</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium text-primary hover:underline">{o.orderNumber}</Link>
                  <p className="text-xs text-muted-foreground">{o.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })} · {o._count.items} items</p>
                </td>
                <td className="px-3 py-3"><p>{o.fullName}</p><p className="text-xs text-muted-foreground">{o.user.email}</p></td>
                <td className="px-3 py-3 text-muted-foreground">{o.city}</td>
                <td className="px-3 py-3"><p className="text-xs">{paymentLabel(o.paymentMethod)}</p><StatusBadge status={o.paymentStatus} kind="payment" /></td>
                <td className="px-3 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-right font-semibold">{formatPrice(Number(o.total))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <div className="flex flex-col items-center gap-2 py-14 text-muted-foreground"><Inbox className="size-8" /> No orders found.</div>}
      </div>
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <span className="text-muted-foreground">Page {page} of {pages}</span>
          <Button variant="outline" size="icon" asChild disabled={page <= 1} className={page <= 1 ? "pointer-events-none opacity-50" : ""}><Link href={href(page - 1)} aria-label="Previous page"><ChevronLeft className="size-4" /></Link></Button>
          <Button variant="outline" size="icon" asChild className={page >= pages ? "pointer-events-none opacity-50" : ""}><Link href={href(page + 1)} aria-label="Next page"><ChevronRight className="size-4" /></Link></Button>
        </div>
      )}
    </div>
  );
}
