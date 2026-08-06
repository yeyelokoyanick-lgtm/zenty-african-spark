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
import heroDashboard from "@/assets/hero-dashboard.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AFRISELL — Vends en ligne en Afrique avec Mobile Money" },
      {
        name: "description",
        content:
          "Crée ta boutique en ligne en 5 minutes et encaisse en MTN MoMo, Moov et Wave. AFRISELL est la plateforme e-commerce des marchands africains.",
      },
      { property: "og:title", content: "AFRISELL — Vends en ligne en Afrique" },
      {
        property: "og:description",
        content:
          "Boutique pro, gestion des commandes et paiements Mobile Money — en 5 minutes.",
      },
    ],
  }),
  component: LandingPage,
});

const PURPLE = "#FF6A00";

function CtaButton({
  children,
  size = "md",
  to = "/auth",
  variant = "solid",
}: {
  children: React.ReactNode;
  size?: "md" | "lg";
  to?: string;
  variant?: "solid" | "outline";
}) {
  const base = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 ${
    size === "lg" ? "px-7 py-4 text-base" : "px-5 py-3 text-sm"
  }`;
  if (variant === "outline") {
    return (
      <Link
        to={to}
        search={to === "/auth" ? ({ mode: "signup" as const, redirect: "/creer-boutique" }) : undefined}
        className={`${base} border-2 bg-transparent`}
        style={{ borderColor: PURPLE, color: PURPLE }}
      >
        {children}
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }
  return (
    <Link
      to={to}
      search={to === "/auth" ? ({ mode: "signup" as const, redirect: "/creer-boutique" }) : undefined}
      className={`${base} text-white shadow-lg hover:shadow-xl`}
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
    desc: "Lance ta boutique professionnelle sans coder, depuis ton téléphone.",
  },
  {
    icon: Smartphone,
    image: featureMomo.url,
    title: "Mobile Money intégré",
    desc: "MTN MoMo, Moov et Wave acceptés nativement.",
  },
  {
    icon: PackageSearch,
    image: featureAlibaba.url,
    title: "Import depuis Alibaba",
    desc: "Trouve des produits gagnants en 1 clic.",
  },
];

const testimonials = [
  {
    name: "Kofi A.",
    city: "Cotonou, Bénin",
    initials: "KA",
    quote:
      "En 10 minutes ma boutique était en ligne. Mes clients paient en MTN MoMo sans problème !",
  },
  {
    name: "Aminata D.",
    city: "Abidjan, Côte d'Ivoire",
    initials: "AD",
    quote: "J'ai fait mes 50 premières ventes en 2 semaines grâce à AfriSell.",
  },
  {
    name: "Moussa S.",
    city: "Lomé, Togo",
    initials: "MS",
    quote: "Le système de closeurs m'a permis de vendre sans bouger de chez moi.",
  },
];

const steps = [
  { icon: Store, title: "Crée ton compte", desc: "Inscription gratuite en 2 minutes." },
  { icon: PlusCircle, title: "Ajoute tes produits", desc: "Photos, prix, stock — tout en FCFA." },
  { icon: Wallet, title: "Encaisse en Mobile Money", desc: "Tes clients paient, tu reçois directement." },
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
          <Link to="/" aria-label="AFRISELL accueil">
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
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-14 pt-14 sm:px-6 sm:pt-20 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:pt-24">
          <div className="text-center lg:text-left">
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
                style={{ backgroundImage: `linear-gradient(135deg, ${PURPLE}, #E52F07)` }}
              >
                encaisse en Mobile Money
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              AFRISELL te donne une boutique professionnelle, la gestion de tes commandes et les
              paiements MTN MoMo, Moov et Wave — en 5 minutes.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
              <CtaButton size="lg">Commencer gratuitement</CtaButton>
              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 px-7 py-4 text-base font-semibold transition-all hover:-translate-y-0.5"
                style={{ borderColor: PURPLE, color: PURPLE }}
              >
                Voir comment ça marche <ArrowRight className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              ✓ Sans carte bancaire · ✓ Sans engagement · ✓ Boutique en 5 min
            </p>
          </div>

          <div className="relative">
            <div
              className="pointer-events-none absolute inset-0 -z-10 rounded-full blur-3xl"
              style={{ background: `${PURPLE}18` }}
              aria-hidden="true"
            />
            <img
              src={heroDashboard}
              alt="Tableau de bord AFRISELL sur ordinateur portable et téléphone"
              width={1280}
              height={960}
              className="mx-auto w-full max-w-xl rounded border border-border bg-card shadow-xl"
            />
          </div>
        </div>

        {/* Social proof bar */}
        <div className="border-y border-border bg-muted/40">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-3 px-4 py-5 sm:flex-row sm:px-6 lg:px-8">
            <div className="flex gap-0.5" style={{ color: PURPLE }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="text-sm font-semibold text-foreground">
              Rejoignez +2 400 marchands africains qui vendent avec AFRISELL
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Pourquoi AFRISELL ?</h2>
          <p className="mt-3 text-muted-foreground">Tout ce qu'il te faut pour vendre, dans une seule app.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map((f) => {
            const isAlibaba = f.title === "Import depuis Alibaba";
            const cardClass =
              "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl";
            const inner = (
              <>
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
                <div className="flex flex-1 flex-col p-7">
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                  {isAlibaba && (
                    <a
                      href="https://www.alibaba.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 inline-flex w-fit items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-primary-foreground shadow-md transition hover:opacity-90"
                      style={{ background: "var(--brand-orange)" }}
                    >
                      Trouver des produits gagnants
                    </a>
                  )}
                </div>
              </>
            );
            return isAlibaba ? (
              <div key={f.title} className={cardClass}>{inner}</div>
            ) : (
              <Link key={f.title} to="/register" className={cardClass}>{inner}</Link>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-muted/40 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ils vendent déjà avec AFRISELL</h2>
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
          © {new Date().getFullYear()} AFRISELL. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
