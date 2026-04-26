import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, Smartphone, CreditCard, ShieldCheck, RefreshCw, Headset } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/abonnement")({
  head: () => ({
    meta: [
      { title: "Abonnement — ZENTY" },
      { name: "description", content: "Choisis ton plan ZENTY et lance ton business en ligne en Afrique. Starter gratuit, Pro et Business." },
      { property: "og:title", content: "Abonnement — ZENTY" },
      { property: "og:description", content: "Plans simples et flexibles pour vendre en ligne avec ZENTY." },
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

  const handleSelect = (plan: Plan) => {
    if (plan.id === "starter") {
      toast.success("Plan Starter activé. Bienvenue sur ZENTY !");
    } else {
      toast.success(`Redirection vers le paiement — Plan ${plan.name}`);
    }
  };

  return (
    <AppShell>
      {/* Header */}
      <section className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Choisis ton plan
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
          Lance et développe ton business en ligne avec ZENTY
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
          <p className="mt-1 text-sm text-muted-foreground">Choisis ZENTY en toute sérénité.</p>
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
          Rejoins des milliers de marchands africains qui vendent déjà avec ZENTY.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-6 h-12 rounded-xl bg-white px-8 text-sm font-semibold text-primary hover:bg-white/90"
        >
          <Link to="/produits">Créer ma boutique maintenant</Link>
        </Button>
      </section>
    </AppShell>
  );
}