"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useSyncExternalStore } from "react";
import { Banknote, Loader2, Lock, ShoppingBag, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PaymentDialog } from "@/components/checkout/payment-dialog";
import { CITIES, FREE_DELIVERY_CITY, FREE_DELIVERY_THRESHOLD, PAYMENT_METHODS, deliveryFeeFor } from "@/lib/constants";
import { cartSubtotal, useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { placeOrder } from "./actions";

const subscribe = () => () => {};

export function CheckoutForm({ user }: { user: { name: string; phone: string | null } }) {
  const router = useRouter();
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  const [city, setCity] = useState<string>("Mogadishu");
  const [method, setMethod] = useState<string>("EVC_PLUS");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [pending, setPending] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [phone, setPhone] = useState(user.phone?.replace(/^\+252/, "") ?? "");
  const formRef = useRef<HTMLFormElement>(null);
  const orderRef = useRef<{ orderId: string; total: number } | null>(null);
  const [placed, setPlaced] = useState<{ orderId: string; total: number } | null>(null);

  const subtotal = cartSubtotal(items);
  const fee = deliveryFeeFor(city, subtotal);
  const total = subtotal + fee;

  async function createOrder(): Promise<{ orderId: string } | { error: string }> {
    if (orderRef.current) return { orderId: orderRef.current.orderId };
    const fd = new FormData(formRef.current!);
    const res = await placeOrder({
      fullName: String(fd.get("fullName") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      city,
      district: String(fd.get("district") ?? ""),
      landmark: String(fd.get("landmark") ?? ""),
      notes: String(fd.get("notes") ?? ""),
      paymentMethod: method,
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    });
    if (!res.ok) {
      setErrors(res.fieldErrors ?? {});
      toast.error(res.error);
      return { error: res.error };
    }
    orderRef.current = { orderId: res.orderId, total: res.total };
    setPlaced(orderRef.current);
    clear();
    return { orderId: res.orderId };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    if (method === "CASH_ON_DELIVERY") {
      setPending(true);
      const res = await createOrder();
      setPending(false);
      if ("orderId" in res) router.push(`/orders/${res.orderId}?placed=1`);
      return;
    }
    // quick client-side check before opening the payment dialog
    const fd = new FormData(formRef.current!);
    const missing = ["fullName", "phone", "district", "landmark"].filter((k) => !String(fd.get(k) ?? "").trim());
    if (missing.length) {
      setErrors(Object.fromEntries(missing.map((k) => [k, "Required"])));
      toast.error("Please complete your delivery details.");
      return;
    }
    setPayOpen(true);
  }

  if (!mounted) return <div className="h-96 animate-pulse rounded-2xl bg-muted" />;

  if (items.length === 0 && !placed) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed py-20 text-center">
        <ShoppingBag className="size-10 text-muted-foreground" />
        <p className="font-semibold">Your cart is empty</p>
        <Button asChild><Link href="/products">Continue shopping</Link></Button>
      </div>
    );
  }

  const err = (k: string) => errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>;

  return (
    <form ref={formRef} onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[1fr_400px]" noValidate>
      <div className="space-y-8">
        <section className="space-y-4 rounded-2xl border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><span className="grid size-7 place-items-center rounded-full bg-primary text-sm text-primary-foreground">1</span> Delivery details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Receiver’s full name</Label>
              <Input id="fullName" name="fullName" defaultValue={user.name} autoComplete="name" className="h-11" />
              {err("fullName")}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">+252</span>
                <Input id="phone" name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="61 234 5678" className="h-11 rounded-l-none" />
              </div>
              {err("phone")}
            </div>
            <div className="space-y-1.5">
              <Label>City</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="h-11 w-full"><SelectValue>{city}</SelectValue></SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c.name} value={c.name}>{c.name} — {formatPrice(c.fee)} delivery</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {err("city")}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="district">District / neighbourhood</Label>
              <Input id="district" name="district" placeholder="e.g. Hodan, Wadajir, KM4" className="h-11" />
              {err("district")}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="landmark">Street / nearest landmark</Label>
            <Input id="landmark" name="landmark" placeholder="e.g. Near Makka Al-Mukarama Hotel, blue gate" className="h-11" />
            {err("landmark")}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Delivery notes (optional)</Label>
            <Textarea id="notes" name="notes" rows={2} placeholder="Best time to call, floor number…" />
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-card p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold"><span className="grid size-7 place-items-center rounded-full bg-primary text-sm text-primary-foreground">2</span> Payment method</h2>
          <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
            {PAYMENT_METHODS.map((m) => {
              const active = method === m.id;
              const Icon = m.id === "CASH_ON_DELIVERY" ? Banknote : Smartphone;
              return (
                <button
                  type="button"
                  role="radio"
                  aria-checked={active}
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={cn("flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-colors", active ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40")}
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg text-white" style={{ background: m.color }}><Icon className="size-5" /></span>
                  <span className="flex-1">
                    <span className="block font-semibold">{m.name}</span>
                    <span className="block text-xs text-muted-foreground">{m.operator}</span>
                  </span>
                  <span className={cn("size-4 rounded-full border-2", active ? "border-primary bg-primary ring-2 ring-primary/30 ring-offset-1" : "border-muted-foreground/40")} />
                </button>
              );
            })}
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="size-3.5" /> Payments are simulated for this demo — no real money is charged.</p>
        </section>
      </div>

      <aside className="h-fit space-y-4 rounded-2xl border bg-card p-6 lg:sticky lg:top-36">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <ul className="max-h-72 space-y-3 overflow-y-auto">
          {items.map((i) => (
            <li key={i.productId} className="flex gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border bg-white">
                {i.image && <Image src={i.image} alt={i.name} fill sizes="56px" className="object-contain p-1" />}
                <span className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full bg-foreground text-[10px] text-background">{i.quantity}</span>
              </div>
              <p className="line-clamp-2 flex-1 text-sm">{i.name}</p>
              <p className="text-sm font-medium">{formatPrice(i.price * i.quantity)}</p>
            </li>
          ))}
        </ul>
        <Separator />
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">Delivery to {city}</dt><dd>{fee === 0 ? <span className="font-medium text-emerald-600">Free</span> : formatPrice(fee)}</dd></div>
          {city === FREE_DELIVERY_CITY && fee > 0 && (
            <p className="text-xs text-muted-foreground">Free delivery in Mogadishu on orders over {formatPrice(FREE_DELIVERY_THRESHOLD)}.</p>
          )}
          <Separator />
          <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
        </dl>
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending && <Loader2 className="size-4 animate-spin" />}
          {method === "CASH_ON_DELIVERY" ? "Place order" : `Pay ${formatPrice(total)}`}
        </Button>
        <p className="text-center text-xs text-muted-foreground">By placing your order you agree to our delivery and exchange policy.</p>
      </aside>

      {method !== "CASH_ON_DELIVERY" && (
        <PaymentDialog
          open={payOpen}
          onOpenChange={setPayOpen}
          methodId={method}
          amount={placed?.total ?? total}
          defaultPhone={phone}
          ensureOrder={createOrder}
          onPaid={(id) => router.push(`/orders/${id}?placed=1`)}
          onClosedUnpaid={(id) => { if (id) router.push(`/orders/${id}`); }}
        />
      )}
    </form>
  );
}
