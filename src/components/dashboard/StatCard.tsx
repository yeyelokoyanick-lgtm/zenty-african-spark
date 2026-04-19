import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  icon: LucideIcon;
}

export function StatCard({ label, value, trend, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: "var(--gradient-brand-soft)", color: "var(--brand-blue)" }}
        >
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}
