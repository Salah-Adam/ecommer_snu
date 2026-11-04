"use client";

import { useTransition } from "react";
import { Mail, MailOpen, Phone, Reply, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { deleteMessage, setMessageRead } from "./actions";

type Msg = { id: string; name: string; email: string; phone: string | null; subject: string; message: string; read: boolean; createdAt: string };

export function MessageItem({ m }: { m: Msg }) {
  const [pending, start] = useTransition();
  return (
    <AccordionItem value={m.id} className="px-5">
      <AccordionTrigger
        className="gap-3 hover:no-underline"
        onClick={() => { if (!m.read) start(() => setMessageRead(m.id, true)); }}
      >
        <span className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className={cn("size-2 shrink-0 rounded-full", m.read ? "bg-transparent" : "bg-primary")} aria-label={m.read ? undefined : "Unread"} />
          <span className="min-w-0 flex-1">
            <span className={cn("block truncate", !m.read && "font-semibold")}>{m.subject}</span>
            <span className="block truncate text-xs font-normal text-muted-foreground">{m.name} · {m.email}</span>
          </span>
          <span className="shrink-0 text-xs font-normal text-muted-foreground">{new Date(m.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
        </span>
      </AccordionTrigger>
      <AccordionContent className="space-y-4 pl-5">
        <p className="leading-6 whitespace-pre-wrap">{m.message}</p>
        {m.phone && <p className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="size-4" /> {m.phone}</p>}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" asChild><a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + m.subject)}`}><Reply className="size-4" /> Reply by email</a></Button>
          <Button size="sm" variant="outline" disabled={pending} onClick={() => start(() => setMessageRead(m.id, !m.read))}>
            {m.read ? <><Mail className="size-4" /> Mark unread</> : <><MailOpen className="size-4" /> Mark read</>}
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive" disabled={pending} onClick={() => confirm("Delete this message?") && start(() => deleteMessage(m.id))}>
            <Trash2 className="size-4" /> Delete
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
