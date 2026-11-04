import type { Metadata } from "next";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminMobileNav, AdminSidebar } from "./admin-nav";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · somStore Admin" } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const [orders, messages] = await Promise.all([
    db.order.count({ where: { status: { in: ["PENDING", "PAID"] } } }),
    db.contactMessage.count({ where: { read: false } }),
  ]);
  const counts = { orders, messages };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar counts={counts} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/85 px-4 backdrop-blur lg:px-8">
          <AdminMobileNav counts={counts} />
          <p className="text-sm font-medium text-muted-foreground">somStore Admin</p>
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
