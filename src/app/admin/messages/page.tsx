import { Inbox } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { db } from "@/lib/db";
import { PageHeader } from "../page-header";
import { MessageItem } from "./message-item";

export const metadata = { title: "Messages" };

export default async function MessagesPage() {
  const messages = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  const unread = messages.filter((m) => !m.read).length;
  return (
    <div>
      <PageHeader title="Messages" description={`${messages.length} messages from the contact form · ${unread} unread`} />
      {messages.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed bg-card py-16 text-muted-foreground"><Inbox className="size-8" /> No messages yet.</div>
      ) : (
        <Accordion type="single" collapsible className="rounded-2xl border bg-card">
          {messages.map((m) => <MessageItem key={m.id} m={{ ...m, createdAt: m.createdAt.toISOString() }} />)}
        </Accordion>
      )}
    </div>
  );
}
