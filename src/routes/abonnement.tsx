import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Check,
  Sparkles,
  Smartphone,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  Facebook,
  Instagram,
  Twitter,
  LogOut,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

import { initMonerooPayment, verifyMonerooPayment } from "@/lib/moneroo.functions";


export const Route = createFileRoute("/abonnement")({
  head: () => ({
    meta: [
      { title: "Tarifs — AFRISELL" },
      { name: "description", content: "Un seul plan AFRISELL à 5 000 FCFA/mois, tout inclus. Essai gratuit pour ta première boutique." },
      { property: "og:title", content: "Tarifs — AFRISELL" },
      { property: "og:description", content: "Un plan simple et complet pour vendre en ligne avec AFRISELL." },
    ],
  }),
  component: AbonnementPage,
});

const PURPLE = "#FF6A00";

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


function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n);
}


function AbonnementPage() {
  const { user, loading } = useAuth();
  const [modalPlan, setModalPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "+229" });
  const [processing, setProcessing] = useState(false);
  const [activePlan, setActivePlan] = useState<"starter" | "pro">("starter");
  const [successPlan, setSuccessPlan] = useState<{ name: string; price: string } | null>(null);
  const initPayment = useServerFn(initMonerooPayment);
  const verifyPayment = useServerFn(verifyMonerooPayment);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("À bientôt !");
  };

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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header — identique à la page d'accueil */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="AFRISELL accueil">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/" hash="features" className="text-sm font-medium text-muted-foreground hover:text-foreground">Fonctionnalités</Link>
            <Link to="/" hash="testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground">Témoignages</Link>
            <Link to="/" hash="how" className="text-sm font-medium text-muted-foreground hover:text-foreground">Comment ça marche</Link>
            <Link to="/abonnement" className="text-sm font-semibold" style={{ color: PURPLE }}>Tarifs</Link>
          </nav>
          {loading ? null : user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="hidden rounded-full px-4 py-2 text-sm font-semibold text-white shadow-md sm:inline-flex"
                style={{ backgroundColor: PURPLE }}
              >
                Mon tableau de bord
              </Link>
              <button
                onClick={handleSignOut}
                aria-label="Se déconnecter"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              search={{ mode: "signup" as const, redirect: "/creer-boutique" }}
              className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: PURPLE, boxShadow: `0 10px 30px ${PURPLE}40` }}
            >
              Créer ma boutique gratuite <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="pt-14 text-center sm:pt-20">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold"
            style={{ borderColor: `${PURPLE}40`, color: PURPLE, backgroundColor: `${PURPLE}10` }}
          >
            <Sparkles className="h-3.5 w-3.5" /> Tarifs simples et transparents
          </span>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Un seul plan,{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${PURPLE}, #E52F07)` }}
            >
              tout inclus
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Toute la puissance d'AFRISELL, sans compromis
          </p>
        </section>

        {/* Pricing cards */}
        <section className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
          {PLANS.map((plan) => {
            const price = plan.monthly;
            const isPopular = plan.popular;
            return (
              <div
                key={plan.id}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card p-7 transition-all hover:-translate-y-1",
                  isPopular
                    ? "border-transparent shadow-xl md:-translate-y-2"
                    : "border-border shadow-sm hover:shadow-xl",
                )}
                style={isPopular ? { background: `linear-gradient(135deg, ${PURPLE} 0%, #E52F07 100%)`, color: "white" } : undefined}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold shadow-md" style={{ color: PURPLE }}>
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
                    <span className={cn("text-4xl font-extrabold tracking-tight", isPopular ? "text-white" : "text-foreground")}>
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
                        className={cn("mt-0.5 h-4 w-4 shrink-0", isPopular ? "text-white" : "")}
                        style={isPopular ? undefined : { color: PURPLE }}
                      />
                      <span className={isPopular ? "text-white/95" : "text-foreground"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelect(plan)}
                  className={cn(
                    "mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition-all hover:-translate-y-0.5",
                    isPopular
                      ? "bg-white shadow-lg hover:shadow-xl"
                      : plan.id === "starter"
                        ? "border-2 bg-transparent"
                        : "text-white shadow-lg",
                  )}
                  style={
                    isPopular
                      ? { color: PURPLE }
                      : plan.id === "starter"
                        ? { borderColor: PURPLE, color: PURPLE }
                        : { backgroundColor: PURPLE, boxShadow: `0 10px 30px ${PURPLE}40` }
                  }
                >
                  {plan.cta}
                </button>
              </div>
            );
          })}
        </section>

        {/* Payment methods */}
        <section className="mx-auto mt-14 max-w-3xl">
          <div className="rounded-2xl border border-border bg-card p-7 shadow-sm">
            <h3 className="text-lg font-bold text-foreground">Modes de paiement</h3>
            <p className="mt-1 text-sm text-muted-foreground">Paiement simple et sécurisé</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${PURPLE}15`, color: PURPLE }}>
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Mobile Money</p>
                  <p className="text-xs text-muted-foreground">MTN, Moov</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${PURPLE}15`, color: PURPLE }}>
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Carte bancaire</p>
                  <p className="text-xs text-muted-foreground">Visa, Mastercard</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mt-14 mb-16 overflow-hidden rounded-3xl p-8 text-center text-white sm:p-12"
          style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #E52F07 100%)` }}
        >
          <h2 className="text-2xl font-extrabold sm:text-3xl">Prêt à lancer ton business ?</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm text-white/90 sm:text-base">
            Rejoins des milliers de marchands africains qui vendent déjà avec AFRISELL.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/auth"
              search={{ mode: "signup" as const, redirect: "/creer-boutique" }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-base font-bold shadow-lg transition-all hover:-translate-y-0.5"
              style={{ color: PURPLE }}
            >
              Créer ma boutique gratuite <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer — identique à la page d'accueil */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              La plateforme e-commerce des marchands africains. Mobile Money & paiement à la livraison.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <p className="mb-1 font-semibold">Navigation</p>
            <Link to="/" className="text-muted-foreground hover:text-foreground">Accueil</Link>
            <Link to="/abonnement" className="text-muted-foreground hover:text-foreground">Tarifs</Link>
            <Link to="/aide" className="text-muted-foreground hover:text-foreground">Contact</Link>
          </div>
          <div>
            <p className="mb-3 text-sm font-semibold">Suis-nous</p>
            <div className="flex gap-3">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Réseau social"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-white"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = PURPLE;
                    e.currentTarget.style.borderColor = PURPLE;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.borderColor = "";
                  }}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6 lg:px-8">
            <p>© {new Date().getFullYear()} AFRISELL. Tous droits réservés.</p>
            <nav className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/" hash="features" className="hover:text-foreground">Fonctionnalités</Link>
              <Link to="/abonnement" className="hover:text-foreground">Tarifs</Link>
              <Link to="/agences" className="hover:text-foreground">Agences</Link>
              <Link to="/aide" className="hover:text-foreground">Aide</Link>
            </nav>
            <p className="font-medium">🔒 Paiements sécurisés par Moneroo</p>
          </div>
        </div>
      </footer>

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
            <Button asChild className="mt-6 h-11 w-full rounded-full font-semibold">
              <Link to="/dashboard" onClick={() => setSuccessPlan(null)}>Retour au tableau de bord</Link>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
