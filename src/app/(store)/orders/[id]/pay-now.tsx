"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaymentDialog } from "@/components/checkout/payment-dialog";
import { PAYMENT_METHODS } from "@/lib/constants";

export function PayNow({ orderId, methodId, amount, phone }: { orderId: string; methodId: string; amount: number; phone?: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const m = PAYMENT_METHODS.find((x) => x.id === methodId);
  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)} style={{ background: m?.color }} className="text-white hover:opacity-90">
        <Smartphone className="size-4" /> Pay now with {m?.name}
      </Button>
      <PaymentDialog
        open={open}
        onOpenChange={setOpen}
        methodId={methodId}
        amount={amount}
        defaultPhone={phone}
        ensureOrder={async () => ({ orderId })}
        onPaid={() => router.refresh()}
      />
    </>
  );
}
