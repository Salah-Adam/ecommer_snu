import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, PackageCheck, RotateCcw, ShieldCheck, Truck, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductPurchase } from "@/components/product/product-purchase";
import { ProductGrid } from "@/components/product/product-card";
import { Price } from "@/components/product/price";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return { title: "Product not found" };
  return { title: p.name, description: p.description.slice(0, 160), openGraph: { images: p.images.slice(0, 1) } };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  const related = await getRelatedProducts(product);
  const specs = Object.entries(product.specs);
  const stockLabel =
    product.stock <= 0 ? { text: "Out of stock", cls: "text-destructive" }
    : product.stock <= 3 ? { text: `Only ${product.stock} left — order soon`, cls: "text-amber-600" }
    : { text: "In stock, ready to ship", cls: "text-emerald-600" };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-6 flex flex-wrap gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link> /
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-foreground">{product.category.name}</Link> /
        <span className="line-clamp-1 text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div className="space-y-6">
          <div className="space-y-3">
            <Link href={`/products?brand=${product.brand.slug}`} className="text-sm font-semibold tracking-wide text-primary uppercase hover:underline">
              {product.brand.name}
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-balance">{product.name}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{product.category.name}</Badge>
              {product.soldCount > 0 && <span>{product.soldCount}+ sold</span>}
            </div>
          </div>

          <Price price={product.price} comparePrice={product.comparePrice} size="lg" />

          <p className={`flex items-center gap-2 text-sm font-medium ${stockLabel.cls}`}>
            <PackageCheck className="size-4" /> {stockLabel.text}
          </p>

          {product.highlights.length > 0 && (
            <ul className="space-y-2">
              {product.highlights.map((h) => (
                <li key={h} className="flex gap-2 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" /> {h}
                </li>
              ))}
            </ul>
          )}

          <ProductPurchase
            item={{
              productId: product.id, slug: product.slug, name: product.name,
              image: product.images[0] ?? "", price: product.price, stock: product.stock,
            }}
          />

          <div className="grid grid-cols-2 gap-3 rounded-2xl border bg-muted/30 p-4 text-sm">
            <p className="flex gap-2"><Truck className="size-4 shrink-0 text-primary" /> Delivery to 8 Somali cities</p>
            <p className="flex gap-2"><ShieldCheck className="size-4 shrink-0 text-primary" /> {product.specs.Warranty ?? "1 year"} warranty</p>
            <p className="flex gap-2"><Wallet className="size-4 shrink-0 text-primary" /> EVC, ZAAD, Sahal, eDahab</p>
            <p className="flex gap-2"><RotateCcw className="size-4 shrink-0 text-primary" /> 7-day exchange</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="specs" className="mt-14">
        <TabsList>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="description">Description</TabsTrigger>
        </TabsList>
        <TabsContent value="specs" className="mt-4">
          <div className="overflow-hidden rounded-2xl border">
            <table className="w-full text-sm">
              <tbody>
                {specs.map(([k, v], i) => (
                  <tr key={k} className={i % 2 ? "bg-muted/30" : ""}>
                    <th scope="row" className="w-1/3 px-4 py-3 text-left font-medium text-muted-foreground">{k}</th>
                    <td className="px-4 py-3">{String(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        <TabsContent value="description" className="mt-4 max-w-3xl leading-7 text-muted-foreground">
          {product.description.split(/\n+/).map((para, i) => <p key={i} className="mb-3">{para}</p>)}
        </TabsContent>
      </Tabs>

      {related.length > 0 && (
        <section className="mt-16">
          <Separator className="mb-10" />
          <h2 className="mb-6 text-2xl font-bold tracking-tight">You may also like</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
