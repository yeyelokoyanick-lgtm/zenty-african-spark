import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Search,
  Rocket,
  Box,
  ShoppingBag,
  CreditCard,
  Wallet,
  Megaphone,
  MessageCircle,
  Mail,
  ArrowRight,
  BookOpen,
  type LucideIcon,
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
import { toast } from "sonner";

export const Route = createFileRoute("/aide")({
  head: () => ({
    meta: [
      { title: "Centre d'aide — ZENTY" },
      { name: "description", content: "Trouve rapidement des réponses à tes questions sur ZENTY : boutique, produits, commandes COD, paiements, abonnement." },
      { property: "og:title", content: "Centre d'aide — ZENTY" },
      { property: "og:description", content: "Guides, FAQ et support pour réussir ton e-commerce avec ZENTY." },
    ],
  }),
  component: AidePage,
});

const WHATSAPP_NUMBER = "2250700000000"; // placeholder support number

type Category = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: "primary" | "accent" | "success" | "warning";
};

const CATEGORIES: Category[] = [
  { id: "demarrage", title: "Démarrage", description: "Créer ta boutique et commencer", icon: Rocket, tone: "primary" },
  { id: "produits", title: "Produits", description: "Ajouter et gérer tes produits", icon: Box, tone: "accent" },
  { id: "commandes", title: "Commandes", description: "Gérer les commandes et livraisons", icon: ShoppingBag, tone: "success" },
  { id: "paiements", title: "Paiements", description: "Paiement à la livraison et Mobile Money", icon: CreditCard, tone: "warning" },
  { id: "abonnement", title: "Abonnement", description: "Plans et facturation", icon: Wallet, tone: "primary" },
  { id: "marketing", title: "Marketing", description: "Augmenter tes ventes", icon: Megaphone, tone: "accent" },
];

const TONE_CLASSES: Record<Category["tone"], string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/15 text-accent",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "Comment créer ma boutique ?",
    a: "Rends-toi sur le tableau de bord et clique sur « Créer ta boutique en 5 minutes ». Choisis ton nom, ajoute ton logo et publie ta première vitrine — aucune compétence technique requise.",
  },
  {
    q: "Comment ajouter un produit ?",
    a: "Va dans la page Produits puis clique sur « Ajouter un produit ». Renseigne le titre, le prix en FCFA, une photo et le stock. Tu peux aussi importer directement depuis Alibaba avec un simple lien.",
  },
  {
    q: "Comment fonctionne le paiement à la livraison ?",
    a: "Le client commande sans payer en ligne. Tu reçois la commande, tu confirmes par téléphone, le livreur encaisse en espèces et tu reçois ton paiement. C'est le mode le plus utilisé en Afrique.",
  },
  {
    q: "Comment confirmer une commande ?",
    a: "Dans Commandes, ouvre la commande « En attente », appelle le client via le bouton téléphone, puis clique sur « Confirmer ». Tu peux ensuite la marquer expédiée puis livrée.",
  },
  {
    q: "Comment passer au plan Pro ?",
    a: "Va sur la page Abonnement, choisis le plan Pro et clique sur « Passer au Pro ». Paiement par Mobile Money (MTN, Moov) ou carte bancaire. Tu peux annuler à tout moment.",
  },
  {
    q: "Comment contacter un client ?",
    a: "Dans la fiche commande, son numéro est mis en évidence. Un clic sur « Appeler client » ouvre directement l'appel depuis ton téléphone.",
  },
];

const GUIDES: { title: string; description: string }[] = [
  { title: "Créer ta boutique en 5 minutes", description: "Le guide express pour lancer ta vitrine ZENTY." },
  { title: "Ajouter ton premier produit", description: "Photos, prix, stock — tout ce qu'il faut savoir." },
  { title: "Gérer les commandes COD", description: "Confirmation, livraison et encaissement étape par étape." },
  { title: "Booster tes ventes", description: "Astuces marketing pour vendre plus chaque semaine." },
];

function AidePage() {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const filteredCategories = useMemo(
    () =>
      q
        ? CATEGORIES.filter(
            (c) =>
              c.title.toLowerCase().includes(q) ||
              c.description.toLowerCase().includes(q),
          )
        : CATEGORIES,
    [q],
  );

  const filteredFaqs = useMemo(
    () =>
      q
        ? FAQS.filter(
            (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q),
          )
        : FAQS,
    [q],
  );

  const filteredGuides = useMemo(
    () =>
      q
        ? GUIDES.filter(
            (g) =>
              g.title.toLowerCase().includes(q) ||
              g.description.toLowerCase().includes(q),
          )
        : GUIDES,
    [q],
  );

  const noResults =
    q.length > 0 &&
    filteredCategories.length === 0 &&
    filteredFaqs.length === 0 &&
    filteredGuides.length === 0;

  const openWhatsApp = () => {
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour ZENTY, j'ai besoin d'aide.")}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const sendMessage = () => {
    toast.success("Message envoyé — notre équipe te répond sous 24h.");
  };

  return (
    <AppShell>
      {/* Header */}
      <section
        className="overflow-hidden rounded-3xl px-6 py-10 text-center text-white sm:px-10 sm:py-14"
        style={{ background: "var(--gradient-brand)" }}
      >
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Centre d'aide ZENTY
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

      {/* No results */}
      {noResults && (
        <Card className="mt-8 rounded-2xl p-8 text-center">
          <h2 className="text-lg font-semibold text-foreground">Aucun résultat trouvé</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Essaye d'autres mots-clés ou contacte directement notre support.
          </p>
          <Button onClick={openWhatsApp} className="mt-4 rounded-xl">
            <MessageCircle /> Contactez le support
          </Button>
        </Card>
      )}

      {/* Categories */}
      {filteredCategories.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-foreground">Catégories</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Parcours l'aide par thématique
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCategories.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.id}
                  type="button"
                  className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONE_CLASSES[c.tone]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{c.title}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">{c.description}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* FAQ */}
      {filteredFaqs.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-foreground">Questions fréquentes</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Réponses rapides aux questions les plus courantes
          </p>
          <Card className="mt-5 rounded-2xl px-2 sm:px-4">
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((f, i) => (
                <AccordionItem key={f.q} value={`faq-${i}`} className="border-border">
                  <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline sm:text-base">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Card>
        </section>
      )}

      {/* Guides */}
      {filteredGuides.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-foreground">Guides populaires</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Les ressources les plus consultées par les marchands ZENTY
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {filteredGuides.map((g) => (
              <Card key={g.title} className="flex flex-col rounded-2xl p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-foreground">{g.title}</h3>
                </div>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{g.description}</p>
                <Button variant="outline" className="mt-4 w-fit rounded-xl">
                  Voir guide <ArrowRight />
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Contact support */}
      <section
        className="mt-14 overflow-hidden rounded-3xl p-8 text-center text-white sm:p-10"
        style={{ background: "var(--gradient-brand)" }}
      >
        <h2 className="text-2xl font-bold sm:text-3xl">Besoin d'aide ?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/85 sm:text-base">
          Notre équipe est là pour vous aider, du lundi au samedi.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            onClick={openWhatsApp}
            size="lg"
            className="h-12 rounded-xl bg-white px-6 text-sm font-semibold text-primary hover:bg-white/90"
          >
            <MessageCircle /> Contacter sur WhatsApp
          </Button>
          <Button
            onClick={sendMessage}
            size="lg"
            variant="outline"
            className="h-12 rounded-xl border-white/40 bg-transparent px-6 text-sm font-semibold text-white hover:bg-white/10 hover:text-white"
          >
            <Mail /> Envoyer un message
          </Button>
        </div>
        <p className="mt-4 text-xs text-white/70">
          Tu peux aussi consulter nos{" "}
          <Link to="/abonnement" className="underline underline-offset-2 hover:text-white">
            plans d'abonnement
          </Link>
          .
        </p>
      </section>
    </AppShell>
  );
}