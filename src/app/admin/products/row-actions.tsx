"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { deleteProduct, setPublished, updateStock } from "./actions";

export function PublishedSwitch({ id, published }: { id: string; published: boolean }) {
  const [pending, start] = useTransition();
  return (
    <Switch
      checked={published}
      disabled={pending}
      aria-label="Published"
      onCheckedChange={(v) => start(async () => { await setPublished(id, v); toast.success(v ? "Product published" : "Product hidden"); })}
    />
  );
}

export function StockInput({ id, stock }: { id: string; stock: number }) {
  const [value, setValue] = useState(String(stock));
  const [pending, start] = useTransition();
  const save = () => {
    const n = Number(value);
    if (n === stock || !Number.isInteger(n) || n < 0) return setValue(String(stock));
    start(async () => { await updateStock(id, n); toast.success("Stock updated"); });
  };
  return (
    <Input
      type="number" min={0} value={value} disabled={pending} aria-label="Stock"
      onChange={(e) => setValue(e.target.value)} onBlur={save} onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
      className={`h-8 w-20 text-center ${stock === 0 ? "border-red-400 text-red-600" : stock <= 3 ? "border-amber-400 text-amber-700" : ""}`}
    />
  );
}

export function ProductRowActions({ id, slug, name }: { id: string; slug: string; name: string }) {
  const [confirm, setConfirm] = useState(false);
  const [pending, start] = useTransition();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Actions for ${name}`}><MoreHorizontal className="size-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild><Link href={`/admin/products/${id}`}><Pencil /> Edit</Link></DropdownMenuItem>
          <DropdownMenuItem asChild><Link href={`/products/${slug}`} target="_blank"><ExternalLink /> View in store</Link></DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirm(true)}><Trash2 /> Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{name}”?</AlertDialogTitle>
            <AlertDialogDescription>This removes the product from the store. Past orders keep their item details. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              disabled={pending}
              onClick={() => start(async () => { await deleteProduct(id); toast.success("Product deleted"); })}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
