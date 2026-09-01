import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, Smartphone, CreditCard, ShieldCheck, RefreshCw, Headset, Lock, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { initMonerooPayment, verifyMonerooPayment } from "@/lib/moneroo.functions";


export const Route = createFileRoute("/abonnement")({
  head: () => ({
    meta: [
      { title: "Abonnement — AFRISELL" },
      { name: "description", content: "Choisis ton plan AFRISELL et lance ton business en ligne en Afrique. Starter gratuit, Pro et Business." },
      { property: "og:title", content: "Abonnement — AFRISELL" },
      { property: "og:description", content: "Plans simples et flexibles pour vendre en ligne avec AFRISELL." },
    ],
  }),
  component: AbonnementPage,
});

type Billing = "monthly" | "yearly";

type Plan = {
  id: "starter" | "pro" | "business";
  name: string;
  tagline: string;
  monthly: number;
  features: string[];
  cta: string;
  popular?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Pour découvrir et tester ta boutique",
    monthly: 0,
    features: [
      "5 produits maximum",
      "10 commandes / mois",
      "Boutique basique",
      "Support limité",
    ],
    cta: "Commencer gratuitement",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Pour vendre sérieusement chaque jour",
    monthly: 5000,
    features: [
      "Produits illimités",
      "Commandes illimitées",
      "Paiement à la livraison (COD)",
      "Import Alibaba",
      "Support prioritaire",
    ],
    cta: "Passer au Pro",
    popular: true,
  },
  {
    id: "business",
    name: "Business",
    tagline: "Pour scaler et gérer plusieurs boutiques",
    monthly: 10000,
    features: [
      "Tout du plan Pro",
      "Multi-boutiques",
      "Statistiques avancées",
      "Support VIP",
      "Accès formations e-commerce",
    ],
    cta: "Passer au Business",
  },
];

const COMPARISON: Array<{ label: string; values: [string, string, string] }> = [
  { label: "Produits", values: ["5", "Illimités", "Illimités"] },
  { label: "Commandes / mois", values: ["10", "Illimitées", "Illimitées"] },
  { label: "Paiement à la livraison (COD)", values: ["—", "Inclus", "Inclus"] },
  { label: "Import Alibaba", values: ["—", "Inclus", "Inclus"] },
  { label: "Multi-boutiques", values: ["—", "—", "Inclus"] },
  { label: "Statistiques avancées", values: ["—", "Basiques", "Avancées"] },
  { label: "Support", values: ["Limité", "Prioritaire", "VIP"] },
];

function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

function AbonnementPage() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [modalPlan, setModalPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "+229" });
  const [processing, setProcessing] = useState(false);
  const [activePlan, setActivePlan] = useState<"starter" | "pro" | "business">("starter");
  const [successPlan, setSuccessPlan] = useState<{ name: string; price: string } | null>(null);
  const initPayment = useServerFn(initMonerooPayment);
  const verifyPayment = useServerFn(verifyMonerooPayment);

  const fireConfetti = () => {
    const end = Date.now() + 1200;
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0 } });
      confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  /* Retour depuis Moneroo : on vérifie le paiement côté serveur */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get("paymentId") ?? params.get("paymentID");
    if (!paymentId) return;
    const planId = (params.get("plan") as "pro" | "business" | null) ?? "pro";
    setProcessing(true);
    verifyPayment({ data: { paymentId } })
      .then((res) => {
        if (res.success) {
          const label = planId === "business" ? "Business" : "Pro";
          setActivePlan(planId);
          setSuccessPlan({ name: label, price: planId === "business" ? "10 000 FCFA" : "5 000 FCFA" });
          fireConfetti();
        } else {
          toast.error("Paiement non abouti. Aucun montant n'a été débité.");
        }
      })
      .catch((e: any) => toast.error(e?.message || "Vérification du paiement impossible"))
      .finally(() => {
        setProcessing(false);
        window.history.replaceState({}, "", window.location.pathname);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const launchMoneroo = async (plan: Plan) => {
    const amount = plan.id === "pro" ? 5000 : 10000;
    const label = plan.id === "pro" ? "Pro" : "Business";
    const parts = form.name.trim().split(/\s+/);
    setProcessing(true);
    try {
      const { checkoutUrl } = await initPayment({
        data: {
          amount,
          currency: "XOF",
          description: `Abonnement AFRISELL ${label} — 1 mois`,
          returnUrl: `${window.location.origin}/abonnement?plan=${plan.id}`,
          customer: {
            email: form.email.trim(),
            first_name: parts[0] || "Client",
            last_name: parts.slice(1).join(" ") || parts[0] || "AFRISELL",
            phone: form.phone.trim(),
          },
          metadata: { kind: "subscription", plan: plan.id },
        },
      });
      window.location.href = checkoutUrl;
    } catch (e: any) {
      setProcessing(false);
      toast.error(e?.message || "Une erreur est survenue lors de l'initialisation du paiement.");
    }
  };

  const handleConfirm = () => {
    if (!modalPlan) return;
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Merci de remplir tous les champs.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error("Email invalide.");
      return;
    }
    void launchMoneroo(modalPlan);
  };


  const handleSelect = (plan: Plan) => {
    if (plan.id === "starter") {
      setActivePlan("starter");
      toast.success("Plan Starter activé. Bienvenue sur AFRISELL !");
      return;
    }
    setModalPlan(plan);
  };

  return (
    <AppShell>
      {/* Active plan banner */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-sm shadow-sm">
        <span className="text-muted-foreground">Plan actuel :</span>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
            activePlan === "starter"
              ? "bg-muted text-foreground"
              : "bg-success/15 text-success",
          )}
        >
          {activePlan === "starter" && "Plan Starter"}
          {activePlan === "pro" && "Plan Pro — Actif ✓"}
          {activePlan === "business" && "Plan Business — Actif ✓"}
        </span>
      </div>

      {/* Header */}
      <section className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Choisis ton plan
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
          Lance et développe ton business en ligne avec AFRISELL
        </p>

        {/* Toggle */}
        <div className="mx-auto mt-6 inline-flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
          <button
            onClick={() => setBilling("monthly")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              billing === "monthly"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              billing === "yearly"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Annuel
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold",
                billing === "yearly"
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-success/15 text-success",
              )}
            >
              -20%
            </span>
          </button>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {PLANS.map((plan) => {
          const price = billing === "yearly" ? Math.round(plan.monthly * 0.8) : plan.monthly;
          const isPopular = plan.popular;
          return (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl p-6 transition-all",
                isPopular
                  ? "border-primary/30 shadow-xl md:-translate-y-2"
                  : "shadow-sm hover:shadow-md",
              )}
              style={isPopular ? { background: "var(--gradient-brand)", color: "white" } : undefined}
            >
              {isPopular && (
                <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow-md">
                  <Sparkles className="h-3.5 w-3.5" />
                  Populaire
                </span>
              )}

              <div>
                <h3 className={cn("text-xl font-bold", isPopular ? "text-white" : "text-foreground")}>
                  {plan.name}
                </h3>
                <p className={cn("mt-1 text-sm", isPopular ? "text-white/80" : "text-muted-foreground")}>
                  {plan.tagline}
                </p>
              </div>

              <div className="mt-5">
                <div className="flex items-baseline gap-1">
                  <span className={cn("text-4xl font-bold tracking-tight", isPopular ? "text-white" : "text-foreground")}>
                    {formatFcfa(price)}
                  </span>
                  <span className={cn("text-sm font-medium", isPopular ? "text-white/80" : "text-muted-foreground")}>
                    FCFA{plan.monthly > 0 ? " / mois" : ""}
                  </span>
                </div>
                {billing === "yearly" && plan.monthly > 0 && (
                  <p className={cn("mt-1 text-xs", isPopular ? "text-white/75" : "text-muted-foreground")}>
                    Facturé annuellement — économise 20%
                  </p>
                )}
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        isPopular ? "text-white" : "text-success",
                      )}
                    />
                    <span className={isPopular ? "text-white/95" : "text-foreground"}>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSelect(plan)}
                className={cn(
                  "mt-6 h-11 w-full rounded-xl text-sm font-semibold",
                  isPopular && "bg-white text-primary hover:bg-white/90",
                )}
                variant={isPopular ? "default" : plan.id === "starter" ? "outline" : "default"}
              >
                {plan.cta}
              </Button>
            </Card>
          );
        })}
      </section>

      {/* Security badge */}
      <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" />
        Paiements 100% sécurisés par FedaPay — MTN MoMo, Moov Money et carte bancaire acceptés
      </p>

      {/* Billing history */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-foreground">Historique des paiements</h2>
        <Card className="mt-4 overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Plan</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Montant</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Méthode</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Statut</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { date: "01/05/2026", plan: "Pro", amount: "5 000 FCFA", method: "MTN MoMo", status: "Payé" },
                  { date: "01/04/2026", plan: "Pro", amount: "5 000 FCFA", method: "Moov Money", status: "Payé" },
                  { date: "01/03/2026", plan: "Starter", amount: "Gratuit", method: "—", status: "Actif" },
                ].map((r, i) => (
                  <tr key={i} className={cn(i % 2 === 1 && "bg-muted/20")}>
                    <td className="px-4 py-3 text-foreground">{r.date}</td>
                    <td className="px-4 py-3 text-foreground">{r.plan}</td>
                    <td className="px-4 py-3 text-foreground">{r.amount}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.method}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
                        ✓ {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Comparison table */}
      <section className="mt-14">
        <h2 className="text-center text-2xl font-bold text-foreground">Compare les plans</h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-muted-foreground">
          Toutes les fonctionnalités, côte à côte.
        </p>

        <Card className="mt-6 overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">Fonctionnalité</th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">Starter</th>
                  <th className="px-4 py-3 text-center font-semibold text-primary">Pro</th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground">Business</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={row.label} className={cn(i % 2 === 1 && "bg-muted/20")}>
                    <td className="px-4 py-3 font-medium text-foreground">{row.label}</td>
                    {row.values.map((v, idx) => (
                      <td
                        key={idx}
                        className={cn(
                          "px-4 py-3 text-center",
                          v === "—" ? "text-muted-foreground" : "text-foreground",
                          idx === 1 && "bg-primary/5",
                        )}
                      >
                        {v === "Inclus" ? (
                          <Check className="mx-auto h-4 w-4 text-success" />
                        ) : (
                          v
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Payment methods */}
      <section className="mt-14 grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl p-6">
          <h3 className="text-lg font-bold text-foreground">Modes de paiement</h3>
          <p className="mt-1 text-sm text-muted-foreground">Paiement simple et sécurisé</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Mobile Money</p>
                <p className="text-xs text-muted-foreground">MTN, Moov</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Carte bancaire</p>
                <p className="text-xs text-muted-foreground">Visa, Mastercard</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl p-6">
          <h3 className="text-lg font-bold text-foreground">Tu peux nous faire confiance</h3>
          <p className="mt-1 text-sm text-muted-foreground">Choisis AFRISELL en toute sérénité.</p>
          <ul className="mt-4 space-y-3">
            <li className="flex items-center gap-3 text-sm text-foreground">
              <ShieldCheck className="h-5 w-5 text-success" />
              Sans engagement
            </li>
            <li className="flex items-center gap-3 text-sm text-foreground">
              <RefreshCw className="h-5 w-5 text-primary" />
              Annule à tout moment
            </li>
            <li className="flex items-center gap-3 text-sm text-foreground">
              <Headset className="h-5 w-5 text-accent" />
              Support disponible
            </li>
          </ul>
        </Card>
      </section>

      {/* Final CTA */}
      <section
        className="mt-14 overflow-hidden rounded-3xl p-8 text-center text-white sm:p-12"
        style={{ background: "var(--gradient-brand)" }}
      >
        <h2 className="text-2xl font-bold sm:text-3xl">Prêt à lancer ton business ?</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-white/85 sm:text-base">
          Rejoins des milliers de marchands africains qui vendent déjà avec AFRISELL.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-6 h-12 rounded-xl bg-white px-8 text-sm font-semibold text-primary hover:bg-white/90"
        >
          <Link to="/produits">Créer ma boutique maintenant</Link>
        </Button>
      </section>

      {/* Confirmation modal */}
      <Dialog open={!!modalPlan} onOpenChange={(o) => !o && setModalPlan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer votre abonnement</DialogTitle>
            <DialogDescription>
              {modalPlan && (
                <>Plan <span className="font-semibold text-foreground">{modalPlan.name}</span> — <span className="font-semibold text-foreground">{formatFcfa(modalPlan.monthly)} FCFA / mois</span></>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nom complet</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jean Dupont" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jean@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Numéro WhatsApp</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+229..." />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setModalPlan(null)} disabled={processing}>Annuler</Button>
            <Button onClick={handleConfirm} disabled={processing || !sdkReady} className="h-11 px-6 font-semibold">
              {processing ? "Traitement..." : sdkReady ? "Procéder au paiement" : "Chargement..."}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success state */}
      <Dialog open={!!successPlan} onOpenChange={(o) => !o && setSuccessPlan(null)}>
        <DialogContent className="sm:max-w-md text-center">
          <div className="flex flex-col items-center py-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/15 animate-in zoom-in-50 duration-500">
              <CheckCircle2 className="h-12 w-12 text-success" />
            </div>
            <h3 className="mt-4 text-2xl font-bold text-foreground">🎉 Félicitations !</h3>
            <p className="mt-2 text-sm text-foreground">
              Votre abonnement AFRISELL <span className="font-semibold">{successPlan?.name}</span> est maintenant actif.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Toutes les fonctionnalités sont débloquées. Bonne vente !
            </p>
            <Button asChild className="mt-6 h-11 w-full rounded-xl font-semibold">
              <Link to="/dashboard" onClick={() => setSuccessPlan(null)}>Retour au tableau de bord</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}