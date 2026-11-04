import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/product/product-card-skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Skeleton className="mb-2 h-4 w-32" />
      <Skeleton className="mb-8 h-9 w-64" />
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <div className="hidden space-y-3 lg:block">
          {Array.from({ length: 10 }, (_, i) => <Skeleton key={i} className="h-7 w-full" />)}
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
