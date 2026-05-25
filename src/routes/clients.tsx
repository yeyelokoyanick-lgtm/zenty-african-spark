import { createFileRoute } from "@tanstack/react-router";
import { Users, UserPlus, Repeat, Search, Phone, MessageCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/zenty/PageHeader";
import { StatTile } from "@/components/zenty/StatTile";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fcfa } from "@/components/zenty/format";
import { useState } from "react";

export const Route = createFileRoute("/clients")({
  head: () => ({ meta: [{ title: "Clients — ZENTY" }] }),
  component: ClientsPage,
});

const CLIENTS = [
  { name: "Awa Diop", phone: "+221 77 123 45 67", city: "Dakar", orders: 5, total: 87500, last: "2026-05-22" },
  { name: "Kofi Mensah", phone: "+228 90 12 34 56", city: "Lomé", orders: 3, total: 42000, last: "2026-05-20" },
  { name: "Adjoa Boateng", phone: "+225 07 88 11 22", city: "Abidjan", orders: 8, total: 156000, last: "2026-05-23" },
  { name: "Ibrahim Diallo", phone: "+229 91 22 33 44", city: "Cotonou", orders: 2, total: 18500, last: "2026-05-18" },
  { name: "Fatou Ndiaye", phone: "+221 78 555 12 34", city: "Thiès", orders: 12, total: 245000, last: "2026-05-24" },
  { name: "Yao Kouadio", phone: "+225 05 44 22 11", city: "Bouaké", orders: 1, total: 22000, last: "2026-05-15" },
  { name: "Amina Traoré", phone: "+223 76 11 22 33", city: "Bamako", orders: 4, total: 64000, last: "2026-05-21" },
  { name: "Sékou Camara", phone: "+224 62 99 88 77", city: "Conakry", orders: 2, total: 31000, last: "2026-05-19" },
  { name: "Mariam Ouédraogo", phone: "+226 70 22 11 88", city: "Ouagadougou", orders: 6, total: 98000, last: "2026-05-23" },
  { name: "Émile Tchato", phone: "+237 6 55 44 33 22", city: "Douala", orders: 3, total: 51000, last: "2026-05-17" },
];

function ClientsPage() {
  const [q, setQ] = useState("");
  const filtered = CLIENTS.filter((c) =>
    c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q)
  );
  return (
    <AppShell>
      <PageHeader title="Clients" subtitle="Tous tes acheteurs en un coup d'œil." />
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <StatTile icon={Users} label="Total clients" value={String(CLIENTS.length)} />
        <StatTile icon={UserPlus} label="Nouveaux ce mois" value="4" tone="success" />
        <StatTile icon={Repeat} label="Clients récurrents" value="6" tone="warning" />
      </div>
      <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-card)]">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (nom, téléphone...)" className="pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
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
                  <td className="px-4 py-3 text-muted-foreground">{c.last}</td>
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
        </div>
      </div>
    </AppShell>
  );
}
