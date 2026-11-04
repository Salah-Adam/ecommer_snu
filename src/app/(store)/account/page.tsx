import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Package, Wallet } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { formatSomaliPhone } from "@/lib/phone";
import { OrdersList } from "./orders-list";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "My account" };

export default async function AccountPage() {
  const { user } = await requireUser("/account");
  const [orders, count, spent, active] = await Promise.all([
    db.order.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 3, include: { items: { select: { image: true, name: true } } } }),
    db.order.count({ where: { userId: user.id } }),
    db.order.aggregate({ where: { userId: user.id, paymentStatus: "PAID" }, _sum: { total: true } }),
    db.order.count({ where: { userId: user.id, status: { in: ["PENDING", "PAID", "PROCESSING", "SHIPPED"] } } }),
  ]);

  const stats = [
    { icon: Package, label: "Total orders", value: count },
    { icon: Clock, label: "Active orders", value: active },
    { icon: Wallet, label: "Total spent", value: formatPrice(Number(spent._sum.total ?? 0)) },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-5">
            <s.icon className="mb-2 size-5 text-primary" />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent orders</h2>
          {count > 3 && <Link href="/account/orders" className="text-sm text-primary hover:underline">View all</Link>}
        </div>
        {orders.length ? <OrdersList orders={orders} /> : <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">You haven’t placed any orders yet. <Link href="/products" className="text-primary hover:underline">Start shopping</Link></p>}
      </section>

      <section className="space-y-4 rounded-2xl border bg-card p-6">
        <h2 className="text-xl font-semibold">Profile</h2>
        <ProfileForm name={user.name} email={user.email} phone={user.phone ? formatSomaliPhone(user.phone) : ""} />
      </section>
    </div>
  );
}
