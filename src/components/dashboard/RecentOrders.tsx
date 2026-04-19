import { Button } from "@/components/ui/button";
import { recentOrders, formatFCFA, type OrderStatus } from "@/data/dashboard";
import { cn } from "@/lib/utils";

const statusStyles: Record<OrderStatus, string> = {
  Nouvelle: "bg-primary/10 text-primary",
  Attente: "bg-warning/15 text-[oklch(0.5_0.16_75)]",
  Expédiée: "bg-success/15 text-success",
};

export function RecentOrders() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Commandes Récentes</h2>
          <p className="text-sm text-muted-foreground">Dernières activités</p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
          Tout voir
        </Button>
      </div>

      <ul className="mt-4 flex-1 divide-y divide-border">
        {recentOrders.map((order) => (
          <li key={order.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">{order.customer}</p>
              <span
                className={cn(
                  "mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                  statusStyles[order.status],
                )}
              >
                {order.status}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground">{formatFCFA(order.amount)}</span>
              <Button size="sm" variant="outline" className="h-8">Voir</Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
