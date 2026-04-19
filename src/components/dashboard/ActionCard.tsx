import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ActionTone = "blue" | "orange" | "purple";

const toneStyles: Record<ActionTone, { bg: string; iconBg: string; ring: string }> = {
  blue: {
    bg: "linear-gradient(135deg, oklch(0.45 0.31 268 / 0.08), oklch(0.45 0.31 268 / 0.02))",
    iconBg: "var(--brand-blue)",
    ring: "oklch(0.45 0.31 268 / 0.2)",
  },
  orange: {
    bg: "linear-gradient(135deg, oklch(0.72 0.18 55 / 0.12), oklch(0.72 0.18 55 / 0.03))",
    iconBg: "var(--brand-orange)",
    ring: "oklch(0.72 0.18 55 / 0.25)",
  },
  purple: {
    bg: "linear-gradient(135deg, oklch(0.52 0.29 295 / 0.1), oklch(0.52 0.29 295 / 0.02))",
    iconBg: "var(--brand-purple)",
    ring: "oklch(0.52 0.29 295 / 0.22)",
  },
};

interface ActionCardProps {
  title: string;
  description: string;
  cta: string;
  icon: LucideIcon;
  tone: ActionTone;
}

export function ActionCard({ title, description, cta, icon: Icon, tone }: ActionCardProps) {
  const style = toneStyles[tone];
  return (
    <div
      className="group relative flex flex-col justify-between gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      style={{ backgroundImage: style.bg, boxShadow: `0 0 0 1px ${style.ring} inset` }}
    >
      <div>
        <div
          className="inline-flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md"
          style={{ background: style.iconBg }}
        >
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
      </div>
      <Button
        variant="outline"
        className="w-fit border-foreground/10 bg-card font-medium hover:bg-foreground hover:text-background"
      >
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
