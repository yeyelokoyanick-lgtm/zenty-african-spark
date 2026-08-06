import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatTile({
  icon: Icon, label, value, hint, tone = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: "primary" | "success" | "warning" | "destructive";
}) {
  const toneClass: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="rounded border border-border border-l-[3px] border-l-[color:var(--brand-orange)] bg-card p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", toneClass[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-extrabold tracking-tight text-foreground">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
