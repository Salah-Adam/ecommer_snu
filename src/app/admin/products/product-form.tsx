"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ArrowLeft, ImagePlus, Link2, Loader2, Plus, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Price } from "@/components/product/price";
import { cn } from "@/lib/utils";
import { saveProduct, uploadImage, type ProductInput } from "./actions";

type Option = { id: string; name: string };

export type ProductFormValues = {
  name: string; description: string; highlights: string[]; price: string; comparePrice: string; stock: string;
  categoryId: string; brandId: string; images: string[]; specs: { key: string; value: string }[];
  featured: boolean; published: boolean;
};

export const EMPTY_PRODUCT: ProductFormValues = {
  name: "", description: "", highlights: [""], price: "", comparePrice: "", stock: "10", categoryId: "", brandId: "",
  images: [], specs: [{ key: "Warranty", value: "1 year" }], featured: false, published: true,
};

export function ProductForm({ id, initial, categories, brands }: {
  id: string | null; initial: ProductFormValues; categories: Option[]; brands: Option[];
}) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [saving, startSave] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProductFormValues>(k: K, val: ProductFormValues[K]) => setV((s) => ({ ...s, [k]: val }));
  const apply = (patch: Partial<ProductFormValues>) => setV((s) => ({ ...s, ...patch }));
  const err = (k: string) => errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>;

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    for (const f of Array.from(files).slice(0, 8 - v.images.length)) {
      const fd = new FormData();
      fd.set("file", f);
      const res = await uploadImage(fd);
      if (res.url) setV((s) => ({ ...s, images: [...s.images, res.url!] }));
      else toast.error(res.error);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function addUrl() {
    try {
      const u = new URL(urlInput.trim());
      set("images", [...v.images, u.toString()]);
      setUrlInput("");
    } catch {
      toast.error("Enter a valid image URL");
    }
  }

  function submit() {
    const input: ProductInput = {
      name: v.name, description: v.description,
      highlights: v.highlights.map((h) => h.trim()).filter(Boolean),
      price: Number(v.price), comparePrice: v.comparePrice ? Number(v.comparePrice) : null,
      stock: Number(v.stock || 0), categoryId: v.categoryId, brandId: v.brandId, images: v.images,
      specs: v.specs.filter((s) => s.key.trim() && s.value.trim()), featured: v.featured, published: v.published,
    };
    startSave(async () => {
      const res = await saveProduct(id, input);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
        return;
      }
      toast.success(id ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    });
  }

  const categoryName = categories.find((c) => c.id === v.categoryId)?.name;
  const brandName = brands.find((b) => b.id === v.brandId)?.name;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">Basic information</h2>
          <div className="space-y-1.5">
            <Label htmlFor="name">Product name</Label>
            <Input id="name" value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. HP EliteBook 840 G8" />
            {err("name")}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={v.categoryId} onValueChange={(x) => set("categoryId", x)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Choose category">{categoryName}</SelectValue></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              {err("categoryId")}
            </div>
            <div className="space-y-1.5">
              <Label>Brand</Label>
              <Select value={v.brandId} onValueChange={(x) => set("brandId", x)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Choose brand">{brandName}</SelectValue></SelectTrigger>
                <SelectContent>{brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
              </Select>
              {err("brandId")}
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="description">Description</Label>
              {/* AI_SLOT */}
            </div>
            <Textarea id="description" rows={6} value={v.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the product for customers…" />
            {err("description")}
          </div>
          <div className="space-y-2">
            <Label>Highlights (shown as bullet points)</Label>
            {v.highlights.map((h, i) => (
              <div key={i} className="flex gap-2">
                <Input value={h} onChange={(e) => set("highlights", v.highlights.map((x, j) => (j === i ? e.target.value : x)))} placeholder="e.g. 16 GB RAM for smooth multitasking" />
                <Button type="button" variant="ghost" size="icon" aria-label="Remove highlight" onClick={() => set("highlights", v.highlights.filter((_, j) => j !== i))}><X className="size-4" /></Button>
              </div>
            ))}
            {v.highlights.length < 6 && <Button type="button" variant="outline" size="sm" onClick={() => set("highlights", [...v.highlights, ""])}><Plus className="size-4" /> Add highlight</Button>}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">Images</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {v.images.map((src, i) => (
              <div key={src + i} className={cn("group relative aspect-square overflow-hidden rounded-xl border bg-white", i === 0 && "ring-2 ring-primary")}>
                <Image src={src} alt="" fill sizes="150px" className="object-contain p-2" unoptimized={!/dummyjson|wikimedia|r2\.dev/.test(src)} />
                {i === 0 && <span className="absolute top-1.5 left-1.5 rounded bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">Main</span>}
                <div className="absolute inset-x-1.5 bottom-1.5 flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {i > 0 && <Button type="button" size="icon" variant="secondary" className="size-7" aria-label="Make main image" onClick={() => set("images", [src, ...v.images.filter((_, j) => j !== i)])}><Star className="size-3.5" /></Button>}
                  <Button type="button" size="icon" variant="destructive" className="size-7" aria-label="Remove image" onClick={() => set("images", v.images.filter((_, j) => j !== i))}><Trash2 className="size-3.5" /></Button>
                </div>
              </div>
            ))}
            {v.images.length < 8 && (
              <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                {uploading ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
                {uploading ? "Uploading…" : "Upload"}
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())} placeholder="…or paste an image URL" />
            </div>
            <Button type="button" variant="outline" onClick={addUrl} disabled={!urlInput}>Add</Button>
          </div>
          {err("images")}
        </section>

        <section className="space-y-3 rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">Specifications</h2>
          {v.specs.map((s, i) => (
            <div key={i} className="grid grid-cols-[1fr_1.5fr_auto] gap-2">
              <Input value={s.key} placeholder="e.g. RAM" onChange={(e) => set("specs", v.specs.map((x, j) => (j === i ? { ...x, key: e.target.value } : x)))} />
              <Input value={s.value} placeholder="e.g. 16 GB DDR4" onChange={(e) => set("specs", v.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
              <Button type="button" variant="ghost" size="icon" aria-label="Remove spec" onClick={() => set("specs", v.specs.filter((_, j) => j !== i))}><X className="size-4" /></Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set("specs", [...v.specs, { key: "", value: "" }])}><Plus className="size-4" /> Add specification</Button>
        </section>
      </div>

      <div className="space-y-6">
        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">Pricing & stock</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (USD)</Label>
              <Input id="price" type="number" min={0} step="0.01" value={v.price} onChange={(e) => set("price", e.target.value)} />
              {err("price")}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="compare">Compare-at</Label>
              <Input id="compare" type="number" min={0} step="0.01" value={v.comparePrice} onChange={(e) => set("comparePrice", e.target.value)} placeholder="Optional" />
            </div>
          </div>
          {err("comparePrice")}
          <div className="space-y-1.5">
            <Label htmlFor="stock">Stock quantity</Label>
            <Input id="stock" type="number" min={0} value={v.stock} onChange={(e) => set("stock", e.target.value)} />
            {err("stock")}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border bg-card p-5">
          <h2 className="font-semibold">Visibility</h2>
          <label className="flex items-center justify-between gap-3"><span className="text-sm"><b className="block font-medium">Published</b><span className="text-muted-foreground">Visible in the store</span></span><Switch checked={v.published} onCheckedChange={(x) => set("published", x)} /></label>
          <label className="flex items-center justify-between gap-3"><span className="text-sm"><b className="block font-medium">Featured</b><span className="text-muted-foreground">Show on the home page</span></span><Switch checked={v.featured} onCheckedChange={(x) => set("featured", x)} /></label>
        </section>

        <section className="space-y-3 rounded-2xl border bg-card p-5">
          <h2 className="text-sm font-semibold text-muted-foreground">Preview</h2>
          <div className="overflow-hidden rounded-xl border">
            <div className="relative aspect-square bg-white">
              {v.images[0] && <Image src={v.images[0]} alt="" fill sizes="300px" className="object-contain p-4" unoptimized={!/dummyjson|wikimedia|r2\.dev/.test(v.images[0])} />}
            </div>
            <div className="space-y-1 p-3">
              <p className="text-xs text-muted-foreground uppercase">{brandName ?? "Brand"}</p>
              <p className="line-clamp-2 text-sm font-medium">{v.name || "Product name"}</p>
              <Price price={Number(v.price) || 0} comparePrice={v.comparePrice ? Number(v.comparePrice) : null} />
            </div>
          </div>
        </section>

        <div className="sticky bottom-4 flex gap-2">
          <Button variant="outline" asChild className="flex-1"><Link href="/admin/products"><ArrowLeft className="size-4" /> Cancel</Link></Button>
          <Button className="flex-1" onClick={submit} disabled={saving || uploading}>{saving && <Loader2 className="size-4 animate-spin" />} {id ? "Save changes" : "Create product"}</Button>
        </div>
      </div>
    </div>
  );
}
