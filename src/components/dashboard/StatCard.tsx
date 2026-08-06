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
    <div className="rounded border border-border border-l-[3px] border-l-[color:var(--brand-orange)] bg-card p-4 shadow-[var(--shadow-card)] transition hover:shadow-[var(--shadow-elevated)]">
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded"
          style={{ background: "var(--brand-orange-light)", color: "var(--brand-orange)" }}
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
