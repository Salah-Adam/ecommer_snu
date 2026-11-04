import type { Metadata } from "next";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { STORE } from "@/lib/constants";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contact us" };

const FAQ = [
  { q: "How long does delivery take?", a: "Same day in Mogadishu for orders placed before 3pm. Other cities take 1–3 working days." },
  { q: "Which payment methods do you accept?", a: "EVC Plus (Hormuud), ZAAD (Telesom), Sahal (Golis), eDahab (Somtel) and cash on delivery." },
  { q: "Do your products have a warranty?", a: "Yes. Every product includes a warranty — usually 1 year. The exact warranty is listed in each product's specifications." },
  { q: "Can I exchange a product?", a: "You can exchange an unused product within 7 days of delivery. Contact us with your order number." },
];

export default function ContactPage() {
  const cards = [
    { icon: Phone, title: "Call us", text: STORE.phone, href: `tel:${STORE.phone.replace(/\s/g, "")}` },
    { icon: MessageCircle, title: "WhatsApp", text: STORE.phone, href: `https://wa.me/${STORE.phone.replace(/\D/g, "")}` },
    { icon: Mail, title: "Email", text: STORE.email, href: `mailto:${STORE.email}` },
    { icon: MapPin, title: "Visit us", text: STORE.address },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="mb-2 text-sm font-semibold tracking-widest text-primary uppercase">Contact us</p>
        <h1 className="text-4xl font-bold tracking-tight">We’re here to help</h1>
        <p className="mt-3 text-muted-foreground">Questions about a product, an order or delivery? Send us a message and our team will get back to you quickly.</p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <ContactForm />
        <div className="space-y-3">
          {cards.map((c) => {
            const inner = (
              <>
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><c.icon className="size-5" /></span>
                <span>
                  <span className="block text-sm font-semibold">{c.title}</span>
                  <span className="block text-sm text-muted-foreground">{c.text}</span>
                </span>
              </>
            );
            return c.href ? (
              <a key={c.title} href={c.href} className="flex items-center gap-4 rounded-2xl border bg-card p-4 transition-colors hover:border-primary/50">{inner}</a>
            ) : (
              <div key={c.title} className="flex items-center gap-4 rounded-2xl border bg-card p-4">{inner}</div>
            );
          })}
          <div className="flex items-center gap-4 rounded-2xl border bg-card p-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Clock className="size-5" /></span>
            <span className="text-sm"><b className="block">Opening hours</b><span className="text-muted-foreground">Saturday – Thursday, 8:00 – 21:00</span></span>
          </div>
        </div>
      </div>

      <section className="mx-auto mt-16 max-w-3xl">
        <h2 className="mb-4 text-2xl font-bold tracking-tight">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="rounded-2xl border bg-card px-5">
          {FAQ.map((f, i) => (
            <AccordionItem key={f.q} value={`q${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
