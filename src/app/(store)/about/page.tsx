import type { Metadata } from "next";
import Link from "next/link";
import { Award, HeartHandshake, MapPin, ShieldCheck, Truck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CITIES, STORE } from "@/lib/constants";
import { db } from "@/lib/db";

export const revalidate = 3600;

export const metadata: Metadata = { title: "About us", description: `Learn about ${STORE.name}, Somalia's online electronics store.` };

export default async function AboutPage() {
  const [products, brands, orders] = await Promise.all([
    db.product.count({ where: { published: true } }),
    db.brand.count(),
    db.order.count(),
  ]);

  const stats = [
    { value: `${products}+`, label: "Products in stock" },
    { value: `${brands}+`, label: "Trusted brands" },
    { value: `${CITIES.length}`, label: "Cities we deliver to" },
    { value: `${orders}+`, label: "Orders delivered" },
  ];

  const values = [
    { icon: ShieldCheck, title: "100% genuine", text: "Every product comes from trusted suppliers and includes a warranty. No copies, no refurbished items sold as new." },
    { icon: Wallet, title: "Pay your way", text: "EVC Plus, ZAAD, Sahal, eDahab or cash on delivery — whatever is easiest for you." },
    { icon: Truck, title: "Fast delivery", text: "Same-day delivery in Mogadishu and 1–3 days to Hargeisa, Garowe, Bosaso, Kismayo and more." },
    { icon: HeartHandshake, title: "Real support", text: "Talk to a real person on the phone or WhatsApp. We help you choose the right device for your budget." },
  ];

  return (
    <div>
      <section className="border-b bg-gradient-to-b from-primary/10 to-transparent">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center">
          <p className="mb-3 text-sm font-semibold tracking-widest text-primary uppercase">About {STORE.name}</p>
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">Bringing genuine technology to every home in Somalia</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
            {STORE.name} started with a simple idea: buying a laptop or a phone in Somalia should be easy, safe and fair. We bring trusted brands online, with clear prices in USD and mobile-money payments everyone already uses.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-14 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border bg-card p-6 text-center">
            <p className="text-4xl font-bold text-primary">{s.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Our story</h2>
          <p className="text-muted-foreground leading-7">
            Too many people in Somalia have paid good money for devices that broke within weeks, or had no way to check if a product was genuine. We built {STORE.name} to change that — an online store where students, families, businesses and freelancers can compare products, read real specifications and order with confidence.
          </p>
          <p className="text-muted-foreground leading-7">
            From a first smartphone to a developer laptop or a simple RAM upgrade that brings an old PC back to life, our team helps you find the right technology for your needs and your budget.
          </p>
          <div className="flex items-center gap-3 rounded-2xl border bg-muted/30 p-4">
            <Award className="size-8 shrink-0 text-primary" />
            <p className="text-sm"><b>Our mission:</b> make reliable technology accessible and affordable for everyone in Somalia.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="rounded-2xl border bg-card p-5">
              <v.icon className="mb-3 size-6 text-primary" />
              <h3 className="font-semibold">{v.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="mb-6 text-center text-3xl font-bold tracking-tight">Where we deliver</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {CITIES.map((c) => (
            <span key={c.name} className="inline-flex items-center gap-1.5 rounded-full border bg-card px-4 py-2 text-sm">
              <MapPin className="size-4 text-primary" /> {c.name} <span className="text-muted-foreground">· ${c.fee} delivery</span>
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-primary to-violet-600 px-6 py-12 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold">Ready to upgrade your tech?</h2>
          <p className="max-w-lg opacity-90">Browse our catalog or talk to our team — we’re happy to help you choose.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" asChild><Link href="/products">Shop now</Link></Button>
            <Button size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white" asChild><Link href="/contact">Contact us</Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}
