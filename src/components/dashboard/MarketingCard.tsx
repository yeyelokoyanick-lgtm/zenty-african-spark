import { Megaphone, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MarketingCard() {
  return (
    <div
      className="relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl p-6 text-primary-foreground shadow-md sm:flex-row sm:items-center"
      style={{ background: "var(--gradient-brand)" }}
    >
      <div
        className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-2xl"
        style={{ background: "white" }}
        aria-hidden="true"
      />
      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <Megaphone className="h-6 w-6" />
        </div>
        <div>
          <h3 className="text-base font-semibold">Boostez Vos Ventes&nbsp;!</h3>
          <p className="text-sm opacity-90">Lancez vos pubs facilement sur Facebook.</p>
        </div>
      </div>
      <Button className="relative bg-white font-semibold text-foreground hover:bg-white/90">
        <Sparkles className="h-4 w-4" />
        Créer une Campagne
      </Button>
    </div>
  );
}
