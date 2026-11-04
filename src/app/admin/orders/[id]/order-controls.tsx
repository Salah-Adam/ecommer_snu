"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_META } from "@/components/orders/order-status";
import { markOrderPaid, updateOrderStatus } from "../actions";

const NEXT: Record<string, string> = { PENDING: "PROCESSING", PAID: "PROCESSING", PROCESSING: "SHIPPED", SHIPPED: "DELIVERED" };

export function OrderControls({ id, status, paymentStatus, isCod }: { id: string; status: string; paymentStatus: string; isCod: boolean }) {
  const [value, setValue] = useState(status);
  const [pending, start] = useTransition();
  const cancelled = status === "CANCELLED";

  const update = (s: string) =>
    start(async () => {
      if (s === "CANCELLED" && !confirm("Cancel this order? Items will be returned to stock.")) return setValue(status);
      const r = await updateOrderStatus(id, s);
      if (r.ok) { toast.success(`Order marked as ${STATUS_META[s].label}. Customer notified by email.`); setValue(s); }
      else { toast.error(r.error); setValue(status); }
    });

  return (
    <div className="space-y-4">
      {NEXT[status] && (
        <Button className="w-full" disabled={pending} onClick={() => update(NEXT[status])}>
          {pending && <Loader2 className="size-4 animate-spin" />} Mark as {STATUS_META[NEXT[status]].label}
        </Button>
      )}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">Or set status</p>
        <Select value={value} disabled={pending || cancelled} onValueChange={(s) => { setValue(s); update(s); }}>
          <SelectTrigger className="w-full"><SelectValue>{STATUS_META[value]?.label}</SelectValue></SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_META).map(([k, m]) => <SelectItem key={k} value={k}>{m.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {isCod && paymentStatus !== "PAID" && !cancelled && (
        <Button variant="outline" className="w-full" disabled={pending} onClick={() => start(async () => { await markOrderPaid(id); toast.success("Marked as paid"); })}>
          Mark cash as received
        </Button>
      )}
    </div>
  );
}
