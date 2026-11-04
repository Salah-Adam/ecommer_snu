import { Check, CircleDot, Package, PackageCheck, Truck, Wallet, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const STATUS_META: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300" },
  PAID: { label: "Paid", cls: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300" },
  PROCESSING: { label: "Processing", cls: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300" },
  SHIPPED: { label: "Shipped", cls: "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-300" },
  DELIVERED: { label: "Delivered", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" },
  CANCELLED: { label: "Cancelled", cls: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300" },
};

export const PAYMENT_STATUS_META: Record<string, { label: string; cls: string }> = {
  UNPAID: { label: "Unpaid", cls: "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300" },
  PAID: { label: "Paid", cls: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300" },
  FAILED: { label: "Failed", cls: "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300" },
};

export function StatusBadge({ status, kind = "order" }: { status: string; kind?: "order" | "payment" }) {
  const m = (kind === "order" ? STATUS_META : PAYMENT_STATUS_META)[status] ?? { label: status, cls: "" };
  return <Badge variant="outline" className={cn("border-transparent font-medium", m.cls)}>{m.label}</Badge>;
}

const STEPS = [
  { key: "PENDING", label: "Order placed", icon: CircleDot },
  { key: "PAID", label: "Confirmed", icon: Wallet },
  { key: "PROCESSING", label: "Processing", icon: Package },
  { key: "SHIPPED", label: "On the way", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: PackageCheck },
];

export function OrderTimeline({ status }: { status: string }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-destructive/10 p-4 text-destructive">
        <XCircle className="size-5" /> This order was cancelled.
      </div>
    );
  }
  const current = STEPS.findIndex((s) => s.key === status);
  return (
    <ol className="grid grid-cols-5 gap-1">
      {STEPS.map((s, i) => {
        const done = i <= current;
        const Icon = done && i < current ? Check : s.icon;
        return (
          <li key={s.key} className="relative flex flex-col items-center gap-2 text-center">
            {i > 0 && <span className={cn("absolute top-5 right-1/2 h-0.5 w-full -translate-y-1/2", i <= current ? "bg-primary" : "bg-muted")} />}
            <span className={cn("relative z-10 grid size-10 place-items-center rounded-full border-2", done ? "border-primary bg-primary text-primary-foreground" : "border-muted bg-background text-muted-foreground", i === current && "ring-4 ring-primary/20")}>
              <Icon className="size-4.5" />
            </span>
            <span className={cn("text-[11px] leading-tight sm:text-xs", done ? "font-medium" : "text-muted-foreground")}>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
