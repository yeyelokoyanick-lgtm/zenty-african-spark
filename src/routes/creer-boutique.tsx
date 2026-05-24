import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Loader2, Sparkles, Store } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

const PURPLE = "#6B4BCC";

export const Route = createFileRoute("/creer-boutique")({
  head: () => ({
    meta: [
      { title: "Créer ma boutique — ZENTY" },
      {
        name: "description",
        content:
          "Lance ta boutique en ligne ZENTY en 5 minutes. Mobile Money, paiement à la livraison, gestion des commandes.",
      },
    ],
  }),
  component: CreateShopPage,
});

const CATEGORIES = [
  "Mode & Vêtements",
  "Beauté & Cosmétiques",
  "Électronique",
  "Maison & Décoration",
  "Alimentation",
  "Bijoux & Accessoires",
  "Sport & Loisirs",
  "Autre",
];

const COUNTRIES = ["Bénin", "Côte d'Ivoire", "Sénégal", "Togo", "Mali", "Burkina Faso", "Cameroun", "Niger", "Guinée"];

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

interface ShopForm {
  name: string;
  slug: string;
  category: string;
  description: string;
  logo: string;
  ownerName: string;
  phone: string;
  email: string;
  city: string;
  country: string;
}

function CreateShopPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ShopForm>({
    name: "",
    slug: "",
    category: CATEGORIES[0],
    description: "",
    logo: "",
    ownerName: "",
    phone: "",
    email: "",
    city: "",
    country: COUNTRIES[0],
  });

  // Require auth (with verified email)
  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth", search: { mode: "signup", redirect: "/creer-boutique" } });
    }
  }, [user, authLoading, navigate]);

  // Prefill from profile when signed-in
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      email: f.email || user.email || "",
      ownerName: f.ownerName || ((user.user_metadata?.full_name as string) ?? ""),
      phone: f.phone || ((user.user_metadata?.phone as string) ?? ""),
    }));
    supabase
      .from("profiles")
      .select("full_name, phone, city, country")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        setForm((f) => ({
          ...f,
          ownerName: f.ownerName || (data.full_name ?? ""),
          phone: f.phone || (data.phone ?? ""),
          city: f.city || (data.city ?? ""),
          country: data.country || f.country,
        }));
      });
  }, [user]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: "#6B4BCC" }} />
      </div>
    );
  }

  const update = <K extends keyof ShopForm>(k: K, v: ShopForm[K]) => {
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === "name" && (!f.slug || f.slug === slugify(f.name))) {
        next.slug = slugify(v as string);
      }
      return next;
    });
  };

  const onLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo trop lourd (max 2 Mo)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update("logo", reader.result as string);
    reader.readAsDataURL(file);
  };

  const canNext1 = form.name.trim().length >= 2 && form.slug.length >= 2 && form.category;
  const canNext2 = form.description.trim().length >= 10;
  const canSubmit =
    form.ownerName.trim().length >= 2 &&
    /^[0-9+\s-]{6,}$/.test(form.phone) &&
    form.city.trim().length >= 2;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const slug = slugify(form.slug || form.name);
      const payload = { ...form, slug, createdAt: new Date().toISOString() };
      if (typeof window !== "undefined") {
        const all = JSON.parse(localStorage.getItem("zenty.shops") || "[]");
        all.push(payload);
        localStorage.setItem("zenty.shops", JSON.stringify(all));
        localStorage.setItem("zenty.currentShop", JSON.stringify(payload));
      }
      toast.success("Ta boutique est en ligne !");
      navigate({ to: "/boutique/$slug", params: { slug } });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" aria-label="ZENTY accueil">
            <Logo />
          </Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Retour
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold"
            style={{ borderColor: `${PURPLE}40`, color: PURPLE, backgroundColor: `${PURPLE}10` }}
          >
            <Sparkles className="h-3.5 w-3.5" /> Gratuit · 5 minutes
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Crée ta boutique en ligne
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Quelques infos et tu reçois ta boutique professionnelle avec Mobile Money intégré.
          </p>
        </div>

        {/* Stepper */}
        <div className="mx-auto mt-8 flex max-w-md items-center justify-between">
          {[1, 2, 3].map((n, i) => (
            <div key={n} className="flex flex-1 items-center">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all"
                style={{
                  backgroundColor: step >= n ? PURPLE : "transparent",
                  color: step >= n ? "white" : undefined,
                  border: step >= n ? "none" : "1px solid hsl(var(--border))",
                }}
              >
                {step > n ? <Check className="h-4 w-4" /> : n}
              </div>
              {i < 2 && (
                <div
                  className="mx-2 h-0.5 flex-1 rounded-full"
                  style={{ backgroundColor: step > n ? PURPLE : "hsl(var(--border))" }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {step === 1 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Store className="h-4 w-4" style={{ color: PURPLE }} /> Étape 1 — Ta boutique
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border bg-muted">
                  {form.logo ? (
                    <img src={form.logo} alt="Logo boutique" className="h-full w-full object-cover" />
                  ) : (
                    <ImagePlus className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <Label htmlFor="logo" className="mb-1.5 block text-xs">Logo (optionnel)</Label>
                  <Input id="logo" type="file" accept="image/*" onChange={onLogo} />
                </div>
              </div>

              <div>
                <Label htmlFor="name" className="mb-1.5 block">Nom de la boutique *</Label>
                <Input
                  id="name"
                  placeholder="Ex : Awa Beauté"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  maxLength={50}
                />
              </div>

              <div>
                <Label htmlFor="slug" className="mb-1.5 block">Adresse de ta boutique *</Label>
                <div className="flex items-center rounded-md border border-input bg-transparent focus-within:ring-1 focus-within:ring-ring">
                  <span className="select-none border-r border-border px-3 py-2 text-sm text-muted-foreground">
                    zenty.app/boutique/
                  </span>
                  <input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => update("slug", slugify(e.target.value))}
                    className="h-9 flex-1 bg-transparent px-3 text-sm outline-none"
                    placeholder="awa-beaute"
                    maxLength={40}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="cat" className="mb-1.5 block">Catégorie *</Label>
                <select
                  id="cat"
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Sparkles className="h-4 w-4" style={{ color: PURPLE }} /> Étape 2 — Présente ta boutique
              </div>
              <div>
                <Label htmlFor="desc" className="mb-1.5 block">Description courte *</Label>
                <Textarea
                  id="desc"
                  placeholder="Décris ce que tu vends, ton univers, ce qui te rend unique..."
                  rows={5}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  maxLength={400}
                />
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {form.description.length}/400 — affichée en haut de ta boutique.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Check className="h-4 w-4" style={{ color: PURPLE }} /> Étape 3 — Tes coordonnées
              </div>
              <div>
                <Label htmlFor="owner" className="mb-1.5 block">Nom complet *</Label>
                <Input
                  id="owner"
                  placeholder="Ex : Awa Diop"
                  value={form.ownerName}
                  onChange={(e) => update("ownerName", e.target.value)}
                  maxLength={80}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="phone" className="mb-1.5 block">Téléphone (WhatsApp) *</Label>
                  <Input
                    id="phone"
                    placeholder="+229 90 00 00 00"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    maxLength={20}
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="mb-1.5 block">Email (optionnel)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="toi@email.com"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    maxLength={120}
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="city" className="mb-1.5 block">Ville *</Label>
                  <Input
                    id="city"
                    placeholder="Ex : Cotonou"
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    maxLength={60}
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="mb-1.5 block">Pays *</Label>
                  <select
                    id="country"
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                En créant ta boutique, tu acceptes les conditions d'utilisation de ZENTY. Tu peux modifier ces infos à tout moment depuis ton tableau de bord.
              </p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4" /> Précédent
            </Button>

            {step < 3 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={(step === 1 && !canNext1) || (step === 2 && !canNext2)}
                className="text-white"
                style={{ backgroundColor: PURPLE }}
              >
                Suivant <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={submit}
                disabled={!canSubmit || submitting}
                className="text-white"
                style={{ backgroundColor: PURPLE }}
              >
                {submitting ? "Création..." : "Créer ma boutique"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Déjà une boutique ?{" "}
          <Link to="/dashboard" className="font-semibold" style={{ color: PURPLE }}>
            Va à ton tableau de bord
          </Link>
        </p>
      </main>
    </div>
  );
}
