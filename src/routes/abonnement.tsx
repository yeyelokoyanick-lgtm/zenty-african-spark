import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
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

type Plan = {
  id: "starter" | "pro";
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
    name: "Essai gratuit",
    tagline: "Pour lancer ta première boutique sans rien payer",
    monthly: 0,
    features: [
      "Gratuit jusqu'à 1 an",
      "Jusqu'à 10 ventes",
      "Jusqu'à 85 $ de ventes cumulées",
      "Une seule boutique",
    ],
    cta: "Commencer gratuitement",
  },
  {
    id: "pro",
    name: "Plan Unique",
    tagline: "Tout AFRISELL, sans limite",
    monthly: 5000,
    features: [
      "Produits et ventes illimités",
      "Paiement à la livraison (COD)",
      "Produits digitaux et encaissement",
      "Accès aux agences de livraison",
      "Accès aux closeurs",
      "Import Alibaba",
      "Support prioritaire",
    ],
    cta: "Activer le Plan Unique",
    popular: true,
  },
];

const COMPARISON: Array<{ label: string; values: [string, string] }> = [
  { label: "Durée", values: ["1 an max", "Sans limite"] },
  { label: "Ventes", values: ["10 max", "Illimitées"] },
  { label: "Chiffre d'affaires", values: ["85 $ max", "Illimité"] },
  { label: "Boutiques", values: ["1", "Illimitées"] },
  { label: "Paiement à la livraison (COD)", values: ["Inclus", "Inclus"] },
  { label: "Produits digitaux", values: ["Inclus", "Inclus"] },
  { label: "Agences de livraison", values: ["—", "Inclus"] },
  { label: "Closeurs", values: ["—", "Inclus"] },
  { label: "Import Alibaba", values: ["—", "Inclus"] },
  { label: "Support", values: ["Limité", "Prioritaire"] },
];

function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}


function AbonnementPage() {
  const [modalPlan, setModalPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "+229" });
  const [processing, setProcessing] = useState(false);
  const [activePlan, setActivePlan] = useState<"starter" | "pro">("starter");
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
    setProcessing(true);
    verifyPayment({ data: { paymentId } })
      .then((res) => {
        if (res.success) {
          setActivePlan("pro");
          setSuccessPlan({ name: "Plan Unique", price: "5 000 FCFA" });
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
    const parts = form.name.trim().split(/\s+/);
    setProcessing(true);
    try {
      const { checkoutUrl } = await initPayment({
        data: {
          amount: 5000,
          currency: "XOF",
          description: "Abonnement AFRISELL Plan Unique — 1 mois",
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
      toast.success("Essai gratuit activé. Bienvenue sur AFRISELL !");
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
          {activePlan === "starter" && "Essai gratuit"}
          {activePlan === "pro" && "Plan Unique — Actif ✓"}
        </span>
      </div>

      {/* Header */}
      <section className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Un seul plan, tout inclus
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
          Commence gratuitement, puis passe au Plan Unique à 5 000 FCFA / mois.
        </p>

        <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
          Essai gratuit pour ta première boutique : jusqu'à 1 an, 10 ventes ou
          85 $ de ventes cumulées. Dès qu'une de ces limites est atteinte,
          l'abonnement de 5 000 FCFA / mois est automatiquement facturé.
        </div>
      </section>

      {/* Pricing cards */}
      <section className="mx-auto mt-10 grid max-w-3xl gap-6 md:grid-cols-2">
        {PLANS.map((plan) => {
          const price = plan.monthly;
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
                  Recommandé
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
                    {plan.monthly === 0 ? "0" : formatFcfa(price)}
                  </span>
                  <span className={cn("text-sm font-medium", isPopular ? "text-white/80" : "text-muted-foreground")}>
                    FCFA{plan.monthly > 0 ? " / mois" : ""}
                  </span>
                </div>
                {plan.monthly === 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Puis 5 000 FCFA / mois après les limites de l'essai
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
        Paiements 100% sécurisés par Moneroo — MTN MoMo, Moov Money et carte bancaire acceptés
      </p>



      {/* Payment methods */}
      <section className="mt-14">
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
            <Button onClick={handleConfirm} disabled={processing} className="h-11 px-6 font-semibold">
              {processing ? "Redirection..." : "Procéder au paiement"}
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