import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Mail, MessageCircle, ShoppingBag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  getNotifications,
  markAllRead,
  markRead,
  relativeTime,
  subscribeNotifications,
  type OrderNotification,
} from "@/lib/notifications";

const fcfa = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

export function NotificationBell() {
  const [items, setItems] = useState<OrderNotification[]>([]);
  const [preview, setPreview] = useState<OrderNotification | null>(null);

  useEffect(() => {
    const load = () => setItems(getNotifications());
    load();
    return subscribeNotifications(load);
  }, []);

  const unread = items.filter((n) => !n.read).length;
  const recent = items.slice(0, 5);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="Notifications"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-foreground transition hover:bg-muted"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[340px] p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold">Notifications</p>
              <p className="text-xs text-muted-foreground">
                {unread > 0 ? `${unread} nouvelle${unread > 1 ? "s" : ""} commande${unread > 1 ? "s" : ""}` : "Tout est à jour"}
              </p>
            </div>
            {unread > 0 && (
              <button
                onClick={() => markAllRead()}
                className="text-xs font-medium text-primary hover:underline"
              >
                Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Aucune commande pour l'instant</p>
              </div>
            ) : (
              recent.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 border-b border-border px-4 py-3 last:border-0 ${!n.read ? "bg-primary/5" : ""}`}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm">
                      🛒 Nouvelle commande de <span className="font-semibold">{n.client.name}</span> — <span className="font-semibold">{fcfa(n.total)}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{relativeTime(n.createdAt)} · #{n.orderId}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Link
                        to="/commandes"
                        search={{ order: n.orderId } as any}
                        onClick={() => markRead(n.id)}
                        className="rounded-md bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground hover:opacity-90"
                      >
                        Voir
                      </Link>
                      <button
                        onClick={() => { setPreview(n); markRead(n.id); }}
                        className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] font-medium hover:bg-muted"
                      >
                        <Mail className="h-3 w-3" /> Email
                      </button>
                      {n.whatsappUrl && (
                        <a
                          href={n.whatsappUrl}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => markRead(n.id)}
                          className="inline-flex items-center gap-1 rounded-md bg-[#25D366] px-2 py-1 text-[11px] font-semibold text-white hover:opacity-90"
                        >
                          <MessageCircle className="h-3 w-3" /> WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-border p-2">
            <Button asChild variant="ghost" size="sm" className="w-full">
              <Link to="/commandes">Voir toutes les commandes</Link>
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden p-0">
          <DialogHeader className="border-b border-border p-4">
            <DialogTitle>Aperçu de l'email envoyé</DialogTitle>
            <DialogDescription>
              Envoyé à {preview?.merchantEmail || "votre adresse email"} · Commande #{preview?.orderId}
            </DialogDescription>
          </DialogHeader>
          <iframe
            title="Aperçu email"
            className="h-[70vh] w-full border-0"
            srcDoc={preview?.emailHtml ?? ""}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}