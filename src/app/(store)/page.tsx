import Link from "next/link";
import {
  ArrowRight, BatteryCharging, HardDrive, Headphones, Keyboard, Laptop, MemoryStick,
  Monitor, ShieldCheck, Smartphone, Tablet, Truck, Wallet, Watch, type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const ICONS: Record<string, LucideIcon> = {
  laptop: Laptop, monitor: Monitor, smartphone: Smartphone, tablet: Tablet, headphones: Headphones,
  keyboard: Keyboard, "hard-drive": HardDrive, "memory-stick": MemoryStick, "battery-charging": BatteryCharging, watch: Watch,
};

export default async function HomePage() {
  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { published: true } } } } },
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at top right, color-mix(in oklch, var(--primary) 20%, transparent), transparent 60%), radial-gradient(ellipse at bottom left, rgb(139 92 246 / 0.12), transparent 55%)",
          }}
        />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 md:py-24 lg:grid-cols-2">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium">
              <span className="size-2 rounded-full bg-green-500" /> Now delivering to 8 cities across Somalia
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Genuine electronics, <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">delivered to your door.</span>
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              Laptops, smartphones, tablets, RAM, SSDs, chargers and more — with warranty on every item. Pay easily with mobile money.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link href="/products">Shop now <ArrowRight className="size-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/products?category=laptops">Browse laptops</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            {[
              { icon: Truck, title: "Fast delivery", text: "Same-day in Mogadishu" },
              { icon: ShieldCheck, title: "Warranty", text: "On every product" },
              { icon: Wallet, title: "Mobile money", text: "EVC, ZAAD, Sahal, eDahab" },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border bg-card p-4 shadow-sm">
                <f.icon className="mb-3 size-6 text-primary" />
                <p className="font-semibold">{f.title}</p>
                <p className="text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Shop by category</h2>
          <Link href="/products" className="text-sm font-medium text-primary hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => {
            const Icon = ICONS[c.image ?? ""] ?? Laptop;
            return (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="group rounded-2xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
              >
                <span className="mb-4 grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" />
                </span>
                <p className="font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c._count.products} products</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
