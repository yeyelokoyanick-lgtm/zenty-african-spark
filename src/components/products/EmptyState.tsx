import { Boxes, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-2xl text-primary-foreground shadow-md"
        style={{ background: "var(--gradient-brand)" }}
      >
        <Boxes className="h-10 w-10" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-foreground">Aucun produit pour le moment</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Commence à construire ton catalogue en ajoutant ton premier produit.
      </p>
      <Button
        onClick={onAdd}
        className="mt-5 text-primary-foreground"
        style={{ background: "var(--gradient-brand)" }}
      >
        <Plus className="h-4 w-4" /> Ajouter ton premier produit
      </Button>
    </div>
  );
}
