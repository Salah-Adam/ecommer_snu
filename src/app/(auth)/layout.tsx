import Link from "next/link";
import { ShieldCheck, Truck, Wallet } from "lucide-react";
import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-primary via-blue-700 to-violet-700 p-10 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">som<span className="text-blue-200">Store</span></Link>
        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight">Genuine electronics,<br />delivered across Somalia.</h2>
          <ul className="space-y-3 text-sm text-blue-50">
            <li className="flex items-center gap-3"><ShieldCheck className="size-5" /> Warranty on every product</li>
            <li className="flex items-center gap-3"><Wallet className="size-5" /> Pay with EVC Plus, ZAAD, Sahal or eDahab</li>
            <li className="flex items-center gap-3"><Truck className="size-5" /> Same-day delivery in Mogadishu</li>
          </ul>
        </div>
        <p className="text-xs text-blue-100">© somStore</p>
        <div className="pointer-events-none absolute -right-24 -bottom-24 size-96 rounded-full bg-white/10 blur-2xl" />
      </div>
      <div className="flex flex-col items-center justify-center px-4 py-10">
        <div className="mb-8 lg:hidden"><Logo /></div>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
