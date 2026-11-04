"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPrice } from "@/lib/format";

type Point = { date: string; revenue: number; orders: number };

function ChartTooltip({ active, payload }: { active?: boolean; payload?: { payload: Point }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium">{new Date(p.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}</p>
      <p className="text-muted-foreground">Revenue <span className="ml-2 font-semibold text-foreground">{formatPrice(p.revenue)}</span></p>
      <p className="text-muted-foreground">Orders <span className="ml-2 font-semibold text-foreground">{p.orders}</span></p>
    </div>
  );
}

export function SalesChart({ data }: { data: Point[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis
            dataKey="date" tickLine={false} axisLine={false} minTickGap={24}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickFormatter={(d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
          />
          <YAxis
            tickLine={false} axisLine={false} width={56}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`)}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "4 4" }} />
          <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} fill="url(#rev)" activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--background)" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
