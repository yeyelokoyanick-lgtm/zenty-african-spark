import type { LucideIcon } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border bg-card p-10 text-center shadow-sm">
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-primary-foreground shadow-md"
        style={{ background: "var(--gradient-brand)" }}
      >
        <Icon className="h-8 w-8" />
      </div>
      <h1 className="mt-5 text-2xl font-bold text-foreground">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
    </div>
  );
}
