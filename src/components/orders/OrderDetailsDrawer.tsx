import { Phone, MapPin, Package, Calendar, Wallet, BadgeCheck, Clock } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { formatFCFA } from "@/data/dashboard";
import type { Order, OrderStatus } from "@/types/order";

interface Props {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onConfirmPayment: (id: string) => void;
}

export function OrderDetailsDrawer({ order, open, onOpenChange, onUpdateStatus, onConfirmPayment }: Props) {
  if (!order) return null;

  const date = new Date(order.createdAt).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const paid = order.paymentStatus === "paid";
  const paymentName =
    order.paymentMethod === "mtn"
      ? "MTN Mobile Money"
      : order.paymentMethod === "moov"
        ? "Moov Money"
        : "Paiement à la livraison (Cash)";

  const actions: { label: string; status: OrderStatus; variant?: "default" | "outline" | "destructive" }[] = [
    { label: "Confirmer", status: "Confirmée" },
    { label: "Marquer expédiée", status: "Expédiée", variant: "outline" },
    { label: "Marquer livrée", status: "Livrée", variant: "outline" },
    { label: "Annuler", status: "Annulée", variant: "destructive" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="space-y-2 text-left">
          <div className="flex items-center justify-between gap-3">
            <SheetTitle className="text-xl">{order.id}</SheetTitle>
            <StatusBadge status={order.status} />
          </div>
          <SheetDescription className="flex items-center gap-1.5 text-xs">
            <Calendar className="h-3.5 w-3.5" />
            {date}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          {/* Customer */}
          <section className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Client
            </h3>
            <p className="text-base font-semibold text-foreground">{order.customerName}</p>
            <a
              href={`tel:${order.phone.replace(/\s/g, "")}`}
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/15"
            >
              <Phone className="h-4 w-4" />
              {order.phone}
            </a>
            <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 flex-none text-primary" />
              <span>
                <span className="font-medium text-foreground">{order.city}</span>
                <br />
                {order.address}
              </span>
            </div>
          </section>

          {/* Product */}
          <section className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Produit
            </h3>
            <div className="flex gap-3">
              {order.productImage ? (
                <img
                  src={order.productImage}
                  alt={order.productName}
                  className="h-16 w-16 flex-none rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 flex-none items-center justify-center rounded-lg bg-muted">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{order.productName}</p>
                <p className="text-sm text-muted-foreground">Quantité : {order.quantity}</p>
              </div>
            </div>

            <div className="mt-4 space-y-1.5 border-t border-border pt-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Wallet className="h-3.5 w-3.5" />
                  Mode de paiement
                </span>
                <span className="font-medium text-foreground">{paymentName}</span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-base font-semibold text-foreground">Total</span>
                <span className="text-lg font-bold text-foreground">{formatFCFA(order.amount)}</span>
              </div>
            </div>
          </section>

          {/* Paiement */}
          <section
            className={`rounded-xl border p-4 ${paid ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}
          >
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Encaissement
            </h3>
            <div className="flex items-center gap-2 text-sm">
              {paid ? (
                <>
                  <BadgeCheck className="h-4 w-4 text-primary" />
                  <span className="font-medium text-foreground">
                    Paiement confirmé {order.amountCollected ? `· ${formatFCFA(Number(order.amountCollected))}` : ""}
                  </span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Paiement en attente — à encaisser à la livraison
                  </span>
                </>
              )}
            </div>
            {paid && order.paidAt ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Encaissé le{" "}
                {new Date(order.paidAt).toLocaleString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            ) : null}
            {!paid ? (
              <Button className="mt-3 h-11 w-full" onClick={() => onConfirmPayment(order.id)}>
                💵 Confirmer l'encaissement de {formatFCFA(order.amount)}
              </Button>
            ) : null}
          </section>

          {/* Actions */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Actions rapides
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {actions.map((a) => (
                <Button
                  key={a.status}
                  variant={a.variant ?? "default"}
                  disabled={order.status === a.status || (a.status === "Livrée" && !paid)}
                  title={a.status === "Livrée" && !paid ? "Confirme d'abord l'encaissement" : undefined}
                  onClick={() => onUpdateStatus(order.id, a.status)}
                  className="h-11"
                >
                  {a.label}
                </Button>
              ))}
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}