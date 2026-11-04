"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Phone } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { STORE } from "@/lib/constants";
import { Logo } from "./logo";
import { MAIN_LINKS, SHOP_CATEGORIES } from "./nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const [home, ...rest] = MAIN_LINKS;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader className="border-b">
          <SheetTitle asChild><div onClick={close}><Logo /></div></SheetTitle>
          <SheetDescription className="sr-only">Main navigation</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col px-3">
          <Link href={home.href} onClick={close} className="rounded-md px-2 py-3 text-sm font-medium hover:bg-muted">{home.label}</Link>
          <Accordion type="single" collapsible defaultValue="shop">
            <AccordionItem value="shop" className="border-none">
              <AccordionTrigger className="px-2 py-3 text-sm font-medium hover:bg-muted hover:no-underline">Shop by category</AccordionTrigger>
              <AccordionContent className="pb-2">
                <ul className="grid grid-cols-2 gap-1">
                  {SHOP_CATEGORIES.map((c) => (
                    <li key={c.slug}>
                      <Link href={`/products?category=${c.slug}`} onClick={close} className="flex items-center gap-2 rounded-md p-2 text-sm hover:bg-muted">
                        <c.icon className="size-4 text-primary" /> {c.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          {rest.map((l) => (
            <Link key={l.href} href={l.href} onClick={close} className="rounded-md px-2 py-3 text-sm font-medium hover:bg-muted">{l.label}</Link>
          ))}
        </nav>
        <div className="mt-auto border-t p-4 text-sm text-muted-foreground">
          <p className="flex items-center gap-2"><Phone className="size-4" /> {STORE.phone}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
