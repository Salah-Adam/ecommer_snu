import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/orders/order-status";
import { formatPrice } from "@/lib/format";

type Row = {
  id: string; orderNumber: string; status: string; paymentStatus: string; total: unknown; createdAt: Date;
  items: { image: string | null; name: string }[];
};

export function OrdersList({ orders }: { orders: Row[] }) {
  return (
    <ul className="divide-y rounded-2xl border bg-card">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={`/orders/${o.id}`} className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/40">
            <div className="flex -space-x-3">
              {o.items.slice(0, 3).map((it, i) => (
                <div key={i} className="relative size-12 overflow-hidden rounded-lg border-2 border-background bg-white">
                  {it.image && <Image src={it.image} alt={it.name} fill sizes="48px" className="object-contain p-1" />}
                </div>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium">{o.orderNumber}</p>
              <p className="text-xs text-muted-foreground">
                {o.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · {o.items.length} {o.items.length === 1 ? "item" : "items"}
              </p>
            </div>
            <div className="hidden gap-1.5 sm:flex">
              <StatusBadge status={o.status} />
              <StatusBadge status={o.paymentStatus} kind="payment" />
            </div>
            <p className="w-20 text-right font-semibold">{formatPrice(Number(o.total))}</p>
            <ChevronRight className="size-4 text-muted-foreground" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
