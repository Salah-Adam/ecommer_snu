import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowRight, DollarSign, Package, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, STATUS_META } from "@/components/orders/order-status";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { PageHeader } from "./page-header";
import { SalesChart } from "./sales-chart";

export const metadata = { title: "Dashboard" };

const DAY = 864e5;

export default async function AdminDashboard() {
  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * DAY);
  const since60 = new Date(now.getTime() - 60 * DAY);
  const paid = { paymentStatus: "PAID" as const, status: { not: "CANCELLED" as const } };

  const [rev30, revPrev, orders30, ordersPrev, customers, newCustomers, productCount, lowStock, recent, statusGroups, topItems, dailyOrders] = await Promise.all([
    db.order.aggregate({ where: { ...paid, createdAt: { gte: since30 } }, _sum: { total: true } }),
    db.order.aggregate({ where: { ...paid, createdAt: { gte: since60, lt: since30 } }, _sum: { total: true } }),
    db.order.count({ where: { createdAt: { gte: since30 } } }),
    db.order.count({ where: { createdAt: { gte: since60, lt: since30 } } }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.user.count({ where: { role: "CUSTOMER", createdAt: { gte: since30 } } }),
    db.product.count({ where: { published: true } }),
    db.product.findMany({ where: { stock: { lte: 3 } }, orderBy: { stock: "asc" }, take: 6, select: { id: true, name: true, stock: true, images: true } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { user: { select: { name: true } } } }),
    db.order.groupBy({ by: ["status"], _count: { _all: true } }),
    db.orderItem.groupBy({
      by: ["productId", "name"], where: { order: { status: { not: "CANCELLED" } } },
      _sum: { quantity: true }, orderBy: { _sum: { quantity: "desc" } }, take: 5,
    }),
    db.order.findMany({ where: { ...paid, createdAt: { gte: since30 } }, select: { createdAt: true, total: true } }),
  ]);

  // daily series for the chart (fill empty days with 0)
  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (let i = 29; i >= 0; i--) byDay.set(new Date(now.getTime() - i * DAY).toISOString().slice(0, 10), { revenue: 0, orders: 0 });
  for (const o of dailyOrders) {
    const k = o.createdAt.toISOString().slice(0, 10);
    const d = byDay.get(k);
    if (d) { d.revenue += Number(o.total); d.orders += 1; }
  }
  const series = [...byDay].map(([date, v]) => ({ date, ...v }));

  const revenue = Number(rev30._sum.total ?? 0);
  const prevRevenue = Number(revPrev._sum.total ?? 0);
  const change = (cur: number, prev: number) => (prev ? Math.round(((cur - prev) / prev) * 100) : null);
  const totalStatus = statusGroups.reduce((s, g) => s + g._count._all, 0) || 1;
  const topProducts = topItems.map((t) => ({ name: t.name, qty: t._sum.quantity ?? 0 }));
  const maxQty = Math.max(1, ...topProducts.map((t) => t.qty));

  const kpis = [
    { label: "Revenue (30 days)", value: formatPrice(revenue), delta: change(revenue, prevRevenue), icon: DollarSign },
    { label: "Orders (30 days)", value: orders30, delta: change(orders30, ordersPrev), icon: ShoppingCart },
    { label: "Avg. order value", value: formatPrice(dailyOrders.length ? revenue / dailyOrders.length : 0), delta: null, icon: TrendingUp },
    { label: "Customers", value: customers, sub: `+${newCustomers} this month`, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description={`Overview of your store · ${now.toLocaleDateString("en-GB", { dateStyle: "long" })}`}>
        <Button asChild><Link href="/admin/products/new"><Package className="size-4" /> Add product</Link></Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{k.label}</p>
              <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary"><k.icon className="size-4" /></span>
            </div>
            <p className="mt-2 text-3xl font-bold tracking-tight">{k.value}</p>
            {k.delta != null ? (
              <p className={`mt-1 text-xs font-medium ${k.delta >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                {k.delta >= 0 ? "▲" : "▼"} {Math.abs(k.delta)}% <span className="font-normal text-muted-foreground">vs previous 30 days</span>
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">{k.sub ?? `${productCount} products live`}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border bg-card p-5 xl:col-span-2">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-semibold">Revenue, last 30 days</h2>
              <p className="text-xs text-muted-foreground">Paid orders only · hover for daily details</p>
            </div>
            <p className="text-xl font-bold">{formatPrice(revenue)}</p>
          </div>
          <SalesChart data={series} />
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="mb-4 font-semibold">Orders by status</h2>
          <ul className="space-y-3">
            {Object.keys(STATUS_META).map((s) => {
              const n = statusGroups.find((g) => g.status === s)?._count._all ?? 0;
              return (
                <li key={s} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <StatusBadge status={s} />
                    <span className="font-medium tabular-nums">{n}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary/70" style={{ width: `${(n / totalStatus) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border bg-card xl:col-span-2">
          <div className="flex items-center justify-between border-b px-5 py-4">
            <h2 className="font-semibold">Recent orders</h2>
            <Link href="/admin/orders" className="flex items-center gap-1 text-sm text-primary hover:underline">View all <ArrowRight className="size-3.5" /></Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr><th className="px-5 py-2 font-medium">Order</th><th className="px-3 py-2 font-medium">Customer</th><th className="px-3 py-2 font-medium">Status</th><th className="px-5 py-2 text-right font-medium">Total</th></tr>
              </thead>
              <tbody className="divide-y">
                {recent.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/40">
                    <td className="px-5 py-3"><Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">{o.orderNumber}</Link><p className="text-xs text-muted-foreground">{o.createdAt.toLocaleDateString("en-GB")}</p></td>
                    <td className="px-3 py-3">{o.user.name}</td>
                    <td className="px-3 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-5 py-3 text-right font-semibold">{formatPrice(Number(o.total))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border bg-card p-5">
            <h2 className="mb-4 font-semibold">Top-selling products</h2>
            <ul className="space-y-3">
              {topProducts.map((t) => (
                <li key={t.name} className="space-y-1">
                  <div className="flex justify-between gap-2 text-sm"><span className="truncate">{t.name}</span><span className="shrink-0 font-medium tabular-nums">{t.qty} sold</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${(t.qty / maxQty) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border bg-card p-5">
            <h2 className="mb-4 flex items-center gap-2 font-semibold"><AlertTriangle className="size-4 text-amber-500" /> Low stock</h2>
            {lowStock.length === 0 ? <p className="text-sm text-muted-foreground">All products are well stocked.</p> : (
              <ul className="space-y-3">
                {lowStock.map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-md border bg-white">{p.images[0] && <Image src={p.images[0]} alt="" fill sizes="40px" className="object-contain p-0.5" />}</div>
                    <Link href={`/admin/products/${p.id}`} className="line-clamp-1 flex-1 text-sm hover:underline">{p.name}</Link>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${p.stock === 0 ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300" : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300"}`}>
                      {p.stock === 0 ? "Out" : `${p.stock} left`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
