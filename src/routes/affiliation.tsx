import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/afrisell/PageHeader";
import { StatTile } from "@/components/afrisell/StatTile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Copy, MessageCircle, Facebook, Wallet, Users, MousePointerClick,
  Clock, Link2, UserPlus, DollarSign, Sparkles,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/affiliation")({
  head: () => ({ meta: [{ title: "Affiliation — AFRISELL" }] }),
  component: AffiliationPage,
});

const USD_TO_FCFA = 583; // approx
const fcfa = (n: number) => `${new Intl.NumberFormat("fr-FR").format(Math.round(n))} FCFA`;
const usd = (n: number) => `${n.toFixed(2).replace(".", ",")}$`;
const both = (d: number) => `${usd(d)} (${fcfa(d * USD_TO_FCFA)})`;

type Status = "Actif" | "En attente" | "Inactif";
const REFERRALS: { name: string; date: string; status: Status; paid: boolean }[] = [
  { name: "Kofi Mensah", date: "10/05/2026", status: "Actif", paid: true },
  { name: "Aminata Diallo", date: "08/05/2026", status: "Actif", paid: true },
  { name: "Jean-Baptiste Koffi", date: "05/05/2026", status: "Actif", paid: true },
  { name: "Fatou Traoré", date: "03/05/2026", status: "Actif", paid: true },
  { name: "Moussa Coulibaly", date: "01/05/2026", status: "Actif", paid: true },
  { name: "Awa Sow", date: "28/04/2026", status: "Actif", paid: true },
  { name: "Ibrahim Sawadogo", date: "25/04/2026", status: "Actif", paid: true },
  { name: "Mariama Bah", date: "22/04/2026", status: "En attente", paid: false },
  { name: "Serge Aka", date: "20/04/2026", status: "En attente", paid: false },
];

function statusBadge(s: Status) {
  const map: Record<Status, string> = {
    "Actif": "bg-success/15 text-success",
    "En attente": "bg-warning/15 text-warning",
    "Inactif": "bg-muted text-muted-foreground",
  };
  const icon: Record<Status, string> = { Actif: "✓", "En attente": "⏳", Inactif: "✗" };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-semibold ${map[s]}`}>
      {icon[s]} {s}
    </span>
  );
}

function generateCode() {
  return "ZN" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function AffiliationPage() {
  const [isAffiliate, setIsAffiliate] = useState(true);
  const [code, setCode] = useState("MONCODE123");
  const link = `https://afrisell.shop/ref/${code}`;

  const chartData = useMemo(() => {
    const data: { day: string; gains: number }[] = [];
    for (let i = 0; i < 30; i++) {
      const v = +(13.5 * Math.min(1, (i + 1) / 30) * (0.85 + Math.random() * 0.15)).toFixed(2);
      data.push({ day: `J${i + 1}`, gains: v });
    }
    data[29].gains = 13.5;
    return data;
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    toast.success("Lien copié !");
  };

  const waMsg = encodeURIComponent(
    `🚀 Crée ta boutique en ligne GRATUITEMENT avec AFRISELL ! Vends tes produits et encaisse en Mobile Money. Inscris-toi ici 👉 ${link}`,
  );

  if (!isAffiliate) {
    return (
      <AppShell>
        <PageHeader title="Programme d'Affiliation AFRISELL" subtitle="Parraine des marchands et gagne 1,5$ (875 FCFA) par inscription réussie" />
        <div
          className="rounded-2xl p-8 sm:p-12 text-white shadow-[var(--shadow-card)] max-w-2xl mx-auto"
          style={{ background: "var(--gradient-brand)" }}
        >
          <Sparkles className="h-10 w-10 mb-3" />
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">Rejoins le programme d'affiliation AFRISELL</h2>
          <p className="text-white/90 mb-6">Gagne 1,5$ par marchand parrainé. Sans limite.</p>
          <div className="space-y-3 bg-white/10 backdrop-blur p-4 rounded-xl">
            <Label className="text-white">Choisis ton code d'affiliation</Label>
            <div className="flex gap-2">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                className="bg-white text-foreground"
                placeholder="MONCODE123"
              />
              <Button type="button" variant="secondary" onClick={() => setCode(generateCode())}>
                Générer
              </Button>
            </div>
          </div>
          <Button
            size="lg"
            className="mt-6 w-full bg-white text-primary hover:bg-white/90"
            onClick={() => {
              if (!code) return toast.error("Choisis un code");
              setIsAffiliate(true);
              toast.success("Compte affilié créé 🎉");
            }}
          >
            Créer mon compte affilié
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Programme d'Affiliation AFRISELL"
        subtitle="Parraine des marchands et gagne 1,5$ (875 FCFA) par inscription réussie"
        actions={
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
            💸 Commission : 1,5$ par filleul
          </span>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile icon={Wallet} tone="success" label="Gains totaux" value={usd(13.5)} hint={fcfa(13.5 * USD_TO_FCFA)} />
        <StatTile icon={Users} tone="primary" label="Filleuls actifs" value="9" />
        <StatTile icon={MousePointerClick} tone="primary" label="Clics sur mon lien" value="247" />
        <StatTile icon={Clock} tone="warning" label="En attente" value={usd(3)} hint={fcfa(3 * USD_TO_FCFA)} />
      </div>

      {/* My link */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Mon lien d'affiliation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-4 py-3 font-mono text-sm break-all">
            <Link2 className="h-4 w-4 shrink-0 text-primary" />
            {link}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={copyLink}><Copy className="h-4 w-4" /> Copier le lien</Button>
            <Button asChild className="bg-success hover:bg-success/90 text-white">
              <a href={`https://wa.me/?text=${waMsg}`} target="_blank" rel="noreferrer">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" className="border-[#1877F2] text-[#1877F2] hover:bg-[#1877F2]/10">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`}
                target="_blank" rel="noreferrer"
              >
                <Facebook className="h-4 w-4" /> Facebook
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referrals */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Mes filleuls</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-3 py-2">Nom</th>
                  <th className="px-3 py-2">Date d'inscription</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="px-3 py-2">Commission</th>
                </tr>
              </thead>
              <tbody>
                {REFERRALS.map((r) => (
                  <tr key={r.name} className="border-b border-border/70">
                    <td className="px-3 py-3 font-medium">{r.name}</td>
                    <td className="px-3 py-3 text-muted-foreground">{r.date}</td>
                    <td className="px-3 py-3">{statusBadge(r.status)}</td>
                    <td className="px-3 py-3 font-semibold">
                      {usd(1.5)}{" "}
                      {r.paid
                        ? <span className="text-success">✓ Payé</span>
                        : <span className="text-warning">⏳</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Retirer mes gains</CardTitle>
          <p className="text-sm text-muted-foreground">Solde disponible : <span className="font-semibold text-foreground">{both(10.5)}</span></p>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => { e.preventDefault(); toast.success("Demande de retrait envoyée"); }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <div>
              <Label>Montant à retirer ($)</Label>
              <Input type="number" min={5} step="0.5" placeholder="5.00" />
            </div>
            <div>
              <Label>Méthode Mobile Money</Label>
              <select className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option>MTN MoMo</option><option>Moov Money</option><option>Wave</option>
              </select>
            </div>
            <div>
              <Label>Numéro Mobile Money</Label>
              <Input placeholder="+229 90 00 00 00" />
            </div>
            <div>
              <Label>Nom du bénéficiaire</Label>
              <Input placeholder="Nom complet" />
            </div>
            <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">Retrait minimum : 5$ — Traitement sous 48h ouvrées</p>
              <Button type="submit">Demander un retrait</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* How it works */}
      <h2 className="text-lg font-bold mb-3">Comment ça marche ?</h2>
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        {[
          { icon: Link2, title: "Copie ton lien unique", desc: "Partage-le sur WhatsApp, Facebook, Instagram ou par email." },
          { icon: UserPlus, title: "Un marchand s'inscrit", desc: "Dès qu'il crée son compte via ton lien, il devient ton filleul." },
          { icon: DollarSign, title: "Tu gagnes 1,5$", desc: "La commission est créditée automatiquement sur ton compte affilié." },
        ].map((s, i) => (
          <div key={s.title} className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3">
              <s.icon className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground">Étape {i + 1}</p>
            <h3 className="font-semibold mt-1">{s.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <Card className="mb-6">
        <CardHeader><CardTitle>Évolution de mes gains (30 derniers jours)</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${v}`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => usd(v)} />
                <Line type="monotone" dataKey="gains" stroke="#4645E7" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Rules */}
      <Card>
        <CardHeader><CardTitle>Règles du programme</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {[
              { ok: true, t: "Commission de 1,50$ (≈ 875 FCFA) par filleul actif" },
              { ok: true, t: "Filleul validé après création de son premier produit" },
              { ok: true, t: "Retrait possible dès 5$ accumulés" },
              { ok: true, t: "Paiement via MTN MoMo, Moov Money ou Wave" },
              { ok: true, t: "Pas de limite de filleuls — plus tu partages, plus tu gagnes" },
              { ok: false, t: "Auto-parrainage non autorisé" },
              { ok: false, t: "Spam et publicité mensongère interdits" },
            ].map((r) => (
              <li key={r.t} className="flex items-start gap-2">
                <span className={r.ok ? "text-success" : "text-destructive"}>{r.ok ? "✓" : "✗"}</span>
                <span>{r.t}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </AppShell>
  );
}