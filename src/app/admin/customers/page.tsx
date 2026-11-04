import { Suspense } from "react";
import { BadgeCheck, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Prisma } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/format";
import { formatSomaliPhone } from "@/lib/phone";
import { ListToolbar } from "../list-toolbar";
import { PageHeader } from "../page-header";

export const metadata = { title: "Customers" };

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string }> }) {
  const { q, role } = await searchParams;
  const where: Prisma.UserWhereInput = {};
  if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { email: { contains: q, mode: "insensitive" } }, { phone: { contains: q } }];
  if (role) where.role = role as never;

  const [users, spend] = await Promise.all([
    db.user.findMany({ where, orderBy: { createdAt: "desc" }, include: { _count: { select: { orders: true } } } }),
    db.order.groupBy({ by: ["userId"], where: { paymentStatus: "PAID" }, _sum: { total: true }, _max: { createdAt: true } }),
  ]);
  const spendBy = new Map(spend.map((s) => [s.userId, { total: Number(s._sum.total ?? 0), last: s._max.createdAt }]));

  return (
    <div>
      <PageHeader title="Customers" description={`${users.length} registered users`} />
      <Suspense>
        <ListToolbar placeholder="Search name, email or phone…" filters={[{ param: "role", label: "Roles", options: [{ value: "CUSTOMER", label: "Customers" }, { value: "ADMIN", label: "Admins" }] }]} />
      </Suspense>
      <div className="overflow-x-auto rounded-2xl border bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-3 py-3 font-medium">Phone</th>
              <th className="px-3 py-3 font-medium">Joined</th>
              <th className="px-3 py-3 text-right font-medium">Orders</th>
              <th className="px-4 py-3 text-right font-medium">Total spent</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => {
              const s = spendBy.get(u.id);
              return (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                      </span>
                      <div>
                        <p className="flex items-center gap-1.5 font-medium">
                          {u.name}
                          {u.emailVerified && <BadgeCheck className="size-4 text-primary" aria-label="Email verified" />}
                          {u.role === "ADMIN" && <Badge variant="secondary">Admin</Badge>}
                        </p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{u.phone ? formatSomaliPhone(u.phone) : "—"}</td>
                  <td className="px-3 py-3 text-muted-foreground">{u.createdAt.toLocaleDateString("en-GB", { dateStyle: "medium" })}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{u._count.orders}</td>
                  <td className="px-4 py-3 text-right font-semibold">{formatPrice(s?.total ?? 0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && <div className="flex flex-col items-center gap-2 py-14 text-muted-foreground"><Users className="size-8" /> No customers found.</div>}
      </div>
    </div>
  );
}
