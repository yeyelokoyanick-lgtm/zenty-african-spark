import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, Download, Phone, Eye, Inbox, MoreVertical, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { OrderDetailsDrawer } from "@/components/orders/OrderDetailsDrawer";
import { formatFCFA } from "@/data/dashboard";
import { ORDER_STATUSES, type Order, type OrderStatus } from "@/types/order";
import {
  listMyOrders,
  updateOrderStatus as apiUpdateStatus,
  confirmOrderPayment,
  type OrderRow,
} from "@/lib/orders-api";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/commandes")({
  head: () => ({
    meta: [
      { title: "Commandes — AFRISELL" },
      { name: "description", content: "Gère et confirme tes commandes COD en un clic." },
      { property: "og:title", content: "Commandes — AFRISELL" },
      { property: "og:description", content: "Gestion COD optimisée pour vendeurs africains." },
    ],
  }),
  component: CommandesPage,
});

type StatusFilter = "Toutes" | OrderStatus;

function rowToOrder(r: OrderRow): Order {
  return {
    id: r.order_number,
    customerName: r.customer_name,
    phone: r.customer_phone,
    city: r.customer_city ?? "",
    address: r.customer_address ?? "",
    productName: r.product_name,
    productImage: r.product_image ?? undefined,
    quantity: r.quantity,
    amount: Number(r.total),
    status: (r.status as OrderStatus),
    createdAt: r.created_at,
    paymentMethod: (r.payment_method === "mtn" || r.payment_method === "moov" ? r.payment_method : "cash_on_delivery"),
    paymentStatus: (r.payment_status ?? "pending"),
    amountCollected: r.amount_collected,
    paidAt: r.paid_at,
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function exportCSV(orders: Order[]) {
  const header = [
    "ID",
    "Client",
    "Téléphone",
    "Ville",
    "Produit",
    "Quantité",
    "Montant",
    "Statut",
    "Date",
  ];
  const rows = orders.map((o) => [
    o.id,
    o.customerName,
    o.phone,
    o.city,
    o.productName,
    String(o.quantity),
    String(o.amount),
    o.status,
    new Date(o.createdAt).toISOString(),
  ]);
  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `commandes-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function CommandesPage() {
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("Toutes");
  const [selected, setSelected] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    listMyOrders()
      .then((r) => { if (!cancelled) setRows(r); })
      .catch((e) => toast.error(e?.message || "Chargement impossible"))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user, authLoading]);

  const orders = useMemo(() => rows.map(rowToOrder), [rows]);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (statusFilter !== "Toutes") list = list.filter((o) => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.customerName.toLowerCase().includes(q) ||
          o.phone.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q),
      );
    }
    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return list;
  }, [orders, search, statusFilter]);

  const confirmPayment = async (id: string) => {
    const row = rows.find((r) => r.order_number === id);
    if (!row) return;
    try {
      await confirmOrderPayment(row.id, Number(row.total));
      const paidAt = new Date().toISOString();
      setRows((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? { ...r, payment_status: "paid", paid_at: paidAt, amount_collected: Number(row.total) }
            : r,
        ),
      );
      setSelected((curr) =>
        curr && curr.id === id
          ? { ...curr, paymentStatus: "paid", paidAt, amountCollected: Number(row.total) }
          : curr,
      );
      toast.success(`💵 Paiement encaissé pour ${id}`);
    } catch (e: any) {
      toast.error(e?.message || "Confirmation du paiement impossible");
    }
  };

  const updateStatus = async (id: string, status: OrderStatus) => {
    const row = rows.find((r) => r.order_number === id);
    if (!row) return;
    if (status === "Livrée" && (row.payment_status ?? "pending") !== "paid") {
      toast.error("Confirme d'abord l'encaissement du paiement à la livraison");
      return;
    }
    try {
      await apiUpdateStatus(row.id, status);
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status } : r)));
      setSelected((curr) => (curr && curr.id === id ? { ...curr, status } : curr));
      toast.success(`Commande ${id} → ${status}`);
    } catch (e: any) {
      toast.error(e?.message || "Mise à jour impossible");
    }
  };

  const openDetails = (o: Order) => {
    setSelected(o);
    setDrawerOpen(true);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Commandes</h1>
            <p className="mt-1 text-muted-foreground">
              Gère et confirme tes commandes clients.
            </p>
          </div>
          <Button variant="outline" onClick={() => exportCSV(filtered)}>
            <Download className="h-4 w-4" />
            Exporter (CSV)
          </Button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom ou téléphone..."
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilter)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Toutes">Toutes</SelectItem>
              {ORDER_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {authLoading || loading ? (
          <div className="flex items-center justify-center rounded-2xl border border-border bg-card p-12 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…
          </div>
        ) : !user ? (
          <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
            Connecte-toi pour voir tes commandes.
          </div>
        ) : filtered.length === 0 ? (
          <EmptyOrders />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Ville</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((o) => (
                    <TableRow key={o.id} className="group">
                      <TableCell className="font-mono text-xs font-semibold text-foreground">
                        {o.id}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {o.customerName}
                      </TableCell>
                      <TableCell>
                        <a
                          href={`tel:${o.phone.replace(/\s/g, "")}`}
                          className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/15"
                        >
                          <Phone className="h-3 w-3" />
                          {o.phone}
                        </a>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{o.city}</TableCell>
                      <TableCell className="max-w-[180px] truncate text-foreground">
                        {o.productName}
                        <span className="ml-1 text-xs text-muted-foreground">×{o.quantity}</span>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-foreground">
                        {formatFCFA(o.amount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={o.status} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(o.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDetails(o)}
                            className="h-8"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="hidden lg:inline">Détails</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => updateStatus(o.id, "Confirmée")}>
                                Confirmer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(o.id, "Expédiée")}>
                                Marquer expédiée
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => updateStatus(o.id, "Livrée")}>
                                Marquer livrée
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => updateStatus(o.id, "Annulée")}
                                className="text-destructive focus:text-destructive"
                              >
                                Annuler
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {filtered.map((o) => (
                <div
                  key={o.id}
                  className="rounded-2xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-semibold text-muted-foreground">
                        {o.id}
                      </p>
                      <p className="mt-0.5 font-semibold text-foreground">{o.customerName}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {o.city} · {formatDate(o.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="truncate text-muted-foreground">
                      {o.productName} ×{o.quantity}
                    </span>
                    <span className="font-semibold text-foreground">{formatFCFA(o.amount)}</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-10"
                    >
                      <a href={`tel:${o.phone.replace(/\s/g, "")}`}>
                        <Phone className="h-4 w-4" />
                        Appeler
                      </a>
                    </Button>
                    <Button size="sm" onClick={() => openDetails(o)} className="h-10">
                      <Eye className="h-4 w-4" />
                      Détails
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <OrderDetailsDrawer
        order={selected}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onUpdateStatus={updateStatus}
      />
    </AppShell>
  );
}

function EmptyOrders() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center shadow-sm">
      <div
        className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{ background: "var(--gradient-brand-soft)" }}
      >
        <Inbox className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-foreground">
        Aucune commande pour le moment
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Tes nouvelles commandes apparaîtront ici dès qu'un client passera commande.
      </p>
    </div>
  );
}