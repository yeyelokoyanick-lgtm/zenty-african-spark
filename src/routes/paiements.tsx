import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Wallet,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Banknote,
  Smartphone,
  ShieldCheck,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatFCFA } from "@/data/dashboard";

export const Route = createFileRoute("/paiements")({
  head: () => ({
    meta: [
      { title: "Paiements — AFRISELL" },
      {
        name: "description",
        content:
          "Gérez vos revenus, méthodes de paiement et reversements Mobile Money sur AFRISELL.",
      },
      { property: "og:title", content: "Paiements — AFRISELL" },
      {
        property: "og:description",
        content: "Revenus, Mobile Money et reversements sécurisés.",
      },
    ],
  }),
  component: PaiementsRoute,
});

type TxStatus = "En attente" | "Payé" | "Reversé";
type Method = "Livraison" | "MTN Money" | "Moov Money" | "Orange Money";

interface Tx {
  id: string;
  date: string;
  customer: string;
  method: Method;
  amount: number;
  status: TxStatus;
}

const TRANSACTIONS: Tx[] = [
  { id: "TX-5021", date: "2025-04-27", customer: "Jacques M.", method: "Livraison", amount: 11000, status: "En attente" },
  { id: "TX-5020", date: "2025-04-27", customer: "Aïcha B.", method: "MTN Money", amount: 23000, status: "Payé" },
  { id: "TX-5019", date: "2025-04-26", customer: "Mamadou D.", method: "Moov Money", amount: 9500, status: "Payé" },
  { id: "TX-5018", date: "2025-04-25", customer: "Fatou K.", method: "Orange Money", amount: 13000, status: "Reversé" },
  { id: "TX-5017", date: "2025-04-25", customer: "Ibrahim S.", method: "Livraison", amount: 16000, status: "En attente" },
  { id: "TX-5016", date: "2025-04-24", customer: "Awa T.", method: "MTN Money", amount: 16000, status: "Reversé" },
];

const statusStyles: Record<TxStatus, string> = {
  "En attente": "bg-muted text-muted-foreground border border-border",
  "Payé": "bg-primary/10 text-primary border border-primary/20",
  "Reversé": "bg-success/15 text-success border border-success/25",
};

const METHOD_LABELS: Record<"cod" | "mtn" | "moov" | "orange", string> = {
  cod: "Paiement à la livraison",
  mtn: "MTN Mobile Money",
  moov: "Moov Money",
  orange: "Orange Money",
};

function PaiementsRoute() {
  return (
    <AppShell>
      <PaiementsPage />
    </AppShell>
  );
}

function PaiementsPage() {
  const [methods, setMethods] = useState({
    cod: true,
    mtn: true,
    moov: false,
    orange: false,
  });

  const [payout, setPayout] = useState({ number: "", name: "", amount: "" });

  const summary = useMemo(
    () => [
      { label: "Revenus totaux", value: 842500, icon: TrendingUp, tint: "var(--brand-blue)", hint: "Depuis le début" },
      { label: "Solde disponible", value: 215300, icon: Wallet, tint: "var(--success)", hint: "Prêt à retirer" },
      { label: "Solde en attente", value: 88400, icon: Clock, tint: "var(--warning)", hint: "Commandes en cours" },
      { label: "Total reversé", value: 538800, icon: ArrowUpRight, tint: "var(--brand-purple)", hint: "Déjà retiré" },
    ],
    [],
  );

  const toggle = (key: keyof typeof methods) => {
    setMethods((m) => {
      const next = { ...m, [key]: !m[key] };
      toast.success(`${METHOD_LABELS[key]} ${next[key] ? "activé" : "désactivé"}`);
      return next;
    });
  };

  const submitPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payout.number.trim() || !payout.name.trim() || !payout.amount.trim()) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    const amt = Number(payout.amount);
    if (!amt || amt <= 0) {
      toast.error("Montant invalide");
      return;
    }
    toast.success("Demande de retrait envoyée", {
      description: `${formatFCFA(amt)} vers ${payout.number}`,
    });
    setPayout({ number: "", name: "", amount: "" });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Paiements
        </h1>
        <p className="text-sm text-muted-foreground">
          Gérez vos revenus, paiements et reversements
        </p>
      </header>

      {/* Financial summary */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-card p-4 shadow-sm transition hover:shadow-md"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: "var(--gradient-brand-soft)", color: s.tint }}
            >
              <s.icon className="h-5 w-5" />
            </div>
            <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {s.label}
            </p>
            <p className="mt-1 text-lg font-bold text-foreground sm:text-xl">
              {formatFCFA(s.value)}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{s.hint}</p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Payment methods */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Modes de paiement
              </h2>
              <p className="text-sm text-muted-foreground">
                Activez ou désactivez vos méthodes
              </p>
            </div>
            <ShieldCheck className="h-5 w-5 text-success" />
          </div>

          <ul className="mt-4 divide-y divide-border">
            <MethodRow
              icon={<Banknote className="h-5 w-5" style={{ color: "var(--brand-blue)" }} />}
              title="Paiement à la livraison"
              subtitle="Cash on delivery — le client paie en recevant"
              checked={methods.cod}
              onToggle={() => toggle("cod")}
            />
            <MethodRow
              icon={<Smartphone className="h-5 w-5" style={{ color: "oklch(0.72 0.18 55)" }} />}
              title="MTN Mobile Money"
              subtitle="Paiement sécurisé via MTN MoMo"
              checked={methods.mtn}
              onToggle={() => toggle("mtn")}
            />
            <MethodRow
              icon={<Smartphone className="h-5 w-5" style={{ color: "var(--brand-blue)" }} />}
              title="Moov Money"
              subtitle="Transferts Moov Africa"
              checked={methods.moov}
              onToggle={() => toggle("moov")}
            />
            <MethodRow
              icon={<Smartphone className="h-5 w-5" style={{ color: "var(--brand-orange)" }} />}
              title="Orange Money"
              subtitle="Paiement via Orange Money"
              checked={methods.orange}
              onToggle={() => toggle("orange")}
            />
          </ul>
        </section>

        {/* Payout */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Reversement</h2>
              <p className="text-xs text-muted-foreground">Retrait vers Mobile Money</p>
            </div>
          </div>

          <form onSubmit={submitPayout} className="mt-4 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="mm-number">Numéro Mobile Money</Label>
              <Input
                id="mm-number"
                inputMode="tel"
                placeholder="+225 07 00 00 00 00"
                value={payout.number}
                onChange={(e) => setPayout((p) => ({ ...p, number: e.target.value }))}
                maxLength={20}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mm-name">Nom du bénéficiaire</Label>
              <Input
                id="mm-name"
                placeholder="Ex. Kouadio Jean"
                value={payout.name}
                onChange={(e) => setPayout((p) => ({ ...p, name: e.target.value }))}
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mm-amount">Montant (FCFA)</Label>
              <Input
                id="mm-amount"
                inputMode="numeric"
                placeholder="50 000"
                value={payout.amount}
                onChange={(e) =>
                  setPayout((p) => ({ ...p, amount: e.target.value.replace(/\D/g, "").slice(0, 9) }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Disponible : <span className="font-medium text-foreground">215 300 FCFA</span>
              </p>
            </div>
            <Button
              type="submit"
              className="w-full text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              Demander un retrait
            </Button>
            <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-2.5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
              <p className="text-xs text-muted-foreground">
                Transactions sécurisées et chiffrées de bout en bout.
              </p>
            </div>
          </form>
        </section>
      </div>

      {/* Transactions */}
      <section className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border p-5">
          <h2 className="text-base font-semibold text-foreground">
            Historique des transactions
          </h2>
          <p className="text-sm text-muted-foreground">Dernières opérations financières</p>
        </div>

        {/* Desktop */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Méthode</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="pr-5 text-right">Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TRANSACTIONS.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="pl-5 text-sm text-muted-foreground">
                    {new Date(tx.date).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell className="font-medium">{tx.customer}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{tx.method}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatFCFA(tx.amount)}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        statusStyles[tx.status],
                      )}
                    >
                      {tx.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile */}
        <ul className="divide-y divide-border md:hidden">
          {TRANSACTIONS.map((tx) => (
            <li key={tx.id} className="flex items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{tx.customer}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(tx.date).toLocaleDateString("fr-FR")} · {tx.method}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-semibold text-foreground">
                  {formatFCFA(tx.amount)}
                </span>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium",
                    statusStyles[tx.status],
                  )}
                >
                  {tx.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Coming soon */}
      <section
        className="relative overflow-hidden rounded-2xl border border-border p-5 shadow-sm"
        style={{ background: "var(--gradient-brand-soft)" }}
      >
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-semibold text-foreground">
                  Carte bancaire & paiements automatiques
                </h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-card px-2 py-0.5 text-[10px] font-semibold text-primary shadow-sm">
                  <Sparkles className="h-3 w-3" /> Bientôt
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Visa, Mastercard et reversements automatiques bientôt disponibles.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="bg-card"
            onClick={() => toast.success("Vous serez notifié au lancement")}
          >
            Être notifié
          </Button>
        </div>
      </section>
    </div>
  );
}

function MethodRow({
  icon,
  title,
  subtitle,
  checked,
  onToggle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-3.5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onToggle} />
    </li>
  );
}