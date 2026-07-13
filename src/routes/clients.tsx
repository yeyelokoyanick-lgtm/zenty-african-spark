import { createFileRoute } from "@tanstack/react-router";
import { Users, UserPlus, Repeat, Search, MessageCircle, Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/afrisell/PageHeader";
import { StatTile } from "@/components/afrisell/StatTile";
import { Input } from "@/components/ui/input";
import { fcfa } from "@/components/afrisell/format";
import { useEffect, useMemo, useState } from "react";
import { listMyOrders, aggregateCustomers, type OrderRow } from "@/lib/orders-api";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/clients")({
  head: () => ({ meta: [{ title: "Clients — AFRISELL" }] }),
  component: ClientsPage,
});

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("fr-FR"); } catch { return iso.slice(0, 10); }
}

function ClientsPage() {
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

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

  const clients = useMemo(() => aggregateCustomers(rows), [rows]);
  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q)
  );
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const newThisMonth = clients.filter((c) => c.last >= monthStart).length;
  const recurring = clients.filter((c) => c.orders > 1).length;

  return (
    <AppShell>
      <PageHeader title="Clients" subtitle="Tous tes acheteurs en un coup d'œil." />
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatTile icon={Users} label="Total clients" value={String(clients.length)} />
        <StatTile icon={UserPlus} label="Nouveaux ce mois" value={String(newThisMonth)} tone="success" />
        <StatTile icon={Repeat} label="Clients récurrents" value={String(recurring)} tone="warning" />
      </div>
      <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (nom, téléphone...)" className="pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          {authLoading || loading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Chargement…
            </div>
          ) : !user ? (
            <div className="p-8 text-center text-muted-foreground">Connecte-toi pour voir tes clients.</div>
          ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Ville</th>
                <th className="px-4 py-3">Commandes</th>
                <th className="px-4 py-3">Total dépensé</th>
                <th className="px-4 py-3">Dernière</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.phone} className="border-b border-border/70 hover:bg-muted/40">
                  <td className="px-4 py-3 font-semibold">{c.name}</td>
                  <td className="px-4 py-3"><a href={`tel:${c.phone}`} className="text-primary hover:underline">{c.phone}</a></td>
                  <td className="px-4 py-3">{c.city}</td>
                  <td className="px-4 py-3">{c.orders}</td>
                  <td className="px-4 py-3 font-semibold">{fcfa(c.total)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(c.last)}</td>
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`https://wa.me/${c.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1 text-success hover:underline text-xs font-semibold"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Aucun client trouvé.</td></tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </AppShell>
  );
}
