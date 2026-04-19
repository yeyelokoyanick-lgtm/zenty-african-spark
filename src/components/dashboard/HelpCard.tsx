import { LifeBuoy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HelpCard() {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-center">
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ background: "var(--gradient-brand-soft)", color: "var(--brand-blue)" }}
        >
          <LifeBuoy className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">Centre d&apos;Aide</h3>
          <p className="text-sm text-muted-foreground">Besoin d&apos;aide ? Consulte nos guides.</p>
        </div>
      </div>
      <Button variant="outline" className="sm:w-auto">
        Accéder <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
