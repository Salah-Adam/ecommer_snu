"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type P = { slug: string; name: string; price: number; image: string };
type Msg = { role: "user" | "assistant"; text: string; products?: P[] };

const SUGGESTIONS = ["Laptop for university under $1000", "Best phone under $250", "How can I speed up my old PC?"];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "assistant", text: "Hi! 👋 I'm the somStore assistant. Tell me what you need and your budget, and I'll suggest products." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const next = [...msgs, { role: "user" as const, text: text.trim() }];
    setMsgs(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: next.slice(1) }) });
      const data = await res.json();
      setMsgs((m) => [...m, { role: "assistant", text: data.text, products: data.products }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", text: "Connection problem — please try again." }]);
    }
    setLoading(false);
    setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  return (
    <>
      <Button onClick={() => setOpen((o) => !o)} size="lg" aria-label={open ? "Close assistant" : "Open shopping assistant"}
        className="fixed right-4 bottom-4 z-50 size-14 rounded-full bg-gradient-to-br from-primary to-violet-600 shadow-lg">
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </Button>

      {open && (
        <div className="fixed right-4 bottom-20 z-50 flex h-[min(560px,75vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
          <div className="flex items-center gap-2 bg-gradient-to-r from-primary to-violet-600 px-4 py-3 text-white">
            <Sparkles className="size-5" />
            <div><p className="text-sm font-semibold">AI Shopping Assistant</p><p className="text-xs opacity-80">Powered by Google Gemini</p></div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {msgs.map((m, i) => (
              <div key={i} className={cn("flex flex-col gap-2", m.role === "user" && "items-end")}>
                <p className={cn("max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap", m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted")}>{m.text}</p>
                {m.products?.map((p) => (
                  <Link key={p.slug} href={`/products/${p.slug}`} onClick={() => setOpen(false)} className="flex w-[85%] items-center gap-3 rounded-xl border p-2 hover:border-primary">
                    <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-white">{p.image && <Image src={p.image} alt="" fill sizes="48px" className="object-contain p-1" />}</div>
                    <div className="min-w-0"><p className="truncate text-sm font-medium">{p.name}</p><p className="text-sm font-semibold text-primary">{formatPrice(p.price)}</p></div>
                  </Link>
                ))}
              </div>
            ))}
            {msgs.length === 1 && SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="block rounded-full border px-3 py-1.5 text-left text-xs hover:border-primary hover:text-primary">{s}</button>
            ))}
            {loading && <Loader2 className="size-5 animate-spin text-muted-foreground" />}
            <div ref={endRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2 border-t p-3">
            <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about products…" aria-label="Message" />
            <Button type="submit" size="icon" disabled={loading || !input.trim()} aria-label="Send"><Send className="size-4" /></Button>
          </form>
        </div>
      )}
    </>
  );
}
