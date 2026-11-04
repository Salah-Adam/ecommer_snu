"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Smartphone, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PAYMENT_METHODS, STORE } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import { normalizeSomaliPhone, phonePrefix, formatSomaliPhone } from "@/lib/phone";
import { payOrder } from "@/app/(store)/checkout/actions";

type Step = "phone" | "sending" | "prompt" | "processing" | "success" | "failed";

export function PaymentDialog({ open, onOpenChange, methodId, amount, defaultPhone, ensureOrder, onPaid, onClosedUnpaid }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  methodId: string;
  amount: number;
  defaultPhone?: string;
  /** Creates the order if needed and returns its id (or an error message). */
  ensureOrder: () => Promise<{ orderId: string } | { error: string }>;
  onPaid: (orderId: string) => void;
  onClosedUnpaid?: (orderId: string | null) => void;
}) {
  const method = PAYMENT_METHODS.find((m) => m.id === methodId)!;
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [error, setError] = useState<string>();
  const [orderId, setOrderId] = useState<string | null>(null);
  const [txn, setTxn] = useState("");

  const normalized = normalizeSomaliPhone(phone);
  const prefixOk = normalized && (method.prefixes as readonly string[]).includes(phonePrefix(normalized));

  async function start() {
    if (!normalized) return setError("Enter a valid Somali mobile number.");
    if (!prefixOk) return setError(`${method.name} (${method.operator}) numbers start with ${method.prefixes.join(", ")}.`);
    setError(undefined);
    setStep("sending");
    const res = await ensureOrder();
    if ("error" in res) { setError(res.error); setStep("phone"); return; }
    setOrderId(res.orderId);
    await new Promise((r) => setTimeout(r, 1500));
    setStep("prompt");
  }

  async function confirm() {
    if (!orderId) return;
    setStep("processing");
    const res = await payOrder(orderId, phone);
    if (res.ok) { setTxn(res.transactionRef); setStep("success"); }
    else { setError(res.error); setStep("failed"); }
  }

  function handleOpenChange(v: boolean) {
    if (!v && (step === "sending" || step === "processing")) return; // don't close mid-payment
    onOpenChange(v);
    if (!v) {
      if (step !== "success") onClosedUnpaid?.(orderId);
      setStep("phone");
      setError(undefined);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg text-white" style={{ background: method.color }}>
              <Smartphone className="size-4" />
            </span>
            Pay with {method.name}
          </DialogTitle>
          <DialogDescription>Simulated payment · no real money is charged</DialogDescription>
        </DialogHeader>

        {step === "phone" && (
          <div className="space-y-4">
            <div className="rounded-xl bg-muted/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">Amount to pay</p>
              <p className="text-3xl font-bold">{formatPrice(amount)}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pay-phone">{method.name} number</Label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">+252</span>
                <Input id="pay-phone" type="tel" inputMode="tel" autoFocus className="h-11 rounded-l-none" placeholder={`${method.prefixes[0]} 234 5678`} value={phone.replace(/^\+252/, "")} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <p className="text-xs text-muted-foreground">{method.operator} numbers start with {method.prefixes.join(", ")}. Tip: a number ending in 0000 simulates a failed payment.</p>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <Button size="lg" className="w-full" onClick={start}>Send payment request</Button>
          </div>
        )}

        {step === "sending" && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Loader2 className="size-10 animate-spin text-primary" />
            <p className="font-medium">Sending payment request…</p>
            <p className="text-sm text-muted-foreground">Check your phone {normalized ? formatSomaliPhone(normalized) : ""}</p>
          </div>
        )}

        {step === "prompt" && (
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground">A payment request was sent to your phone. Approve it below:</p>
            {/* mock phone screen */}
            <div className="mx-auto w-64 rounded-[2rem] border-8 border-zinc-800 bg-zinc-900 p-3 shadow-xl">
              <div className="rounded-2xl bg-zinc-100 p-4 font-mono text-[13px] text-zinc-900">
                <p className="mb-2 font-bold" style={{ color: method.color }}>{method.name}</p>
                <p>Ma u diraysaa {formatPrice(amount)} {STORE.name}?</p>
                <p className="mt-1 text-zinc-500">Pay {formatPrice(amount)} to {STORE.name}?</p>
                <p className="mt-3 text-zinc-500">1. Haa / Yes</p>
                <p className="text-zinc-500">2. Maya / No</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => { setError("You cancelled the payment."); setStep("failed"); }}>Cancel</Button>
              <Button onClick={confirm} style={{ background: method.color }} className="text-white hover:opacity-90">Confirm payment</Button>
            </div>
          </div>
        )}

        {step === "processing" && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Loader2 className="size-10 animate-spin text-primary" />
            <p className="font-medium">Processing payment…</p>
          </div>
        )}

        {step === "success" && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="size-14 text-emerald-500" />
            <p className="text-xl font-bold">Payment successful</p>
            <p className="text-sm text-muted-foreground">{formatPrice(amount)} paid via {method.name}</p>
            <p className="rounded-md bg-muted px-3 py-1 font-mono text-sm">Transaction ID: {txn}</p>
            <Button size="lg" className="mt-2 w-full" onClick={() => { onOpenChange(false); setStep("phone"); onPaid(orderId!); }}>View my order</Button>
          </div>
        )}

        {step === "failed" && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <XCircle className="size-14 text-destructive" />
            <p className="text-xl font-bold">Payment not completed</p>
            <p className="text-sm text-muted-foreground">{error}</p>
            <p className="text-xs text-muted-foreground">Your order is saved — you can try again now or later from “My orders”.</p>
            <div className="mt-2 grid w-full grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>Close</Button>
              <Button onClick={() => { setError(undefined); setStep("phone"); }}>Try again</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
