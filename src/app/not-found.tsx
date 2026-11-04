import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-7xl font-black tracking-tighter text-primary">404</p>
      <h1 className="text-2xl font-bold">Page not found</h1>
      <p className="max-w-sm text-muted-foreground">The page or product you are looking for doesn’t exist or was removed.</p>
      <div className="flex gap-2">
        <Button asChild><Link href="/products">Browse products</Link></Button>
        <Button asChild variant="outline"><Link href="/">Go home</Link></Button>
      </div>
    </div>
  );
}
