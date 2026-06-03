import type { LucideIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type Tone = "violet" | "blue" | "green" | "orange";

const tones: Record<Tone, string> = {
  violet: "bg-primary/10 text-primary",
  blue:   "bg-[oklch(0.55_0.18_240)/0.12] text-[oklch(0.55_0.18_240)]",
  green:  "bg-success/10 text-success",
  orange: "bg-warning/15 text-warning",
};

interface Props {
  icon: LucideIcon;
  label: string;
  to?: string;
  onClick?: () => void;
  tone?: Tone;
}

export function QuickActionCard({ icon: Icon, label, to, onClick, tone = "violet" }: Props) {
  const inner = (
    <>
      <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", tones[tone])}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </>
  );
  const cls =
    "flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md";
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  return <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}
