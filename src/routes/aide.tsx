import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  Rocket,
  CreditCard,
  ShoppingBag,
  MessageCircle,
  ChevronRight,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/aide")({
  head: () => ({
    meta: [
      { title: "Centre d'aide — AFRISELL" },
      { name: "description", content: "Trouve rapidement des réponses à tes questions sur AFRISELL : création de boutique, produits, commandes, paiements." },
      { property: "og:title", content: "Centre d'aide — AFRISELL" },
      { property: "og:description", content: "Guides, FAQ et support pour réussir ton e-commerce avec AFRISELL." },
    ],
  }),
  component: AidePage,
});

const WHATSAPP_NUMBER = "+2250777087360";

interface FaqItem {
  q: string;
  a: string;
  category: string;
}

const FAQS: FaqItem[] = [
  // Démarrer
  {
    category: "Démarrer",
    q: "Comment créer ma boutique sur AFRISELL ?",
    a: "Inscris-toi gratuitement, choisis le nom de ta boutique, ajoute tes produits et partage ton lien. Tout se fait en moins de 5 minutes, sans aucune connaissance technique.",
  },
  {
    category: "Démarrer",
    q: "Comment partager ma boutique avec mes clients ?",
    a: "Dans ton tableau de bord, clique sur 'Partager ma boutique'. Tu obtiens un lien unique que tu peux envoyer sur WhatsApp, Facebook ou Instagram directement.",
  },
  {
    category: "Démarrer",
    q: "Comment ajouter mes produits ?",
    a: "Va dans 'Produits' → '+ Ajouter un produit'. Remplis le nom, le prix en FCFA, le stock et ajoute des photos. Ton produit est visible sur ta boutique immédiatement.",
  },
  // Paiements
  {
    category: "Paiements",
    q: "Comment activer MTN Mobile Money ?",
    a: "Dans 'Paiements', active le toggle MTN MoMo. Tes clients pourront payer directement via Mobile Money. Les fonds sont reversés sur ton numéro dans un délai de 24-48h.",
  },
  {
    category: "Paiements",
    q: "Comment recevoir mon argent ?",
    a: "Dans 'Paiements' → 'Reversement', entre ton numéro Mobile Money et le montant à retirer. Le transfert est effectué sous 24h ouvrées.",
  },
  {
    category: "Paiements",
    q: "Quels modes de paiement puis-je accepter ?",
    a: "AFRISELL supporte : Paiement à la livraison, MTN Mobile Money, Moov Money, Wave et Orange Money. Tu peux activer ou désactiver chaque méthode selon ta préférence.",
  },
  // Commandes
  {
    category: "Commandes",
    q: "Comment confirmer une commande ?",
    a: "Dans 'Commandes', clique sur les 3 points de la commande et sélectionne 'Confirmée'. Ton client reçoit automatiquement une notification WhatsApp.",
  },
  {
    category: "Commandes",
    q: "Comment contacter mon client ?",
    a: "Clique sur le numéro de téléphone dans le tableau des commandes pour appeler directement, ou utilise le bouton WhatsApp pour envoyer un message pré-rempli.",
  },
  {
    category: "Commandes",
    q: "Que faire si un client refuse la livraison ?",
    a: "Change le statut de la commande en 'Annulée' et note la raison. Contacte le client via WhatsApp pour comprendre et proposer une solution alternative.",
  },
];

const CATEGORIES = [
  {
    id: "demarrer",
    title: "Démarrer",
    description: "Créer ta boutique et commencer à vendre",
    icon: Rocket,
    color: "bg-primary/10 text-primary",
  },
  {
    id: "paiements",
    title: "Paiements",
    description: "Mobile Money, reversements et modes de paiement",
    icon: CreditCard,
    color: "bg-success/15 text-success",
  },
  {
    id: "commandes",
    title: "Commandes",
    description: "Gérer les commandes et livraisons",
    icon: ShoppingBag,
    color: "bg-warning/15 text-warning",
  },
];

function AidePage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const q = query.trim().toLowerCase();

  const filteredFaqs = useMemo(() => {
    let items = FAQS;
    if (activeCategory) {
      items = items.filter((f) => f.category === activeCategory);
    }
    if (q) {
      items = items.filter(
        (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q),
      );
    }
    return items;
  }, [q, activeCategory]);

  const openWhatsApp = () => {
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour AFRISELL, j'ai besoin d'aide.")}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <AppShell>
      {/* Hero */}
      <section
        className="overflow-hidden rounded-3xl px-6 py-12 text-center text-white sm:px-10 sm:py-16"
        style={{ background: "var(--gradient-brand)" }}
      >
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Centre d'aide AFRISELL
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/85 sm:text-base">
          Trouve rapidement des réponses à tes questions
        </p>

        <div className="relative mx-auto mt-6 max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une question ou un guide..."
            className="h-12 rounded-xl border-0 bg-white pl-12 text-foreground shadow-lg placeholder:text-muted-foreground"
          />
        </div>
      </section>

      {/* Categories */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-foreground">Catégories</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Parcours l'aide par thématique
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            const isActive = activeCategory === c.title;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() =>
                  setActiveCategory(isActive ? null : c.title)
                }
                className={`group flex items-start gap-4 rounded-2xl border p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${c.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">{c.title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {c.description}
                  </p>
                </div>
                <ChevronRight
                  className={`mt-1 h-4 w-4 transition-transform ${
                    isActive
                      ? "rotate-90 text-primary"
                      : "text-muted-foreground group-hover:translate-x-0.5"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="mt-12">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Questions fréquentes
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeCategory
                ? `Catégorie : ${activeCategory}`
                : "Réponses rapides aux questions les plus courantes"}
            </p>
          </div>
          {activeCategory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveCategory(null)}
              className="text-primary"
            >
              Voir tout
            </Button>
          )}
        </div>

        {filteredFaqs.length > 0 ? (
          <Card className="mt-5 rounded-2xl px-2 sm:px-4">
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((f, i) => (
                <AccordionItem
                  key={`${f.category}-${i}`}
                  value={`faq-${i}`}
                  className="border-border"
                >
                  <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline sm:text-base">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        ) : (
          <Card className="mt-5 rounded-2xl p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Aucune question ne correspond à ta recherche.
            </p>
            <Button
              onClick={() => {
                setQuery("");
                setActiveCategory(null);
              }}
              variant="outline"
              className="mt-3 rounded-xl"
            >
              Réinitialiser la recherche
            </Button>
          </Card>
        )}
      </section>

      {/* Bottom Support */}
      <section className="mt-14 overflow-hidden rounded-3xl bg-white p-8 text-center shadow-sm sm:p-10">
        <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
          Besoin d'aide supplémentaire ?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
          Notre équipe te répond directement sur WhatsApp
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            onClick={openWhatsApp}
            size="lg"
            className="h-12 rounded-xl bg-success px-6 text-sm font-semibold text-white hover:bg-success/90"
          >
            <MessageCircle className="h-5 w-5" />
            Contacter le support WhatsApp
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Disponible du lundi au samedi, 8h - 20h
        </p>
      </section>
    </AppShell>
  );
}
