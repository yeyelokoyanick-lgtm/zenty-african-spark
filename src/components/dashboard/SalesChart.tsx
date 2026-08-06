import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { salesWeek, salesMonth, formatFCFA } from "@/data/dashboard";
import { cn } from "@/lib/utils";

type Range = "week" | "month";

export function SalesChart() {
  const [range, setRange] = useState<Range>("week");
  const data = range === "week" ? salesWeek : salesMonth;

  return (
    <div className="flex h-full flex-col rounded border border-border bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">Ventes &amp; Revenus</h2>
          <p className="text-sm text-muted-foreground">Évolution de tes ventes</p>
        </div>
        <div className="inline-flex rounded bg-muted p-1">
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
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
            <XAxis dataKey="label" stroke="#999999" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#999999" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip
              cursor={{ fill: "#FF6A00", fillOpacity: 0.08 }}
              contentStyle={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                borderRadius: "4px",
                fontSize: "12px",
              }}
              formatter={(v: number) => [formatFCFA(v), "Ventes"]}
            />
            <Bar dataKey="value" radius={[2, 2, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill="#FF6A00" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
