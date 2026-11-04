import { requireUser } from "@/lib/auth";
import { AccountNav } from "./account-nav";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireUser("/account");
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center gap-4">
        <span className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-primary to-violet-500 text-lg font-bold text-white">
          {user.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hi, {user.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <AccountNav isAdmin={user.role === "ADMIN"} />
        <div>{children}</div>
      </div>
    </div>
  );
}
