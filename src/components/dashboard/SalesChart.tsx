import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { salesWeek, salesMonth, formatFCFA } from "@/data/dashboard";
import { cn } from "@/lib/utils";

type Range = "week" | "month";

export function SalesChart() {
  const [range, setRange] = useState<Range>("week");
  const data = range === "week" ? salesWeek : salesMonth;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Ventes &amp; Revenus</h2>
          <p className="text-sm text-muted-foreground">Évolution de tes ventes</p>
        </div>
        <div className="inline-flex rounded-lg bg-muted p-1">
          {(["week", "month"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition",
                range === r
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r === "week" ? "Cette semaine" : "Ce mois"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.45 0.31 268)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="oklch(0.52 0.29 295)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip
              cursor={{ stroke: "var(--brand-purple)", strokeWidth: 1, strokeDasharray: "4 4" }}
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "12px",
                fontSize: "12px",
              }}
              formatter={(v: number) => [formatFCFA(v), "Ventes"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--brand-blue)"
              strokeWidth={2.5}
              fill="url(#salesGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
