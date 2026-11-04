"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { deleteBrand, deleteCategory, saveBrand, saveCategory, type Result } from "./actions";

type Item = { id: string; name: string; description?: string | null; count: number };

export function TaxonomyManager({ kind, items }: { kind: "category" | "brand"; items: Item[] }) {
  const [editing, setEditing] = useState<Item | "new" | null>(null);
  const [pending, start] = useTransition();
  const label = kind === "category" ? "Category" : "Brand";

  const run = (fn: () => Promise<Result>, msg: string, after?: () => void) =>
    start(async () => {
      const r = await fn();
      if (r.ok) { toast.success(msg); after?.(); } else toast.error(r.error);
    });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const id = editing && editing !== "new" ? editing.id : null;
    const name = String(fd.get("name") ?? "");
    run(
      () => (kind === "category" ? saveCategory(id, name, String(fd.get("description") ?? "")) : saveBrand(id, name)),
      `${label} ${id ? "updated" : "created"}`,
      () => setEditing(null)
    );
  }

  const current = editing && editing !== "new" ? editing : null;

  return (
    <section className="rounded-2xl border bg-card">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="font-semibold">{kind === "category" ? "Categories" : "Brands"}</h2>
          <p className="text-xs text-muted-foreground">{items.length} total</p>
        </div>
        <Button size="sm" onClick={() => setEditing("new")}><Plus className="size-4" /> Add {label.toLowerCase()}</Button>
      </div>
      <ul className="divide-y">
        {items.map((it) => (
          <li key={it.id} className="flex items-center gap-3 px-5 py-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{it.name}</p>
              {it.description && <p className="truncate text-xs text-muted-foreground">{it.description}</p>}
            </div>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs tabular-nums">{it.count} products</span>
            <Button variant="ghost" size="icon" aria-label={`Edit ${it.name}`} onClick={() => setEditing(it)}><Pencil className="size-4" /></Button>
            <Button
              variant="ghost" size="icon" aria-label={`Delete ${it.name}`} disabled={pending} className="text-muted-foreground hover:text-destructive"
              onClick={() => {
                if (!confirm(`Delete ${label.toLowerCase()} “${it.name}”?`)) return;
                run(() => (kind === "category" ? deleteCategory(it.id) : deleteBrand(it.id)), `${label} deleted`);
              }}
            ><Trash2 className="size-4" /></Button>
          </li>
        ))}
      </ul>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{current ? `Edit ${label.toLowerCase()}` : `New ${label.toLowerCase()}`}</DialogTitle>
              <DialogDescription>{kind === "category" ? "Categories group products in the store menu and filters." : "Brands appear on product cards and in filters."}</DialogDescription>
            </DialogHeader>
            <div className="space-y-1.5"><Label htmlFor="tx-name">Name</Label><Input id="tx-name" name="name" defaultValue={current?.name} autoFocus required /></div>
            {kind === "category" && (
              <div className="space-y-1.5"><Label htmlFor="tx-desc">Description</Label><Textarea id="tx-desc" name="description" rows={2} defaultValue={current?.description ?? ""} /></div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              <Button type="submit" disabled={pending}>{pending && <Loader2 className="size-4 animate-spin" />} Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
