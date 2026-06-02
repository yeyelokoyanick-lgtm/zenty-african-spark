import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Search, Sparkles, TrendingUp, Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/zenty/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { fcfa } from "@/components/zenty/format";
import { toast } from "sonner";

export const Route = createFileRoute("/import-alibaba")({
  head: () => ({
    meta: [
      { title: "Importer depuis Alibaba — ZENTY" },
      {
        name: "description",
        content:
          "Trouve des produits gagnants sur Alibaba et ajoute-les à ta boutique ZENTY en un clic.",
      },
      { property: "og:title", content: "Importer depuis Alibaba — ZENTY" },
      {
        property: "og:description",
        content: "Importe des produits tendance et lance tes ventes immédiatement.",
      },
    ],
  }),
  component: ImportAlibabaPage,
});

const PLACEHOLDER_IMG =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80";

const trending = [
  {
    name: "Casque Bluetooth Pro",
    supplier: 4200,
    selling: 18000,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Montre Connectée Sport",
    supplier: 6500,
    selling: 25000,
    image:
      "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Sac à Dos Urbain",
    supplier: 5000,
    selling: 19500,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Chaussures Sneakers",
    supplier: 7800,
    selling: 27000,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Parfum Oriental 100ml",
    supplier: 3500,
    selling: 15000,
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Téléphone Smartphone 6.5\"",
    supplier: 32000,
    selling: 75000,
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
  },
];

function ImportAlibabaPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showResult, setShowResult] = useState(false);

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Entre un lien ou un mot-clé pour analyser.");
      return;
    }
    setShowResult(true);
  };

  const handleAddToProducts = (name: string) => {
    toast.success(`"${name}" ajouté à tes produits`);
    navigate({ to: "/produits" });
  };

  return (
    <AppShell>
      <PageHeader
        title="Importer depuis Alibaba"
        subtitle="Trouve des produits gagnants et ajoute-les à ta boutique en 1 clic"
      />

      {/* Step 1 */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: "var(--brand-orange)" }}
          >
            1
          </span>
          <h2 className="text-lg font-semibold">Recherche de produit</h2>
        </div>
        <form onSubmit={handleAnalyze} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Colle le lien Alibaba ou tape un mot-clé..."
              className="pl-9"
            />
          </div>
          <Button
            type="submit"
            className="text-primary-foreground shadow-md"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Sparkles className="h-4 w-4" /> Analyser
          </Button>
        </form>
      </section>

      {/* Step 2 */}
      {showResult && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: "var(--brand-purple)" }}
            >
              2
            </span>
            <h2 className="text-lg font-semibold">Résultat de l'analyse</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-[280px_1fr]">
            <div className="aspect-square overflow-hidden rounded-xl border border-border bg-muted">
              <img
                src={PLACEHOLDER_IMG}
                alt="Casque Bluetooth Sans Fil Pro"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <h3 className="text-xl font-bold text-foreground">
                Casque Bluetooth Sans Fil Pro
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Casque audio sans fil haute qualité avec réduction de bruit active,
                autonomie 30h et son immersif. Idéal pour les longs trajets et le télétravail.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-muted/40 p-3">
                  <div className="text-xs text-muted-foreground">Prix fournisseur</div>
                  <div className="mt-1 text-lg font-semibold">{fcfa(4200)}</div>
                </div>
                <div className="rounded-xl border border-border bg-muted/40 p-3">
                  <div className="text-xs text-muted-foreground">Prix de vente suggéré</div>
                  <div className="mt-1 text-lg font-semibold">{fcfa(18000)}</div>
                </div>
                <div className="rounded-xl border border-border bg-muted/40 p-3">
                  <div className="text-xs text-muted-foreground">Marge estimée</div>
                  <div className="mt-1">
                    <Badge className="bg-emerald-500 text-white hover:bg-emerald-500">
                      {fcfa(13800)}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={() => handleAddToProducts("Casque Bluetooth Sans Fil Pro")}
                  className="text-primary-foreground shadow-md"
                  style={{ background: "var(--brand-purple)" }}
                >
                  <Plus className="h-4 w-4" /> Ajouter à mes produits
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Step 3 */}
      <section className="mt-8">
        <div className="mb-4 flex items-center gap-2">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ background: "var(--brand-blue)" }}
          >
            3
          </span>
          <h2 className="text-lg font-semibold">Produits tendance</h2>
          <Badge variant="secondary" className="ml-1 gap-1">
            <TrendingUp className="h-3 w-3" /> Top ventes Afrique
          </Badge>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trending.map((p) => {
            const margin = p.selling - p.supplier;
            return (
              <div
                key={p.name}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <h3 className="text-base font-semibold text-foreground">{p.name}</h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Fournisseur</div>
                      <div className="font-semibold text-foreground">{fcfa(p.supplier)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Vente suggérée</div>
                      <div className="font-semibold text-foreground">{fcfa(p.selling)}</div>
                    </div>
                  </div>
                  <Badge className="w-fit bg-emerald-500 text-white hover:bg-emerald-500">
                    Marge {fcfa(margin)}
                  </Badge>
                  <Button
                    variant="outline"
                    className="mt-auto"
                    onClick={() => handleAddToProducts(p.name)}
                  >
                    <Plus className="h-4 w-4" /> Importer ce produit
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          Tu veux explorer plus de produits ?{" "}
          <Link to="/produits" className="font-medium text-foreground underline">
            Voir mes produits
          </Link>
        </div>
      </section>
    </AppShell>
  );
}