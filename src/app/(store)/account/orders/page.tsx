import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrdersList } from "../orders-list";

export const metadata: Metadata = { title: "My orders" };

export default async function MyOrdersPage() {
  const { user } = await requireUser("/account/orders");
  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { select: { image: true, name: true } } },
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">My orders</h2>
      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <Package className="size-10 text-muted-foreground" />
          <p className="font-medium">No orders yet</p>
          <Button asChild><Link href="/products">Start shopping</Link></Button>
        </div>
      ) : (
        <OrdersList orders={orders} />
      )}
    </div>
  );
}
