import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Rocket,
  Smartphone,
  PackageSearch,
  Store,
  PlusCircle,
  Wallet,
  Star,
  Facebook,
  Instagram,
  Twitter,
  ArrowRight,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import featureBoutique from "@/assets/feature-boutique.png.asset.json";
import featureMomo from "@/assets/feature-momo.png.asset.json";
import featureAlibaba from "@/assets/feature-alibaba.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZENTY — Vends en ligne en Afrique avec Mobile Money" },
      {
        name: "description",
        content:
          "Crée ta boutique en ligne en 5 minutes et encaisse en MTN MoMo, Moov et Wave. ZENTY est la plateforme e-commerce des marchands africains.",
      },
      { property: "og:title", content: "ZENTY — Vends en ligne en Afrique" },
      {
        property: "og:description",
        content:
          "Boutique pro, gestion des commandes et paiements Mobile Money — en 5 minutes.",
      },
    ],
  }),
  component: LandingPage,
});

const PURPLE = "#6B4BCC";

function CtaButton({
  children,
  size = "md",
  to = "/auth",
}: {
  children: React.ReactNode;
  size?: "md" | "lg";
  to?: string;
}) {
  return (
    <Link
      to={to}
      search={to === "/auth" ? ({ mode: "signup" as const, redirect: "/creer-boutique" }) : undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 ${
        size === "lg" ? "px-7 py-4 text-base" : "px-5 py-3 text-sm"
      }`}
      style={{ backgroundColor: PURPLE, boxShadow: `0 10px 30px ${PURPLE}40` }}
    >
      {children}
      <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

const features = [
  {
    icon: Rocket,
    image: featureBoutique.url,
    title: "Boutique en 5 min",
    desc: "Lance ta boutique en ligne professionnelle sans coder, depuis ton téléphone.",
  },
  {
    icon: Smartphone,
    image: featureMomo.url,
    title: "Mobile Money intégré",
    desc: "Encaisse via MTN MoMo, Moov et Wave. Tes clients paient comme ils ont l'habitude.",
  },
  {
    icon: PackageSearch,
    image: featureAlibaba.url,
    title: "Import depuis Alibaba",
    desc: "Importe des produits gagnants en un clic et commence à vendre immédiatement.",
  },
];

const testimonials = [
  {
    name: "Awa Diop",
    city: "Dakar, Sénégal",
    initials: "AD",
    quote:
      "Avec ZENTY j'ai lancé ma boutique de cosmétiques en une après-midi. Je reçois mes paiements Wave directement, c'est magique.",
  },
  {
    name: "Kouadio Yao",
    city: "Abidjan, Côte d'Ivoire",
    initials: "KY",
    quote:
      "Je gère plus de 80 commandes par semaine depuis ZENTY. Le paiement à la livraison et MTN MoMo fonctionnent parfaitement.",
  },
  {
    name: "Fatou Aïkpé",
    city: "Cotonou, Bénin",
    initials: "FA",
    quote:
      "L'import Alibaba m'a fait gagner des semaines. Aujourd'hui ma boutique tourne et mes clients adorent l'expérience.",
  },
];

const steps = [
  { icon: Store, title: "Crée ta boutique", desc: "Choisis un nom, un logo et tu es en ligne." },
  { icon: PlusCircle, title: "Ajoute tes produits", desc: "Importe d'Alibaba ou ajoute tes propres produits." },
  { icon: Wallet, title: "Encaisse tes paiements", desc: "Mobile Money et cash à la livraison, sans stress." },
];

function LandingPage() {
  const { user, loading } = useAuth();
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("À bientôt !");
  };
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="ZENTY accueil">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">Fonctionnalités</a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground">Témoignages</a>
            <a href="#how" className="text-sm font-medium text-muted-foreground hover:text-foreground">Comment ça marche</a>
            <Link to="/abonnement" className="text-sm font-medium text-muted-foreground hover:text-foreground">Tarifs</Link>
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
            <CtaButton>Créer ma boutique gratuite</CtaButton>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: `radial-gradient(60% 50% at 50% 0%, ${PURPLE}22, transparent 70%)`,
          }}
        />
        <div className="mx-auto max-w-5xl px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-20 lg:pt-28">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold"
            style={{ borderColor: `${PURPLE}40`, color: PURPLE, backgroundColor: `${PURPLE}10` }}
          >
            <Star className="h-3.5 w-3.5" /> Fait en Afrique, pour l'Afrique
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Vends en ligne en Afrique,{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: `linear-gradient(135deg, ${PURPLE}, #9b7bff)` }}
            >
              encaisse en Mobile Money
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            ZENTY te donne une boutique professionnelle, la gestion de tes commandes et les
            paiements MTN MoMo, Moov et Wave — en 5 minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <CtaButton size="lg">Commencer gratuitement</CtaButton>
            <a href="#how" className="text-sm font-semibold text-muted-foreground hover:text-foreground">
              Voir comment ça marche →
            </a>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Sans carte bancaire · Sans engagement</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Pourquoi ZENTY ?</h2>
          <p className="mt-3 text-muted-foreground">Tout ce qu'il te faut pour vendre, dans une seule app.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="aspect-[16/10] w-full overflow-hidden">
                <img
                  src={f.image}
                  alt={f.title}
                  loading="lazy"
                  width={1024}
                  height={640}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-7">
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-muted/40 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ils vendent déjà avec ZENTY</h2>
            <p className="mt-3 text-muted-foreground">Des marchands de toute l'Afrique francophone nous font confiance.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-border bg-card p-7 shadow-sm">
                <div className="flex gap-0.5" style={{ color: PURPLE }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: PURPLE }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Comment ça marche</h2>
          <p className="mt-3 text-muted-foreground">3 étapes simples pour commencer à vendre.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="relative rounded-2xl border border-border bg-card p-7 shadow-sm">
              <div
                className="absolute -top-4 left-7 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white shadow-md"
                style={{ backgroundColor: PURPLE }}
              >
                {i + 1}
              </div>
              <s.icon className="h-8 w-8" style={{ color: PURPLE }} />
              <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <CtaButton size="lg">Créer ma boutique gratuite</CtaButton>
        </div>
      </section>

      {/* Footer */}
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
                  style={{ transition: "all 0.2s" }}
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
        <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ZENTY. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
