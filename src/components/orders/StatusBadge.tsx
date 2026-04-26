import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/order";

const STYLES: Record<OrderStatus, string> = {
  "En attente":
    "bg-muted text-muted-foreground border border-border",
  "Confirmée":
    "bg-primary/10 text-primary border border-primary/20",
  "Expédiée":
    "bg-accent/15 text-accent border border-accent/25",
  "Livrée":
    "bg-success/15 text-success border border-success/25",
  "Annulée":
    "bg-destructive/10 text-destructive border border-destructive/25",
};

export function StatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        STYLES[status],
        className,
      )}
    >
      {status}
    </span>
  );
}