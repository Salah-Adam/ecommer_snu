import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { discountPercent } from "@/lib/format";
import type { ProductCardData } from "@/lib/products";
import { AddToCartButton } from "./add-to-cart-button";
import { Price } from "./price";

export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const off = discountPercent(product.price, product.comparePrice);
  const low = product.stock > 0 && product.stock <= 3;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-white">
        {product.image && (
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-5 transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {off > 0 && <Badge className="bg-rose-600 text-white">-{off}%</Badge>}
          {product.stock <= 0 && <Badge variant="secondary">Sold out</Badge>}
          {low && <Badge variant="outline" className="border-amber-500 bg-white text-amber-700">Only {product.stock} left</Badge>}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{product.brand}</p>
        <h3 className="line-clamp-2 min-h-10 text-sm leading-5 font-medium">
          <Link href={`/products/${product.slug}`} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <Price price={product.price} comparePrice={product.comparePrice} />
          <AddToCartButton
            className="relative z-10"
            compact
            size="sm"
            item={{
              productId: product.id, slug: product.slug, name: product.name,
              image: product.image, price: product.price, stock: product.stock,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({ products }: { products: ProductCardData[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 4} />
      ))}
    </div>
  );
}
