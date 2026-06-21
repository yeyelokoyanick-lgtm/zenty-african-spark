import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/afrisell/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Facebook, MessageCircle, Mail, Copy, Plus, Megaphone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/marketing")({
  head: () => ({ meta: [{ title: "Marketing — AFRISELL" }] }),
  component: MarketingPage,
});

const PROMOS = [
  { code: "BIENVENUE10", discount: "10%", uses: 23, status: "Actif" },
  { code: "RAMADAN25", discount: "25%", uses: 87, status: "Expiré" },
  { code: "VIP15", discount: "15%", uses: 5, status: "Actif" },
];

function MarketingPage() {
  const [pixelOn, setPixelOn] = useState(false);
  const [waOn, setWaOn] = useState(true);
  const url = "https://afrisell.shop/ma-boutique";

  return (
    <AppShell>
      <PageHeader title="Marketing" subtitle="Booste tes ventes avec les bons outils." />

      <section className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] mb-6">
        <h2 className="text-lg font-bold mb-4">Outils actifs</h2>
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1877F2]/10 text-[#1877F2]"><Facebook className="h-5 w-5" /></span>
              <div>
                <p className="font-semibold">Facebook Pixel</p>
                <p className="text-xs text-muted-foreground mb-2">Suis tes conversions Facebook Ads.</p>
                <Input placeholder="ID Pixel (ex: 1234567890)" className="max-w-xs" />
              </div>
            </div>
            <Switch checked={pixelOn} onCheckedChange={setPixelOn} />
          </div>

          <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/15 text-success"><MessageCircle className="h-5 w-5" /></span>
              <div>
                <p className="font-semibold">Bouton WhatsApp</p>
                <p className="text-xs text-muted-foreground mb-2">Bouton flottant sur ta boutique.</p>
                <Input placeholder="+229 90 00 00 00" className="max-w-xs" />
              </div>
            </div>
            <Switch checked={waOn} onCheckedChange={setWaOn} />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Lien de partage</p>
              <p className="text-xs text-muted-foreground">{url}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => { navigator.clipboard.writeText(url); toast.success("Lien copié"); }}
            >
              <Copy className="h-4 w-4" /> Copier
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)] mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Codes promo</h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> Créer un code</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Créer un code promo</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label>Code</Label><Input placeholder="PROMO20" /></div>
                <div><Label>Réduction (%)</Label><Input type="number" placeholder="20" /></div>
                <div><Label>Expire le</Label><Input type="date" /></div>
              </div>
              <DialogFooter><Button>Créer</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground"><tr className="border-b border-border">
              <th className="px-3 py-2">Code</th><th className="px-3 py-2">Réduction</th><th className="px-3 py-2">Utilisations</th><th className="px-3 py-2">Statut</th>
            </tr></thead>
            <tbody>
              {PROMOS.map((p) => (
                <tr key={p.code} className="border-b border-border/70">
                  <td className="px-3 py-3 font-mono font-semibold">{p.code}</td>
                  <td className="px-3 py-3">{p.discount}</td>
                  <td className="px-3 py-3">{p.uses}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${p.status === "Actif" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold mb-4">Campagnes</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Facebook, color: "#1877F2", title: "Facebook Ads", desc: "Booste ta boutique sur Facebook." },
            { icon: MessageCircle, color: "var(--color-success)", title: "WhatsApp Marketing", desc: "Envoie un message à tes clients." },
            { icon: Mail, color: "var(--color-warning)", title: "Email Marketing", desc: "Envoie une newsletter.", soon: true },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `color-mix(in oklab, ${c.color} 12%, transparent)`, color: c.color }}>
                <c.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-semibold flex items-center gap-2">
                {c.title}
                {c.soon && <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase">Bientôt</span>}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
              <Button variant="outline" size="sm" className="mt-4" disabled={c.soon}><Megaphone className="h-3.5 w-3.5" /> Lancer</Button>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
